package domain

import (
	"database/sql"
	"time"
)

type EmailStyle struct {
	ID          string         `json:"-" db:"id"`
	Name        string         `json:"name" db:"name"`
	Code        string         `json:"code" db:"code"`
	Description sql.NullString `json:"description" db:"description"`
	CreatedAt   time.Time      `json:"-" db:"created_at"`
	UpdatedAt   time.Time      `json:"-" db:"updated_at"`
}

type EmailStyleRepository interface {
	GetEmailStyles() ([]*EmailStyle, error)
	GetEmailStyleByCode(code string) (*EmailStyle, error)
}
