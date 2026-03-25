package domain

import (
	"context"
	"database/sql"
	"time"
)

const (
	UserSearchRequestResultStatusPending   = "pending"
	UserSearchRequestResultStatusCompleted = "completed"
	UserSearchRequestResultStatusFailed    = "failed"
)

type UserSearchRequestResult struct {
	ID        string         `json:"-" db:"id"`
	Status    string         `json:"status" db:"status"`
	UserID    string         `json:"-" db:"user_id"`
	RequestId string         `json:"-" db:"request_id"`
	URL       string         `json:"url" db:"url"`
	Email     sql.NullString `json:"email" db:"email"`
	Name      sql.NullString `json:"name" db:"name"`
	Company   sql.NullString `json:"company" db:"company"`
	Position  sql.NullString `json:"position" db:"position"`
	CreatedAt time.Time      `json:"-" db:"created_at"`
	UpdatedAt time.Time      `json:"-" db:"updated_at"`
}

type UserSearchRequestResultRepository interface {
	CreateUserSearchRequestResult(ctx context.Context, result *UserSearchRequestResult) error
	GetUserSearchRequestResults(ctx context.Context, requestId string) ([]*UserSearchRequestResult, error)
	DeleteUserSearchRequestResult(ctx context.Context, requestId, resultId string) error
	DeleteAllUserSearchRequestResults(ctx context.Context, requestId string) error
	GetAllUserSearchRequestResults(ctx context.Context, filters map[string]any, orderBy map[string]string, limit int) ([]*UserSearchRequestResult, error)
	UpdateUserSearchRequestResultStatus(ctx context.Context, resultId, status string) error
}
