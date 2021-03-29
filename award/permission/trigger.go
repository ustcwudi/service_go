package permission

import (
	"github.com/gin-gonic/gin"
)

// Injections 触发函数列表
var Triggers map[string]gin.HandlerFunc

func init() {
	if Triggers == nil {
		Triggers = make(map[string]gin.HandlerFunc)
	}
}
