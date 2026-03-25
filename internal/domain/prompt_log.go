package domain

import (
	"context"
	"database/sql"
	"time"
)

type PromptLog struct {
	ID                string         `json:"-" db:"id"`
	UserID            sql.NullString `json:"user_id" db:"user_id"`
	Code              string         `json:"code" db:"code"`
	SystemInstruction sql.NullString `json:"system_instruction" db:"system_instruction"`
	PromptText        string         `json:"prompt_text" db:"prompt_text"`
	ClientID          string         `json:"client_id" db:"client_id"`
	ModelName         sql.NullString `json:"model_name" db:"model_name"`
	TokenUsage        int            `json:"token_usage" db:"token_usage"`
	CreatedAt         time.Time      `json:"-" db:"created_at"`
	UpdatedAt         time.Time      `json:"-" db:"updated_at"`
}

type PromptLogRepository interface {
	Write(ctx context.Context, promptLog *PromptLog) error
}
