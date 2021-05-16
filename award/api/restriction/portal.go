package restriction

import (
	"lib/auth"
	"lib/define"
	"net/http"
	"service/permission"
	"strings"

	"github.com/gin-gonic/gin"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	portal := api.Group("/restriction")
	{
		portal.GET("/refresh_cache", auth.CheckLogin, permission.Check("Restriction", "RefreshCache"), RefreshCache)
		portal.GET("/mine", auth.CheckLogin, permission.Check("Restriction", "Mine"), Mine)
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

// Mine 我的限制
// @summary 我的限制
// @tags restriction portal
// @produce json
// @success 200 {object} interface{}
// @router /api/restriction/mine [get]
func Mine(c *gin.Context) {
	var r define.Result
	current := permission.GetCurrentUser(c)
	prefix := current.Role.Hex()
	prefixLength := len(prefix)
	queryFieldMap := make(map[string][]string)
	for key, value := range permission.QueryFieldCache {
		if strings.HasPrefix(key, prefix) {
			queryFieldMap[key[prefixLength:]] = value
		}
	}
	updateFieldMap := make(map[string][]string)
	for key, value := range permission.UpdateFieldCache {
		if strings.HasPrefix(key, prefix) {
			updateFieldMap[key[prefixLength:]] = value
		}
	}
	insertFieldMap := make(map[string][]string)
	for key, value := range permission.InsertFieldCache {
		if strings.HasPrefix(key, prefix) {
			insertFieldMap[key[prefixLength:]] = value
		}
	}
	actionMap := make(map[string]map[string]bool)
	for key, value := range permission.ActionCache {
		if strings.HasPrefix(key, prefix) {
			actionMap[key[prefixLength:]] = value
		}
	}
	r.SetData(map[string]interface{}{"query": queryFieldMap, "update": updateFieldMap, "insert": insertFieldMap, "action": actionMap})
	c.JSON(http.StatusOK, r.SetCode(define.Success))
}
