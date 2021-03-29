package schedule

import (
	"lib/log"
	"time"

	"github.com/robfig/cron"
)

func init() {
	c := cron.New()

	_ = c.AddFunc("0 59 23 * * *", func() { log.Info("cron", time.Now()) })
	_ = c.AddFunc("@every 2h30m", func() { log.Info("cron", time.Now()) })

	c.Start()
}
