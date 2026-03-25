package service

import (
	"fmt"
	"time"

	"github.com/Notifuse/notifuse/config"
	"github.com/Notifuse/notifuse/pkg/logger"
	"github.com/go-co-op/gocron/v2"
)

type CronService struct {
	scheduler gocron.Scheduler
	logger    logger.Logger
	config    *config.Config
}

func NewCronService(logger logger.Logger, config *config.Config) *CronService {

	newScheduler, err := gocron.NewScheduler()
	if err != nil {
		logger.GetFileLogger().Error(fmt.Sprintf("Failed to create new scheduler: %v", err))
	}

	return &CronService{
		scheduler: newScheduler,
		logger:    logger,
		config:    config,
	}
}

func (s *CronService) AddJob(interval time.Duration, cmd func()) error {

	s.scheduler.NewJob(gocron.DurationJob(
		interval,
	),
		gocron.NewTask(
			cmd,
		),
		gocron.WithSingletonMode(gocron.LimitModeReschedule),
	)
	return nil
}

func (s *CronService) Start() {
	s.scheduler.Start()
	s.logger.GetFileLogger().Info("Cron service started")
}

func (s *CronService) Stop() error {
	err := s.scheduler.StopJobs()
	if err != nil {
		s.logger.GetFileLogger().Error(fmt.Sprintf("Failed to stop cron service: %v", err))
	} else {
		s.logger.GetFileLogger().Info("Cron service stopped")
	}
	return err
}
