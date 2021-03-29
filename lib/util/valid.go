package util

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

// PageValid 页码格式
func PageValid(v validator.FieldLevel) bool {
	if num, ok := v.Field().Interface().(int); ok {
		if num <= 0 {
			return false
		}
	}
	return false
}

// AccountValid 账号格式
func AccountValid(v validator.FieldLevel) bool {
	if s, ok := v.Field().Interface().(string); ok {
		matched, _ := regexp.MatchString("^[a-zA-Z0-9_-]{3,20}$", s)
		return matched
	}
	return false
}

// PasswordValid 密码格式
func PasswordValid(v validator.FieldLevel) bool {
	if s, ok := v.Field().Interface().(string); ok {
		return len(s) > 3 && len(s) < 21
	}
	return false
}

// PhoneValid 手机号格式
func PhoneValid(v validator.FieldLevel) bool {
	if s, ok := v.Field().Interface().(string); ok {
		matched, _ := regexp.MatchString("^1[3-9]\\d{9}$", s)
		return matched
	}
	return false
}
