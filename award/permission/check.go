package permission

import (
	"lib/config"
	"net/http"
	"service/model"
	"service/mongo"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
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

// checkPermission 检查权限
func checkPermission(c *gin.Context, action string) bool {
	if current := getCurrentUser(c); current != nil {
		if current.Role != nil {
			if array, err := mongo.FindManyAuthority(bson.M{"role": *current.Role, "action": action}, nil); err == nil {
				if len(*array) > 0 {
					for _, aspect := range *array {
						// 设置注入函数
						if len(aspect.Injection) > 0 {
							for _, method := range aspect.Injection {
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
					return true
				}
			}
			return !config.Service.Auth
		}
	}
	return false
}

// Restrict 访问限制
func Restrict(table string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if current := getCurrentUser(c); current != nil {
			if current.Role != nil {
				if restrictions, err := mongo.FindManyRestriction(bson.M{"role": *current.Role, "table": table}, nil); err == nil {
					for _, access := range *restrictions {
						_, existWhere := c.Get("where")
						data, existData := c.Get("data")
						// 设置不可见字段
						if len(access.QueryField) > 0 {
							c.Set("field", access.QueryField)
						}
						// 设置禁止更改字段
						if len(access.UpdateField) > 0 && existWhere && existData {
							for _, field := range access.UpdateField {
								delete(data.(map[string]interface{}), field)
							}
						}
						// 设置禁止插入字段
						if len(access.InsertField) > 0 && !existWhere && existData {
							for _, field := range access.InsertField {
								delete(data.(map[string]interface{}), field)
							}
						}
					}
				}
			} else {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": "权限不足",
					"code":    401,
				})
				c.Abort()
			}
		}
	}
}

// CheckWebPermission 网页检查权限
func CheckWeb(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if checkPermission(c, action) {
			return
		}
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(200, `权限不足`)
		c.Abort()
	}
}

// CheckPermission 接口检查权限
func Check(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if checkPermission(c, action) {
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
