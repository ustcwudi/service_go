package config

// ServiceYml yml config of service
type ServiceYml struct {
	Debug   bool
	Port    string
	Captcha bool
	Upload  struct {
		Size int64
	}
	Mysql struct {
		Enable               bool
		User                 string
		Password             string
		Address              string
		Database             string
		Collation            string
		Net                  string
		ParseTime            bool
		AllowNativePasswords bool
		MaxIdleCount         int
		MaxOpenCount         int
	}
	Mongodb struct {
		Enable   bool
		Username string
		Password string
		Address  string
		Database string
		Timeout  int32
	}
	Minio struct {
		Endpoint string
		Key      string
		Secret   string
	}
	Redis struct {
		Address  string
		Password string
	}
	Security struct {
		Salt   string
		Secret string
	}
	Log struct {
		Level string
	}
	Template struct {
		Path string
	}
	Jwt struct {
		Key    string
		Secret string
		Exp    int
	}
	Wechat struct {
		AppID     string
		AppSecret string
	}
}

// Service default yml config of service
var Service *ServiceYml
