package template

import (
	"service/misc"
	"service/mongo"

	"github.com/gin-gonic/gin"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	user := api.Group("/template")
	{
		user.GET("/display/:id", Display)
	}
}

// Display 显示模板
func Display(c *gin.Context) {
	m, _ := mongo.FindOneTemplateByID(c.Param("id"), nil)
	misc.OutputPdf(c, m.Width, m.Height, m.Background, []string{m.Content})
}
