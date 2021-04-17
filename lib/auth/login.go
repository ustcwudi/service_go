package auth

import (
	"lib/config"
	"net/http"
	"os"
	"time"

	"github.com/gbrlsnchs/jwt/v3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Login 登录
func Login(c *gin.Context, uid string, remember bool) string {
	duration := 8 * time.Hour
	if remember {
		duration = time.Duration(config.Service.Jwt.Exp) * time.Hour
	}
	var key = jwt.NewHS256([]byte(config.Service.Jwt.Secret))
	host, _ := os.Hostname()
	now := time.Now()
	payload := jwt.Payload{
		Issuer:         host,
		Subject:        uid,
		ExpirationTime: jwt.NumericDate(now.Add(duration)),
		IssuedAt:       jwt.NumericDate(now),
		JWTID:          uuid.New().String(),
	}
	token, err := jwt.Sign(payload, key)

	if err != nil {
		panic(err)
	}
	// 设置cookie
	expire := 0
	if remember {
		expire = config.Service.Jwt.Exp * 3600
	}
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     config.Service.Jwt.Key,
		Value:    string(token),
		Path:     "/",
		HttpOnly: false,
		MaxAge:   expire,
	})
	return string(token)
}

// Logout 注销
func Logout(c *gin.Context) {
	c.SetCookie(config.Service.Jwt.Key, "", 0, "/", "", false, true)
}
