package restriction

import (
	"lib/define"
	"net/http"
	"service/permission"

	"github.com/gin-gonic/gin"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	portal := api.Group("/restriction")
	{
		portal.GET("/refresh_cache", RefreshCache)
	}
}

// RefreshCache 刷新缓存
// @summary 刷新缓存
// @tags restriction portal
// @produce json
// @success 200 {object} interface{}
// @router /api/restriction/refresh_cache [get]
func RefreshCache(c *gin.Context) {
	permission.FetchCache()
	var r define.Result
	c.JSON(http.StatusOK, r.SetCode(define.Success))
}
