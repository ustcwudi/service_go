package class

import (
	"lib/define"
	"net/http"
	"service/mongo"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	user := api.Group("/class")
	{
		user.GET("/phone/:phone", GetByPhone)
	}
}

// GetByPhone 根据班主任手机获取班级学生
func GetByPhone(c *gin.Context) {
	if model, err := mongo.FindOneClass(bson.M{"phone": c.Param("phone")}, nil); err == nil {
		var r define.Result
		students, _ := mongo.FindManyStudent(bson.M{"class": model.Name}, nil)
		c.JSON(http.StatusOK, r.SetData(students))
	}
}
