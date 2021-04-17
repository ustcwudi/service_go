package api

import (
	"lib/util"

	{{- range $i, $v := .PackageList}}
	"service/api/{{$v}}"
	{{- end}}

	"github.com/gin-gonic/gin"
)

// Route 路由
func Route(router *gin.Engine) {
	captcha := router.Group("/api/captcha")
	{
		captcha.GET("", util.GetCaptcha)
	}
	{{- range $i, $v := .PathList}}
	{{$v}}
	{{- end}}
}
