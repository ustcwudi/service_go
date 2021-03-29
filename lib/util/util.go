package util

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

// HashString 字符串hash加密
func HashString(data string) string {
	encryption := sha256.New()
	encryption.Write([]byte(data))
	return hex.EncodeToString(encryption.Sum([]byte(nil)))
}

// Hash 字节hash加密
func Hash(data []byte) string {
	encryption := sha256.New()
	encryption.Write(data)
	return hex.EncodeToString(encryption.Sum([]byte(nil)))
}

// Split 转义分割字符串
func Split(text string, sep string) []string {
	if strings.Contains(text, "\\"+sep) {
		// 处理转义
		span := strings.ReplaceAll(text, "\\"+sep, "\u99aa")
		items := strings.Split(span, sep)
		for index, item := range items {
			items[index] = strings.ReplaceAll(item, "\u99aa", sep)
		}
		return items
	} else {
		return strings.Split(text, sep)
	}
}
