package log

import (
	"os"
	"time"

	"lib/config"

	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var logger *zap.Logger

func init() {
	logger, _ = zap.NewProduction()

	var level zapcore.Level
	switch config.Service.Log.Level {
	case "debug":
		level = zap.DebugLevel
	case "info":
		level = zap.InfoLevel
	case "error":
		level = zap.ErrorLevel
	default:
		level = zap.InfoLevel
	}
	logger = zap.New(zapcore.NewTee(
		zapcore.NewCore(zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig()), zapcore.Lock(os.Stdout), level),
	))
}

// Middleware gin中间件
func Middleware() gin.HandlerFunc {
	return ginzap.Ginzap(logger, time.RFC3339, true)
}

// Debug 调试
func Debug(args ...interface{}) {
	logger.Sugar().Debug(args)
}

// Info 信息
func Info(args ...interface{}) {
	logger.Sugar().Info(args)
}

// Error 错误
func Error(args ...interface{}) {
	logger.Sugar().Error(args)
}

// Fatal 严重
func Fatal(args ...interface{}) {
	logger.Sugar().Fatal(args)
}
