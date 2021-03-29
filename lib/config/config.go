package config

import (
	"io/ioutil"
	"log"
	"os"

	"gopkg.in/yaml.v2"
)

func init() {
	Service = &ServiceYml{}
	data, _ := ioutil.ReadFile("service.yml")
	err := yaml.Unmarshal(data, Service)
	if err != nil {
		log.Fatal(err)
	}
	Debug, exist := os.LookupEnv("DEBUG")
	if exist {
		Service.Debug = Debug == "TRUE"
	}
	Auth, exist := os.LookupEnv("AUTH")
	if exist {
		Service.Auth = Auth == "TRUE"
	}
	Captcha, exist := os.LookupEnv("CAPTCHA")
	if exist {
		Service.Captcha = Captcha == "TRUE"
	}
	MongodbAddress, exist := os.LookupEnv("MONGODB_ADDRESS")
	if exist {
		Service.Mongodb.Address = MongodbAddress
	}
	MongodbUsername, exist := os.LookupEnv("MONGODB_USERNAME")
	if exist {
		Service.Mongodb.Username = MongodbUsername
	}
	MongodbPassword, exist := os.LookupEnv("MONGODB_PASSWORD")
	if exist {
		Service.Mongodb.Password = MongodbPassword
	}
	MinioEndpoint, exist := os.LookupEnv("MINIO_ENDPOINT")
	if exist {
		Service.Minio.Endpoint = MinioEndpoint
	}
	MinioKey, exist := os.LookupEnv("MINIO_KEY")
	if exist {
		Service.Minio.Key = MinioKey
	}
	MinioSecret, exist := os.LookupEnv("MINIO_SECRET")
	if exist {
		Service.Minio.Secret = MinioSecret
	}
	RedisAddress, exist := os.LookupEnv("REDIS_ADDRESS")
	if exist {
		Service.Redis.Address = RedisAddress
	}
	RedisPassword, exist := os.LookupEnv("REDIS_PASSWORD")
	if exist {
		Service.Redis.Password = RedisPassword
	}
	AppID, exist := os.LookupEnv("APP_ID")
	if exist {
		Service.Wechat.AppID = AppID
	}
	AppSecret, exist := os.LookupEnv("APP_SECRET")
	if exist {
		Service.Wechat.AppSecret = AppSecret
	}
}
