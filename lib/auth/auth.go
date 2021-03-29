package auth

import (
	"lib/config"
	"lib/log"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// CheckWebLogin 网页检查登录
func CheckWebLogin(c *gin.Context) {
	if !CheckJwt(c) {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(200, `用户未登录`)
		c.Abort()
	}
}

// CheckLogin 接口检查登录
func CheckLogin(c *gin.Context) {
	if !CheckJwt(c) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户未登录",
			"code":    401,
		})
		c.Abort()
	}
}

func CheckJwt(c *gin.Context) bool {
	// check jwt from cookie
	token, err := c.Cookie(config.Service.Jwt.Key)
	if err != nil {
		// check jwt from header
		token = c.Request.Header.Get("Authorization")
		if token == "" {
			return false
		}
	}

	tokenClaims, err := jwt.ParseWithClaims(token, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.Service.Jwt.Secret), nil
	})

	if err != nil {
		log.Error(err)
		return false
	}

	if claims, ok := tokenClaims.Claims.(*jwt.StandardClaims); ok && tokenClaims.Valid {
		c.Set("id", claims.Audience)
		return true
	}
	return false
}
