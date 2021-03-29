package api

import (
	"bytes"
	"lib/define"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/dchest/captcha"
	"github.com/gin-gonic/gin"
)

// GetCaptcha 获取验证码ID
// @summary 获取验证码ID
// @tags captcha
// @produce json
// @success 200 {object} interface{}
// @router /api/captcha [get]
func GetCaptcha(c *gin.Context) {
	id := captcha.NewLen(captcha.DefaultLen)
	var r define.Result
	r.SetData(id)
	c.JSON(http.StatusOK, r)
}

// GetCaptchaByID 获取验证码
func GetCaptchaByID(c *gin.Context) {
	serveHTTP(c.Writer, c.Request)
}

func serveHTTP(w http.ResponseWriter, r *http.Request) {
	dir, file := path.Split(r.URL.Path)
	ext := path.Ext(file)
	id := file[:len(file)-len(ext)]
	if ext == "" || id == "" {
		http.NotFound(w, r)
		return
	}
	if r.FormValue("reload") != "" {
		captcha.Reload(id)
	}
	lang := strings.ToLower(r.FormValue("lang"))
	download := path.Base(dir) == "download"
	if serve(w, r, id, ext, lang, download, captcha.StdWidth/2, captcha.StdHeight/2) == captcha.ErrNotFound {
		http.NotFound(w, r)
	}
}

func serve(w http.ResponseWriter, r *http.Request, id, ext, lang string, download bool, width, height int) error {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")

	var content bytes.Buffer
	switch ext {
	case ".png":
		w.Header().Set("Content-Type", "image/png")
		_ = captcha.WriteImage(&content, id, width, height)
	case ".wav":
		w.Header().Set("Content-Type", "audio/x-wav")
		_ = captcha.WriteAudio(&content, id, lang)
	default:
		return captcha.ErrNotFound
	}

	if download {
		w.Header().Set("Content-Type", "application/octet-stream")
	}
	http.ServeContent(w, r, id+ext, time.Time{}, bytes.NewReader(content.Bytes()))
	return nil
}
