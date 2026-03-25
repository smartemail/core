package domain

import (
	"context"
	"time"
)

type AISettingRepository interface {
	GetSettings(ctx context.Context, clientID string) (*AISetting, error)
	UpsertSettings(ctx context.Context, settings *AISetting) error
}

type AISetting struct {
	ID        string          `db:"id"`
	ClientID  string          `db:"client_id"`
	ModelName *NullableString `db:"model_name"`
	Settings  *NullableJSON   `db:"settings"`
	CreatedAt time.Time       `db:"created_at"`
	UpdatedAt time.Time       `db:"updated_at"`
}
