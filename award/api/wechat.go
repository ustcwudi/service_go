package api

import (
	"lib/auth"
	"lib/define"
	"lib/log"
	"lib/wechat"

	"service/model"
	"service/mongo"

	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// RouteWechat wechat
func RouteWechat(router *gin.Engine) {
	api := router.Group("/api")
	wechat := api.Group("/wechat")
	{
		wechat.GET("/login/:code", Login)
		user := wechat.Group("/user")
		{
			user.POST("/decrypt_phone", auth.CheckLogin, DecryptPhone)
			user.POST("/decrypt_user_info", auth.CheckLogin, DecryptUserInfo)
		}
	}
}

// Login 登录凭证校验
// @summary 登录凭证校验
// @tags wechat
// @produce json
// @success 200 {object} interface{}
// @Param code path string true "code"
// @router /api/wechat/login/{code} [get]
func Login(c *gin.Context) {
	var result define.Result
	response, err := wechat.Code2Session(c.Param("code"))
	if err != nil {
		log.Error(err.Error())
		c.JSON(http.StatusOK, result.SetCode(define.APIError))
		return
	}
	if user, err := mongo.FindOneUser(bson.M{"openIdentify": response["openid"]}, nil); err == nil {
		auth.Login(c, user.ID.Hex(), false)
		c.JSON(http.StatusOK, result.SetData(user))
	} else {
		if unionid, ok := response["unionid"]; ok {
			user := model.User{Account: response["openid"].(string), OpenIdentify: response["openid"].(string), UnionIdentify: unionid.(string), Enable: true}
			mongo.InsertOneUser(&user)
			auth.Login(c, user.ID.Hex(), false)
			c.JSON(http.StatusOK, result.SetData(user))

		} else {
			user := model.User{Account: response["openid"].(string), OpenIdentify: response["openid"].(string), Enable: true}
			mongo.InsertOneUser(&user)
			auth.Login(c, user.ID.Hex(), false)
			c.JSON(http.StatusOK, result.SetData(user))
		}
	}
}

// DecryptForm 请求解密表单
type DecryptForm struct {
	EncryptedData string
	Iv            string
}

// DecryptPhone 解密手机号
// @summary 解密手机号
// @tags wechat
// @produce json
// @success 200 {object} interface{}
// @param data body DecryptForm true "data"
// @router /api/wechat/user/decrypt_phone [post]
func DecryptPhone(c *gin.Context) {
	var form DecryptForm
	var result define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, result.SetCode(define.FormatError))
		return
	}
	if user, err := mongo.FindOneUserByID(c.MustGet("id").(string), nil); err == nil {
		response, err := wechat.Decrypt(form.EncryptedData, form.Iv, user.OpenIdentify)
		if err != nil {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.APIError))
			return
		}
		user.Phone = response["purePhoneNumber"].(string)
		mongo.UpdateOneUserByID(user)
		c.JSON(http.StatusOK, result.SetData(user.Phone))
	} else {
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}

// DecryptUserInfo 解密用户信息
// @summary 解密用户信息
// @tags wechat
// @produce json
// @success 200 {object} interface{}
// @param data body DecryptForm true "data"
// @router /api/wechat/user/decrypt_user_info [post]
func DecryptUserInfo(c *gin.Context) {
	var form DecryptForm
	var result define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, result.SetCode(define.FormatError))
		return
	}
	if user, err := mongo.FindOneUserByID(c.MustGet("id").(string), nil); err == nil {
		response, err := wechat.Decrypt(form.EncryptedData, form.Iv, user.OpenIdentify)
		if err != nil {
			log.Error(err.Error())
			c.JSON(http.StatusOK, result.SetCode(define.APIError))
			return
		}
		user.Name = response["nickName"].(string)
		user.Avatar = response["avatarUrl"].(string)
		switch response["gender"].(float64) {
		case 1:
			gender := true
			user.Gender = &gender
		case 2:
			gender := false
			user.Gender = &gender
		default:
			user.Gender = nil
		}
		user.City = response["city"].(string)
		user.Province = response["province"].(string)
		user.Country = response["country"].(string)
		mongo.UpdateOneUserByID(user)
		c.JSON(http.StatusOK, result.SetData(user))
	} else {
		c.JSON(http.StatusOK, result.SetCode(define.DatabaseError))
	}
}
