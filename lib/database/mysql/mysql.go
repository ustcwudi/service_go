package mysql

import (
	"lib/config"

	"github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

// DB mysql数据库
var DB *gorm.DB

func init() {
	db := mysql.Config{
		User:                 config.Service.Mysql.User,
		Passwd:               config.Service.Mysql.Password,
		Addr:                 config.Service.Mysql.Address,
		DBName:               config.Service.Mysql.Database,
		Collation:            config.Service.Mysql.Collation,
		Net:                  config.Service.Mysql.Net,
		ParseTime:            config.Service.Mysql.ParseTime,
		AllowNativePasswords: config.Service.Mysql.AllowNativePasswords,
	}
	if config.Service.Mysql.Enable {
		var err error
		if DB, err = gorm.Open("mysql", db.FormatDSN()); err != nil {
			panic(err)
		}
	}
}
