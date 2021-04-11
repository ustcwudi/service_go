package exception

import (
	"fmt"
	"lib/define"
	"lib/log"
	"net/http"
	"runtime"

	"github.com/gin-gonic/gin"
)

// Middleware gin中间件
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {

				log.Error(err)
				printStack()

				var (
					message   string
					exception *define.Exception
					ok        bool
				)
				if message, ok = err.(string); ok {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    define.Error,
						"message": "service error: " + message,
					})
					return
				} else if exception, ok = err.(*define.Exception); ok {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    exception.Code,
						"message": exception.Message,
					})
					return
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    define.Error,
						"message": "system error",
					})
					return
				}
			}
		}()
		c.Next()
	}
}

func printStack() {
	var buf [4096]byte
	n := runtime.Stack(buf[:], false)
	fmt.Print(string(buf[:n]))
}
