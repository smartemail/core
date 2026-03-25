package domain

import "context"

type FileManagerService interface {
	ListUserFiles(ctx context.Context, prefix string) ([]*AzurerFile, error)
	UploadUserFile(ctx context.Context, fileName string, data []byte) error
	DeleteUserFile(ctx context.Context, fileName string) error
	GetUserFile(ctx context.Context, fileName string) (string, error)
	GetPublicLinks(ctx context.Context, fileIds []string) ([]string, error)
}

type AzurerFile struct {
	ID   *string `json:"id"`
	Name *string `json:"name"`
	Size *int64  `json:"size"`
	URL  *string `json:"url"`
}
