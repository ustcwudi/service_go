package memory

import (
	"time"

	"github.com/gin-contrib/cache"
	"github.com/gin-contrib/cache/persistence"
	"github.com/gin-gonic/gin"
)

var store *persistence.InMemoryStore

func init() {
	store = persistence.NewInMemoryStore(time.Second)
}

// Cache 缓存
func Cache(handle gin.HandlerFunc) gin.HandlerFunc {
	return cache.CachePage(store, time.Minute, handle)
}
