package util

import (
	"lib/define"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mojocn/base64Captcha"
)

var store = base64Captcha.DefaultMemStore

// GetCaptcha 获取验证码ID
// @summary 获取验证码ID
// @tags captcha
// @produce json
// @success 200 {object} interface{}
// @router /api/captcha [get]
func GetCaptcha(c *gin.Context) {
	cp := base64Captcha.NewCaptcha(base64Captcha.DefaultDriverDigit, store)
	id, b64, err := cp.Generate()
	var r define.Result
	if err == nil {
		r.SetData(map[string]interface{}{"id": id, "image": b64})
		c.JSON(http.StatusOK, r)
	}
}

// Verify 验证
func VerifyCaptcha(id string, value string) bool {
	return store.Verify(id, value, false)
}
