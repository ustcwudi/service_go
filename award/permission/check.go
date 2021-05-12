package permission

import (
	"lib/config"
	"net/http"
	"service/model"
	"service/mongo"
	"strings"

	"github.com/gin-gonic/gin"
)

// getCurrentUser 获取当前用户
func getCurrentUser(c *gin.Context) *model.User {
	if current, exist := c.Get("current"); exist {
		return current.(*model.User)
	} else {
		uid := c.MustGet("id").(string)
		if current, err := mongo.FindOneUserByID(uid, nil); err == nil {
			c.Set("current", current)
			return current
		}
	}
	return nil
}

// Aspect 切面
func Aspect(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if current := getCurrentUser(c); current != nil {
			if current.Role != nil {
				if injections, exist := AspectCache[current.Role.Hex()+action]; exist {
					// 设置注入函数
					if len(injections) > 0 {
						for _, method := range injections {
							if index := strings.IndexRune(method, '='); index > 0 {
								field := method[:index]
								function := method[index+1:]
								dot := strings.IndexRune(method, '.')
								key := field[:dot]
								field = field[dot+1:]
								Injections[function](c, key, field)
							} else {
								Triggers[method](c)
							}
						}
					}
				}
			}
		}
	}
}

// restrict 访问限制
func restrict(c *gin.Context, table string, action string) bool {
	if current := getCurrentUser(c); current != nil {
		if current.Role != nil {
			_, existWhere := c.Get("where")
			data, existData := c.Get("data")
			if queryField, exist := QueryFieldCache[current.Role.Hex()+table]; exist {
				c.Set("field", queryField)
			}
			if updateField, exist := UpdateFieldCache[current.Role.Hex()+table]; exist && existWhere && existData {
				for _, field := range updateField {
					delete(data.(map[string]interface{}), field)
				}
			}
			if insertField, exist := InsertFieldCache[current.Role.Hex()+table]; exist && !existWhere && existData {
				for _, field := range insertField {
					delete(data.(map[string]interface{}), field)
				}
			}
			if set, exist := ActionCache[current.Role.Hex()+table]; exist {
				if pass, ok := set[action]; ok {
					return pass
				}
			}
			return !config.Service.Auth // Default true in blacklist mode, default false in whitelist mode.
		}
	}
	return false
}

// CheckWebPermission 网页检查权限
func CheckWeb(table string, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if restrict(c, table, action) {
			return
		}
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(200, `权限不足`)
		c.Abort()
	}
}

// CheckPermission 接口检查权限
func Check(table string, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if restrict(c, table, action) {
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "权限不足",
			"code":    401,
		})
		c.Abort()
	}
}
