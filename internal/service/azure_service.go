package service

import (
	"context"
	"fmt"
	"mime"
	"path/filepath"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/blob"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/sas"
	"github.com/Notifuse/notifuse/config"
	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/Notifuse/notifuse/pkg/logger"
)

type AzureService struct {
	config *config.Config
	logger logger.Logger
}

func NewAzureService(config *config.Config, logger logger.Logger) *AzureService {
	return &AzureService{
		config: config,
		logger: logger,
	}
}

func (s *AzureService) getContainerClient() (*azblob.Client, error) {
	accountName := s.config.Azure.StorageAccountName
	accountKey := s.config.Azure.StorageAccountKey

	cred, err := azblob.NewSharedKeyCredential(accountName, accountKey)
	if err != nil {
		return nil, err
	}

	url := "https://" + accountName + ".blob.core.windows.net/"

	client, err := azblob.NewClientWithSharedKeyCredential(url, cred, nil)
	if err != nil {
		return nil, err
	}

	return client, nil
}

func (s *AzureService) generateSASToken(containerName, blobName string) (string, error) {
	cred, err := azblob.NewSharedKeyCredential(s.config.Azure.StorageAccountName, s.config.Azure.StorageAccountKey)
	if err != nil {
		return "", err
	}
	// Права доступа
	permissions := sas.BlobPermissions{
		Read: true,
	}

	// Время жизни токена
	expiry := time.Now().UTC().Add(180 * time.Hour * 24)

	sasQueryParams, err := sas.BlobSignatureValues{
		Protocol:      sas.ProtocolHTTPS,
		StartTime:     time.Now().UTC(),
		ExpiryTime:    expiry,
		Permissions:   permissions.String(),
		ContainerName: containerName,
		BlobName:      blobName,
	}.SignWithSharedKey(cred)

	if err != nil {
		return "", err
	}

	return sasQueryParams.Encode(), nil
}

func (s *AzureService) ListUserFiles(ctx context.Context, userID string, prefix string) ([]*domain.AzurerFile, error) {
	container, err := s.getContainerClient()
	if err != nil {
		return nil, err
	}
	pager := container.NewListBlobsFlatPager(s.config.Azure.StorageContainerName, &azblob.ListBlobsFlatOptions{
		Prefix: &userID,
	})

	var files []*domain.AzurerFile

	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			s.logger.Error("Failed to list Azure blobs: " + err.Error())
			return nil, err
		}

		for _, blob := range page.Segment.BlobItems {

			if prefix != "" && prefix != "undefined" {
				if !strings.Contains(*blob.Name, prefix) {
					continue
				}
			}

			name := strings.SplitN(*blob.Name, "/", 2)

			sasToken, _ := s.generateSASToken(s.config.Azure.StorageContainerName, *blob.Name)

			url := fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s?%s", s.config.Azure.StorageAccountName, s.config.Azure.StorageContainerName, *blob.Name, sasToken)

			azureFile := &domain.AzurerFile{
				Name: &name[1],
				Size: blob.Properties.ContentLength,
				ID:   &name[1],
				URL:  &url,
			}
			files = append(files, azureFile)
		}
	}

	return files, nil
}

func (s *AzureService) UploadUserFile(ctx context.Context, userID, fileName string, data []byte) error {
	container, err := s.getContainerClient()
	if err != nil {
		return err
	}

	blobPath := userID + "/" + fileName

	// Detect content type from file extension
	contentType := mime.TypeByExtension(filepath.Ext(fileName))
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err = container.UploadBuffer(ctx, s.config.Azure.StorageContainerName, blobPath, data, &azblob.UploadBufferOptions{
		HTTPHeaders: &blob.HTTPHeaders{
			BlobContentType: &contentType,
		},
	})
	if err != nil {
		s.logger.Error("Failed to upload buffer: " + err.Error())
		return err
	}
	return nil
}

func (s *AzureService) DeleteUserFile(ctx context.Context, userID, fileName string) error {
	container, err := s.getContainerClient()
	if err != nil {
		return err
	}

	blobPath := userID + "/" + fileName
	_, err = container.DeleteBlob(ctx, s.config.Azure.StorageContainerName, blobPath, nil)
	if err != nil {
		s.logger.Error("Failed to delete blob: " + err.Error())
		return err
	}
	return nil
}

func (s *AzureService) GetUserFile(ctx context.Context, userID, fileName string) (string, error) {

	blobPath := userID + "/" + fileName
	sasToken, err := s.generateSASToken(s.config.Azure.StorageContainerName, blobPath)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s?%s", s.config.Azure.StorageAccountName, s.config.Azure.StorageContainerName, blobPath, sasToken)

	return url, nil
}

func (s *AzureService) GetPublicLinks(ctx context.Context, userID string, fileIds []string) ([]string, error) {
	links := []string{}
	for _, fileId := range fileIds {
		link, err := s.GetUserFile(ctx, userID, fileId)
		if err != nil {
			s.logger.Error("Failed to get user file: " + err.Error())
			continue
		}
		links = append(links, link)
	}
	return links, nil
}
