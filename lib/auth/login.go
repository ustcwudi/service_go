package auth

import (
	"net/http"
	"os"
	"lib/config"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// Login 登录
func Login(c *gin.Context, uid string, remember bool) string {
	duration := 8 * time.Hour
	if remember {
		duration = time.Duration(config.Service.Jwt.Exp) * time.Hour
	}
	token := jwt.New(jwt.GetSigningMethod(config.Service.Jwt.Alg))
	// set jwt user info
	host, _ := os.Hostname()
	token.Claims = jwt.StandardClaims{
		Issuer:    host,
		Audience:  uid,
		ExpiresAt: time.Now().Add(duration).Unix(),
		IssuedAt:  time.Now().Unix(),
	}
	// Sign and get the complete encoded token as a string
	tokenString, err := token.SignedString([]byte(config.Service.Jwt.Secret))
	if err != nil {
		panic(err)
	}

	expire := 0
	if remember {
		expire = config.Service.Jwt.Exp * 3600
	}
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     config.Service.Jwt.Key,
		Value:    tokenString,
		Path:     "/",
		HttpOnly: false,
		MaxAge:   expire,
	})
	return tokenString
}

// Logout 注销
func Logout(c *gin.Context) {
	c.SetCookie(config.Service.Jwt.Key, "", 0, "/", "", false, true)
}
