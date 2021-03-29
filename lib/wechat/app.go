package wechat

import (
	"lib/config"
	"lib/database/redis"
	"time"

	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
)

// Decrypt 解密
func Decrypt(encryptedData, iv, openIdentify string) (map[string]interface{}, error) {
	encryptedBytes, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return nil, err
	}
	ivBytes, err := base64.StdEncoding.DecodeString(iv)
	if err != nil {
		return nil, err
	}
	sessionKey, err := redis.Get("wechat:session_key", openIdentify)
	if err != nil {
		return nil, err
	}
	sessionKeyBytes, err := base64.StdEncoding.DecodeString(sessionKey)
	if err != nil {
		return nil, err
	}
	plainText := AesDecrypt(encryptedBytes, sessionKeyBytes, ivBytes)
	var result map[string]interface{}
	if err := json.Unmarshal(plainText, &result); err == nil {
		return result, nil
	}
	return nil, errors.New("decrypt failed")
}

// Code2Session 登录凭证校验
func Code2Session(code string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code", config.Service.Wechat.AppID, config.Service.Wechat.AppSecret, code)
	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode == 200 {
		if body, err := ioutil.ReadAll(response.Body); err == nil {
			var result map[string]interface{}
			if err := json.Unmarshal(body, &result); err == nil {
				if openid, ok := result["openid"]; ok {
					redis.Set("wechat:session_key", openid.(string), result["session_key"], 24*time.Hour)
					return result, nil
				} else if message, ok := result["errmsg"]; ok {
					return nil, errors.New(message.(string))
				}
				return nil, errors.New("wechat api result error")
			}
			return nil, err
		}
		return nil, err
	}
	return nil, errors.New("wechat api error: Code2Session")
}
