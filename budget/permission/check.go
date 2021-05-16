package permission

import (
	"net/http"
	"service/model"
	"service/mongo"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// GetCurrentUser 获取当前用户
func GetCurrentUser(c *gin.Context) *model.User {
	if current, exist := c.Get("current"); exist {
		return current.(*model.User)
	} else {
		if uid, exist := c.Get("id"); exist {
			if current, err := mongo.FindOneUserByID(uid.(string), nil); err == nil {
				if current.Role != nil {
					if _, exist := RoleCache[current.Role.Hex()]; exist {
						c.Set("current", current)
						return current
					}
				}
			}
		}
	}
	return nil
}

// Aspect 切面
func Aspect(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if current := GetCurrentUser(c); current != nil {
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

// GetRestrictQuery 获取查询限制
func GetRestrictQuery(c *gin.Context, table string) bson.M {
	if current := GetCurrentUser(c); current != nil {
		if queryField, exist := QueryFieldCache[current.Role.Hex()+table]; exist {
			projection := make(bson.M)
			for _, value := range queryField {
				projection[value] = 0
			}
			return projection
		}
	}
	return nil
}

// restrict 访问限制
func restrict(c *gin.Context, table string, action string) bool {
	if current := GetCurrentUser(c); current != nil {
		if set, exist := ActionCache[current.Role.Hex()+table]; exist {
			if forbidden, exist := set[action]; exist {
				return forbidden
			}
		}
		_, existWhere := c.Get("where")
		data, existData := c.Get("data")
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
		return true
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
