package launch

import (
	"context"
	"lib/config"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
)

// Run run application
func Run(router *gin.Engine) {
	srv := &http.Server{
		Addr:           ":" + config.Service.Port,
		Handler:        router,
		MaxHeaderBytes: 1 << 20,
	}

	go func() {
		// service http
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the service with a timeout of 10 seconds.
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("Shutdown Service ...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Service Shutdown:", err)
	}
	log.Println("Service Exiting")
}
