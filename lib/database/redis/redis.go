package redis

import (
	"lib/config"
	"time"

	"github.com/go-redis/redis"
)

// DB 设置
var DB *redis.Client

func init() {
	DB = redis.NewClient(&redis.Options{
		Addr:     config.Service.Redis.Address,
		Password: config.Service.Redis.Password,
		DB:       1,
	})
}

// Set 设置
func Set(group, key string, value interface{}, expiration time.Duration) error {
	return DB.Set(group+":"+key, value, expiration).Err()
}

// Get 获取
func Get(group, key string) (string, error) {
	return DB.Get(group + ":" + key).Result()
}

// Del 删除
func Del(group, key string) (int64, error) {
	return DB.Del(group + ":" + key).Result()
}
