package permission

import (
	"service/model"

	"github.com/gin-gonic/gin"
)

// Injections 注入函数列表
var Injections map[string]InjectFunc

// Func 注入函数
type InjectFunc func(*gin.Context, string, string)

func init() {
	if Injections == nil {
		Injections = make(map[string]InjectFunc)
		Injections["MyID"] = MyID
	}
}

// MyID 注入我的ID
func MyID(c *gin.Context, domain string, field string) {
	me := c.MustGet("current").(*model.User)
	if data, exist := c.Get(domain); exist {
		switch data := data.(type) {
		case map[string]interface{}:
			data[field] = me.ID
		case []map[string]interface{}:
			for _, element := range data {
				element[field] = me.ID
			}
		}
	}
}
