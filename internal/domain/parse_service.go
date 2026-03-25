package domain

import "context"

type ParserService interface {
	GetScreenshot(ctx context.Context, websiteUrl string) ([]byte, error)
	GetContent(ctx context.Context, websiteUrl string) (string, error)
}
