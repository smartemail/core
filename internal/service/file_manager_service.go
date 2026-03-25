package service

import (
	"context"

	"github.com/Notifuse/notifuse/config"
	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/Notifuse/notifuse/pkg/logger"
)

type FileManagerService struct {
	authService  domain.AuthService
	azureService *AzureService
	logger       logger.Logger
	config       *config.Config
}

func NewFileManagerService(authService domain.AuthService, logger logger.Logger, config *config.Config) *FileManagerService {
	return &FileManagerService{
		authService:  authService,
		azureService: NewAzureService(config, logger),
		logger:       logger,
		config:       config,
	}
}

func (s *FileManagerService) ListUserFiles(ctx context.Context, prefix string) ([]*domain.AzurerFile, error) {

	user, err := s.authService.AuthenticateUserFromContext(ctx)
	if err != nil {
		return nil, err
	}

	return s.azureService.ListUserFiles(ctx, user.ID, prefix)
}
func (s *FileManagerService) UploadUserFile(ctx context.Context, fileName string, data []byte) error {
	user, err := s.authService.AuthenticateUserFromContext(ctx)
	if err != nil {
		return err
	}
	return s.azureService.UploadUserFile(ctx, user.ID, fileName, data)
}
func (s *FileManagerService) DeleteUserFile(ctx context.Context, fileName string) error {
	user, err := s.authService.AuthenticateUserFromContext(ctx)
	if err != nil {
		return err
	}
	return s.azureService.DeleteUserFile(ctx, user.ID, fileName)
}

func (s *FileManagerService) GetUserFile(ctx context.Context, fileName string) (string, error) {
	user, err := s.authService.AuthenticateUserFromContext(ctx)
	if err != nil {
		return "", err
	}
	return s.azureService.GetUserFile(ctx, user.ID, fileName)
}

func (s *FileManagerService) GetPublicLinks(ctx context.Context, fileIds []string) ([]string, error) {
	user, err := s.authService.AuthenticateUserFromContext(ctx)
	if err != nil {
		return make([]string, 0), err
	}
	return s.azureService.GetPublicLinks(ctx, user.ID, fileIds)
}
