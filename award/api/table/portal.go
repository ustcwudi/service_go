package table

import (
	"lib/auth"
	"lib/define"
	"lib/storage"

	"service/misc"
	"service/model"
	"service/mongo"

	"bytes"
	"net/http"
	"path"
	"strings"
	"text/template"
	"time"

	"github.com/360EntSecGroup-Skylar/excelize/v2"
	"github.com/gin-gonic/gin"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	user := api.Group("/table")
	{
		user.GET("/display/:type/:id", auth.CheckLogin, Display)
		user.GET("/import/:audit/:id", auth.CheckLogin, Import)
		user.GET("/info/:id", auth.CheckLogin, Info)
	}
}

// Display 套打输出
func Display(c *gin.Context) {
	m, _ := mongo.FindOneTableByID(c.Param("id"), nil)
	t, _ := mongo.FindOneTemplateByID(m.Template.Hex(), nil)
	tmpl, _ := template.New("").Parse(string(t.Content))
	var texts []string
	// downlaod excel
	if m.File != "" {
		_, file := path.Split(m.File)
		reader, _ := storage.Download("table-file", file)
		f, _ := excelize.OpenReader(reader)
		matrix, _ := f.GetRows(f.GetSheetName((0)))
		var title []string
		for x, row := range matrix {
			data := make(map[string]string)
			if x > 0 {
				for y, cell := range row {
					cell = strings.ReplaceAll(cell, "\n", "")
					data[title[y]] = cell
				}
				var buffer bytes.Buffer
				tmpl.Execute(&buffer, data)
				texts = append(texts, buffer.String())
			} else {
				title = row
			}
		}
		defer reader.Close()
	}
	// 生成pdf
	if len(texts) > 0 {
		if c.Param("type") == "0" {
			misc.OutputPdf(c, t.Width, t.Height, "", texts)
		} else {
			misc.OutputPdf(c, t.Width, t.Height, t.Background, texts)
		}
	} else {
		var result define.Result
		c.JSON(http.StatusOK, result.SetCode(define.LogicError))
	}
}

// Import 数据导入
func Import(c *gin.Context) {
	m, _ := mongo.FindOneTableByID(c.Param("id"), nil)
	me, err := mongo.FindOneUserByID(c.MustGet("id").(string), nil)
	// downlaod excel
	if m.File != "" && err == nil {
		_, file := path.Split(m.File)
		reader, _ := storage.Download("table-file", file)
		f, _ := excelize.OpenReader(reader)
		matrix, _ := f.GetRows(f.GetSheetName((0)))
		var title []string
		var awards []model.Award
		for x, row := range matrix {
			data := make(map[string]string)
			if x > 0 {
				for y, cell := range row {
					cell = strings.ReplaceAll(cell, "\n", "")
					data[title[y]] = cell
				}
				var award model.Award
				if c.Param("audit") == "1" {
					award.Audit = true
				} else {
					award.Audit = false
				}
				award.Auditor = &me.Name
				award.Template = m.Template
				award.Table = &m.ID
				award.Issuer = me.ID
				award.Parameter = data
				award.School = m.School
				if name, exist := award.Parameter["姓名"]; exist {
					award.Name = &name
					delete(award.Parameter, "姓名")
				} else {
					award.Name = nil
				}
				if code, exist := award.Parameter["学号"]; exist {
					award.Code = &code
					delete(award.Parameter, "学号")
				} else {
					if code, exist := award.Parameter["证号"]; exist {
						award.Code = &code
						delete(award.Parameter, "证号")
					} else {
						award.Code = nil
					}
				}
				if class, exist := award.Parameter["班级"]; exist {
					award.Class = &class
					delete(award.Parameter, "班级")
				} else {
					if class, exist := award.Parameter["班组"]; exist {
						award.Class = &class
						delete(award.Parameter, "班组")
					} else {
						award.Class = nil
					}
				}
				award.CreateTime = time.Now().UnixNano()
				awards = append(awards, award)
			} else {
				title = row
			}
		}
		var result define.Result
		if len(awards) > 0 {
			r, _ := mongo.InsertManyAward(&awards)
			c.JSON(http.StatusOK, result.SetData(r))
		} else {
			var result define.Result
			c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
		}
		defer reader.Close()
	}
}

// Info 报表信息
func Info(c *gin.Context) {
	var result define.Result
	if m, err := mongo.FindOneTableByID(c.Param("id"), nil); err == nil {
		c.JSON(http.StatusOK, result.SetData(map[string]interface{}{"table": m.Name, "search": m.Search}))
	} else {
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}
