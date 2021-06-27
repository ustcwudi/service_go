package misc

import (
	"bufio"
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"io"
	"io/ioutil"
	"lib/log"
	"lib/storage"
	"os"
	"path"
	"service/mongo"
	"strconv"
	"strings"
	"time"

	"github.com/beevik/etree"
	"github.com/gin-gonic/gin"
	"github.com/unidoc/unipdf/v3/annotator"
	"github.com/unidoc/unipdf/v3/core"
	"github.com/unidoc/unipdf/v3/creator"
	pdf "github.com/unidoc/unipdf/v3/model"
	"github.com/unidoc/unipdf/v3/model/sighandler"
	"go.mongodb.org/mongo-driver/bson"
)

// 密钥
var key *rsa.PrivateKey

// 证书链
var cert []*x509.Certificate

func init() {
	_, err := os.Stat("/ssl/")
	if err == nil {
		key, cert = parseCert("/ssl/fullchain.cer", "/ssl/educ.cc.key")
	}
}

// OutputPdf 输出pdf
func OutputPdf(c *gin.Context, width float64, height float64, background string, texts []string) {
	maker := creator.New()
	maker.SetPageSize(creator.PageSize{width, height})
	// download image
	var bg *creator.Image
	fontMap := make(map[string]*pdf.PdfFont)
	if background != "" {
		_, file := path.Split(background)
		if reader, err := storage.Download("template-background", file); err == nil {
			stat, _ := reader.Stat()
			bytes := make([]byte, stat.Size)
			reader.Read(bytes)
			defer reader.Close()
			if bg, err = maker.NewImageFromData(bytes); err == nil {
				bg.ScaleToWidth(width)
				bg.ScaleToHeight(height)
			} else {
				log.Error(err)
				background = ""
			}
		} else {
			log.Error(err)
			background = ""
		}
	}
	// read xml template
	for _, text := range texts {
		doc := etree.NewDocument()
		if err := doc.ReadFromString(text); err != nil {
			log.Error(err)
			continue
		}
		maker.NewPage()
		if background != "" {
			bg.SetPos(0, 0)
			_ = maker.Draw(bg)
		}
		root := doc.Element
		for _, p := range root.SelectElements("p") {
			paragraph := maker.NewStyledParagraph()
			x, y := .0, .0
			align := "left"
			for _, attr := range p.Attr {
				switch attr.Key {
				case "x":
					x, _ = strconv.ParseFloat(attr.Value, 64)
				case "y":
					y, _ = strconv.ParseFloat(attr.Value, 64)
				case "width":
					w, _ := strconv.ParseFloat(attr.Value, 64)
					paragraph.SetWidth(w)
				case "line-height":
					h, _ := strconv.ParseFloat(attr.Value, 64)
					paragraph.SetLineHeight(h)
				case "align":
					align = attr.Value
				case "angle":
					angle, _ := strconv.ParseFloat(attr.Value, 64)
					paragraph.SetAngle(angle)
				case "wrap":
					paragraph.SetEnableWrap(true)
				}
			}
			paragraph.SetPos(x, y)
			switch align {
			case "center":
				paragraph.SetTextAlignment(creator.TextAlignmentCenter)
			case "right":
				paragraph.SetTextAlignment(creator.TextAlignmentRight)
			case "justify":
				paragraph.SetTextAlignment(creator.TextAlignmentJustify)
			default:
				paragraph.SetTextAlignment(creator.TextAlignmentLeft)
			}
			for _, span := range p.SelectElements("span") {
				content := strings.ReplaceAll(span.Text(), " ", "\u3000")
				content = strings.ReplaceAll(content, "\\n", "\n")
				chunk := paragraph.Append(content)
				for _, attr := range span.Attr {
					switch attr.Key {
					case "spacing":
						charSpacing, _ := strconv.ParseFloat(attr.Value, 64)
						chunk.Style.CharSpacing = charSpacing
					case "color":
						chunk.Style.Color = creator.ColorRGBFromHex(attr.Value)
					case "underline":
						chunk.Style.Underline = true
					case "underline-color":
						chunk.Style.UnderlineStyle.Color = creator.ColorRGBFromHex(attr.Value)
					case "underline-offset":
						offset, _ := strconv.ParseFloat(attr.Value, 64)
						chunk.Style.UnderlineStyle.Offset = offset
					case "underline-thickness":
						thickness, _ := strconv.ParseFloat(attr.Value, 64)
						chunk.Style.UnderlineStyle.Thickness = thickness
					case "font-size":
						fontSize, _ := strconv.ParseFloat(attr.Value, 64)
						chunk.Style.FontSize = fontSize
					case "font":
						pdfFont, fontExist := fontMap[attr.Value]
						if !fontExist {
							if f, err := mongo.FindOneFont(bson.M{"name": attr.Value}, nil); err == nil {
								_, file := path.Split(f.File)
								if _, err := os.Stat(file); err != nil {
									if os.IsNotExist(err) {
										reader, _ := storage.Download("font-file", file)
										defer reader.Close()
										localFile, _ := os.Create(file)
										io.Copy(localFile, reader)
									}
								}
								pdfFont, _ = pdf.NewCompositePdfFontFromTTFFile(file)
								fontMap[attr.Value] = pdfFont
							}
						}
						maker.EnableFontSubsetting(pdfFont)
						chunk.Style.Font = pdfFont
					}
				}
			}
			if err := maker.Draw(paragraph); err != nil {
				log.Error(err)
			}
		}
	}
	c.Writer.Header().Set("Content-Type", "application/pdf")
	if len(texts) > 1 {
		maker.Write(c.Writer)
	} else {
		var buffer bytes.Buffer
		maker.Write(bufio.NewWriter(&buffer))
		// 电子签章
		reader, _ := pdf.NewPdfReader(bytes.NewReader(buffer.Bytes()))
		appender, _ := pdf.NewPdfAppender(reader)
		handler, _ := sighandler.NewAdobePKCS7Detached(key, cert[0])
		signature := pdf.NewPdfSignature(handler)
		signature.SetName("e-Certificate")
		signature.SetReason("e-Certificate")
		signature.SetDate(time.Now(), "")
		signature.Initialize()
		opts := annotator.NewSignatureFieldOpts()
		opts.AutoSize = true
		field, _ := annotator.NewSignatureField(
			signature,
			[]*annotator.SignatureLine{},
			opts,
		)
		field.T = core.MakeString("e-Certificate")
		appender.Sign(1, field)
		// ltv
		ltv, _ := pdf.NewLTV(appender)
		ltv.EnableChain(cert)
		appender.Write(c.Writer)
	}
}

// 读取CA证书
func parseCert(crt, privateKey string) (*rsa.PrivateKey, []*x509.Certificate) {
	var certChain []*x509.Certificate
	issuerCertData, _ := ioutil.ReadFile(crt)
	for len(issuerCertData) != 0 {
		var block *pem.Block
		block, issuerCertData = pem.Decode(issuerCertData)
		if block == nil {
			break
		}

		issuer, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			log.Error(err)
		}
		certChain = append(certChain, issuer)
	}

	keyPemBlock, _ := ioutil.ReadFile(privateKey)
	keyDecodeBlock, _ := pem.Decode(keyPemBlock)
	key, _ := x509.ParsePKCS1PrivateKey(keyDecodeBlock.Bytes)

	return key, certChain
}
