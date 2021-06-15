package user

import (
	"lib/auth"
	"lib/config"
	"lib/define"
	"lib/util"

	"service/model"
	"service/mongo"

	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// RoutePortal portal路由
func RoutePortal(router *gin.Engine) {
	api := router.Group("/api")
	portal := api.Group("/user")
	{
		portal.POST("/login", Login)
		portal.POST("/login_phone", LoginPhone)
		portal.POST("/register", Register)
		portal.POST("/forget", Forget)

		portal.GET("/info", auth.CheckLogin, Info)
		portal.POST("/update_password", auth.CheckLogin, UpdatePassword)
		portal.POST("/logout", auth.CheckLogin, Logout)
	}
}

// LoginForm 登录表单
type LoginForm struct {
	ID       string `json:"id"`
	Account  string `binding:"required,AccountValid"`
	Password string `binding:"required,PasswordValid"`
	Captcha  string
	Remember bool
}

// Login 登录
// @summary 登录
// @tags user
// @produce json
// @param data body LoginForm true "data"
// @success 200 {object} interface{}
// @router /api/user/login [post]
func Login(c *gin.Context) {
	var form LoginForm
	var r define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, r.SetCode(define.FormatError))
		return
	}
	if !config.Service.Captcha || util.VerifyCaptcha(form.ID, form.Captcha) {
		if m, err := mongo.FindOneUser(bson.M{"account": bson.M{"$eq": form.Account}}, nil); err == nil {
			if m.Password == util.HashString(form.Password+config.Service.Security.Salt) {
				_ = auth.Login(c, m.ID.Hex(), form.Remember)
				c.Set("current", m)
				linkData(c, ids([]model.User{*m}), &r)
				c.JSON(http.StatusOK, r.SetData(m).SetMessage("登录成功"))
			} else {
				c.JSON(http.StatusOK, r.SetCode(define.AuthError).SetMessage("账号密码错误"))
			}
		} else {
			c.JSON(http.StatusOK, r.SetCode(define.DatabaseError).SetMessage("账号密码错误"))
		}
	} else {
		c.JSON(http.StatusOK, r.SetCode(define.AuthError).SetMessage("验证码错误"))
	}
}

// LoginPhoneForm 手机登录表单
type LoginPhoneForm struct {
	Phone    string `binding:"required"`
	Remember bool
}

// LoginPhone 手机登录
// @summary 手机登录
// @tags user
// @produce json
// @param data body LoginPhoneForm true "data"
// @success 200 {object} interface{}
// @router /api/user/login_phone [post]
func LoginPhone(c *gin.Context) {
	var form LoginPhoneForm
	var r define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, r.SetCode(define.FormatError))
		return
	}
	if m, err := mongo.FindOneUser(bson.M{"phone": bson.M{"$eq": form.Phone}}, nil); err == nil {
		_ = auth.Login(c, m.ID.Hex(), form.Remember)
		c.Set("current", m)
		linkData(c, ids([]model.User{*m}), &r)
		c.JSON(http.StatusOK, r.SetData(m).SetMessage("登录成功"))
	} else {
		c.JSON(http.StatusOK, r.SetCode(define.DatabaseError))
	}
}

// RegisterForm 注册表单
type RegisterForm struct {
	ID         string `json:"id" binding:"required"`
	Account    string `binding:"required,AccountValid"`
	Password   string `binding:"required,PasswordValid"`
	RePassword string `json:"re_password" binding:"eqfield=Password"`
	Captcha    string `binding:"required"`
	Agree      bool
}

// Register 注册
// @summary 注册
// @tags user
// @produce json
// @param data body RegisterForm true "data"
// @success 200 {object} interface{}
// @router /api/user/register [post]
func Register(c *gin.Context) {
	var form RegisterForm
	var r define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, r.SetCode(define.FormatError))
		return
	}
	if !config.Service.Captcha || util.VerifyCaptcha(form.ID, form.Captcha) {
		var m model.User
		m.Account = form.Account
		m.Avatar = "/static/avatar/" + strconv.FormatInt(time.Now().Unix()%10+1, 10) + ".png"
		m.Enable = true
		if _, err := mongo.InsertOneUser(&m); err == nil {
			c.JSON(http.StatusOK, r.SetData(m).SetMessage("注册成功"))
		} else {
			c.JSON(http.StatusOK, r.SetCode(define.DatabaseError))
		}
	} else {
		c.JSON(http.StatusOK, r.SetCode(define.AuthError).SetMessage("验证码错误"))
	}
}

// ForgetForm 忘记密码表单
type ForgetForm struct {
	ID      string `json:"id" binding:"required"`
	Account string `binding:"required,AccountValid"`
	Phone   string `binding:"required,PhoneValid"`
	Captcha string `binding:"required"`
}

// Forget 忘记密码
// @summary 忘记密码
// @tags user
// @produce json
// @param data body ForgetForm true "data"
// @success 200 {object} interface{}
// @router /api/user/forget [post]
func Forget(c *gin.Context) {
	var form ForgetForm
	var r define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, r.SetCode(define.FormatError))
		return
	}
	if !config.Service.Captcha || util.VerifyCaptcha(form.ID, form.Captcha) {
		c.JSON(http.StatusOK, r.SetData(form).SetMessage("密码已重置"))
	} else {
		c.JSON(http.StatusOK, r.SetCode(define.AuthError).SetMessage("验证码错误"))
	}
}

// UpdatePasswordForm 修改密码表单
type UpdatePasswordForm struct {
	ID          string `json:"id" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,PasswordValid"`
	OldPassword string `json:"old_password" binding:"required,PasswordValid"`
	RePassword  string `json:"re_password" binding:"eqfield=OldPassword"`
	Captcha     string `binding:"required"`
}

// UpdatePassword 修改密码
// @summary 修改密码
// @tags user
// @produce json
// @param data body UpdatePasswordForm true "data"
// @success 200 {object} interface{}
// @router /api/user/update_password [post]
func UpdatePassword(c *gin.Context) {
	var form UpdatePasswordForm
	var r define.Result
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusOK, r.SetCode(define.FormatError))
		return
	}
	if !config.Service.Captcha || util.VerifyCaptcha(form.ID, form.Captcha) {
		if currentUser, err := mongo.FindOneUserByID(c.MustGet("id").(string), nil); err == nil {
			if currentUser.Password == util.HashString(form.OldPassword+config.Service.Security.Salt) {
				if _, err := mongo.UpdateOneUser(bson.M{"_id": currentUser.ID}, bson.M{"password": util.HashString(form.NewPassword + config.Service.Security.Salt)}); err == nil {
					c.JSON(http.StatusOK, r.SetData(currentUser).SetMessage("修改成功"))
				} else {
					c.JSON(http.StatusOK, r.SetCode(define.DatabaseError))
				}
			} else {
				c.JSON(http.StatusOK, r.SetCode(define.AuthError).SetMessage("密码错误"))
			}
		}
	} else {
		c.JSON(http.StatusOK, r.SetCode(define.AuthError).SetMessage("验证码错误"))
	}
}

// Info 个人信息
// @summary 个人信息
// @tags user
// @produce json
// @success 200 {object} interface{}
// @router /api/user/info [get]
func Info(c *gin.Context) {
	var r define.Result
	if m, err := mongo.FindOneUserByID(c.MustGet("id").(string), nil); err == nil {
		linkData(c, ids([]model.User{*m}), &r)
		c.JSON(http.StatusOK, r.SetData(m))
	} else {
		c.JSON(http.StatusOK, r.SetCode(define.DatabaseError))
	}
}

// Logout 注销
// @summary 注销
// @tags user
// @produce json
// @success 200 {object} interface{}
// @router /api/user/logout [post]
func Logout(c *gin.Context) {
	var r define.Result
	auth.Logout(c)
	c.JSON(http.StatusOK, r.SetCode(define.Success))
}
