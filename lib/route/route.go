package route

import (
	"lib/config"
	"lib/exception"
	"lib/log"
	"lib/util"
	"net/http"
	"os"

	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

// Callback 权限检查回调函数
type Callback func(*gin.Engine)

// InitRouter init router
func InitRouter(callback Callback) *gin.Engine {
	router := gin.New()
	// 静态目录
	if _, err := os.Stat("./static"); err == nil {
		router.Static("/static", "./static")
	}
	// html模板
	router.LoadHTMLGlob(config.Service.Template.Path + "/*")
	// 性能分析工具
	if config.Service.Debug {
		pprof.Register(router)
	}
	// 中间件
	router.Use(func(c *gin.Context) {
		c.Next()
		if trigger, exist := c.Get("trigger"); exist {
			trigger := trigger.([]gin.HandlerFunc)
			for _, process := range trigger {
				process(c)
			}
		}
	})
	router.Use(log.Middleware())
	router.Use(exception.Middleware())

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "找不到该路径",
		})
	})
	router.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "找不到该方法",
		})
	})

	callback(router)

	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		_ = v.RegisterValidation("AccountValid", util.AccountValid)
		_ = v.RegisterValidation("PageValid", util.PageValid)
		_ = v.RegisterValidation("PasswordValid", util.PasswordValid)
		_ = v.RegisterValidation("PhoneValid", util.PhoneValid)
	} else {
		log.Error("binding validator error")
	}
	return router
}
