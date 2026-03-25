package domain

import "time"

type CronService interface {
	AddJob(interval time.Duration, cmd func()) error
	Start()
	Stop() error
}
