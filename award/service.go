package main

import (
	"lib/config"
	"lib/launch"
	_ "lib/log"
	"lib/route"
	_ "lib/schedule"

	"runtime"

	"service/api"
	_ "service/docs"

	"github.com/gin-gonic/gin"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/swaggo/gin-swagger/swaggerFiles"
)

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())

	if config.Service.Debug {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := route.InitRouter(Route)

	launch.Run(router)
}

// Route 总路由
func Route(r *gin.Engine) {
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	api.Route(r)
}
