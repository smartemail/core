package domain

import (
	"context"
	"time"
)

type UserCode struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	Code      string    `json:"code" db:"code"`
	Type      string    `json:"type" db:"type"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type UserCodeRepository interface {
	Create(ctx context.Context, code *UserCode) error
	GetByCode(ctx context.Context, code string) (*UserCode, error)
	Delete(ctx context.Context, id string) error
}
