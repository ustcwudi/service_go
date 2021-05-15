package award

import (
	"service/misc"
	"service/mongo"

	"bytes"
	"fmt"
	"lib/define"
	lib_util "lib/util"
	"net/http"
	"net/url"
	"strings"
	"text/template"
	"time"

	"github.com/gin-gonic/gin"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	portal := api.Group("/award")
	{
		portal.GET("/display/:id", Display)
		portal.GET("/search/:id", Search)
		portal.GET("/display_list/:type/:ids/:id", DisplayList)
	}
}

// setValue 设置奖状参数，如果存在则不覆盖
func setValue(parameter *map[string]string, key string, value *string) {
	if _, exist := (*parameter)[key]; !exist && value != nil {
		(*parameter)[key] = *value
	}
}

// Display 显示奖状
func Display(c *gin.Context) {
	m, _ := mongo.FindOneAwardByID(c.Param("id"), nil)
	t, _ := mongo.FindOneTemplateByID(m.Template.Hex(), nil)
	// 获取姓名
	setValue(&m.Parameter, "姓名", m.Name)
	// 获取证号
	setValue(&m.Parameter, "证号", m.Code)
	// 获取单位
	h, _ := mongo.FindOneSchoolByID(m.School.Hex(), nil)
	setValue(&m.Parameter, "单位", &h.Name)
	// 获取日期
	now := time.Unix(m.CreateTime/1e9, 0)
	year := now.Year()
	month := now.Month()
	day := now.Day()
	dateString := fmt.Sprintf("%d年%d月%d日", year, month, day)
	setValue(&m.Parameter, "日期", &dateString)
	tmpl, _ := template.New("").Parse(string(t.Content))
	var buffer bytes.Buffer
	tmpl.Execute(&buffer, m.Parameter)
	misc.OutputPdf(c, t.Width, t.Height, t.Background, []string{buffer.String()})
}

// DisplayList 显示奖状列表
func DisplayList(c *gin.Context) {
	var r define.Result
	// 解析模板
	t, _ := mongo.FindOneTemplateByID(c.Param("id"), nil)
	tmpl, _ := template.New("").Parse(string(t.Content))
	// 增加模板参数
	now := time.Unix(t.CreateTime/1e9, 0)
	year := now.Year()
	month := now.Month()
	day := now.Day()
	h, _ := mongo.FindOneSchoolByID(t.School.Hex(), nil)
	// 解析id列表
	var texts []string
	ids := strings.Split(c.Param("ids"), ",")
	for _, mid := range ids {
		m, _ := mongo.FindOneAwardByID(mid, nil)
		if m.Template.Hex() == c.Param("id") {
			setValue(&m.Parameter, "姓名", m.Name)
			setValue(&m.Parameter, "证号", m.Code)
			setValue(&m.Parameter, "单位", &h.Name)
			dateString := fmt.Sprintf("%d年%d月%d日", year, month, day)
			setValue(&m.Parameter, "日期", &dateString)
			var buffer bytes.Buffer
			tmpl.Execute(&buffer, m.Parameter)
			texts = append(texts, buffer.String())
		} else {
			c.JSON(http.StatusOK, r.SetCode(define.LogicError).SetMessage("模板不统一"))
			return
		}
	}
	if len(texts) > 0 {
		if c.Param("type") == "0" {
			misc.OutputPdf(c, t.Width, t.Height, "", texts)
		} else {
			misc.OutputPdf(c, t.Width, t.Height, t.Background, texts)
		}
	}
}

// Search 查询奖证
func Search(c *gin.Context) {
	var result define.Result
	where := make(map[string]interface{})
	// 提取查询条件
	if c.Request.URL.RawQuery != "" {
		query := strings.Split(c.Request.URL.RawQuery, "&")
		for _, line := range query {
			pair := strings.Split(line, "=")
			if len(pair) == 2 {
				key, _ := url.QueryUnescape(pair[0])
				query, _ := url.QueryUnescape(pair[1])
				where["parameter."+key] = query
			} else {
				c.JSON(http.StatusOK, result.SetCode(define.FormatError))
				return
			}
		}
		if len(query) > 0 {
			where["deleteTime"] = 0
			where["table"] = lib_util.ToID(c.Param("id"))
			list, _ := mongo.FindManyAward(where, nil)
			c.JSON(http.StatusOK, result.SetData(list))
			return
		}
	}
	c.JSON(http.StatusOK, result.SetCode(define.LogicError))
}
