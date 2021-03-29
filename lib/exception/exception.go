package exception

import (
	"fmt"
	"net/http"
	"runtime"
	"lib/log"

	"github.com/gin-gonic/gin"
)

// Exception 异常
type Exception struct {
	Code    uint16
	Message string
}

const (
	// SYSTEM 系统异常
	SYSTEM = iota
	// SERVICE 服务异常
	SERVICE = iota
)

func (e *Exception) Error() string {
	return fmt.Sprintf("%s[%d]", e.Message, e.Code)
}

// Middleware gin中间件
func Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {

				log.Error(err)
				printStack()

				var (
					message   string
					exception *Exception
					ok        bool
				)
				if message, ok = err.(string); ok {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    SERVICE,
						"message": "service error: " + message,
					})
					return
				} else if exception, ok = err.(*Exception); ok {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    exception.Code,
						"message": exception.Message,
					})
					return
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{
						"code":    SYSTEM,
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
	fmt.Printf(string(buf[:n]))
}
