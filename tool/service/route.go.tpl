package api

import (
	{{- range $i, $v := .PackageList}}
	"service/api/{{$v}}"
	{{- end}}

	"github.com/gin-gonic/gin"
)

// Route 路由
func Route(router *gin.Engine) {
	{{- range $i, $v := .PathList}}
	{{$v}}
	{{- end}}
}
