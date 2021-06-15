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
	var result []string
	items := strings.Split(text, sep)
	for index, item := range items {
		if len(item) > 0 {
			if item[len(item)-1] == '\\' && len(items) > index+1 {
				items[index+1] = item[:len(item)-1] + sep + items[index+1]
			} else {
				result = append(result, item)
			}
		}
	}
	return result
}

// IndexString 搜索字符串
func IndexString(search string, array []string) int {
	index := -1
	for i, item := range array {
		if item == search {
			return i
		}
	}
	return index
}

// IndexInt 搜索整型数值
func IndexInt(search int, array []int) int {
	index := -1
	for i, item := range array {
		if item == search {
			return i
		}
	}
	return index
}
