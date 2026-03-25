package domain

import (
	"database/sql"
	"time"
)

type Prompt struct {
	ID                string         `json:"-" db:"id"`
	IsActive          bool           `json:"is_active" db:"is_active"`
	Name              string         `json:"name" db:"name"`
	Code              string         `json:"code" db:"code"`
	SystemInstruction sql.NullString `json:"system_instruction" db:"system_instruction"`
	PromptText        string         `json:"prompt_text" db:"prompt_text"`
	ClientID          string         `json:"client_id" db:"client_id"`
	ModelName         sql.NullString `json:"model_name" db:"model_name"`
	Settings          sql.NullString `json:"settings" db:"settings"`
	IsImagePrompt     bool           `json:"is_image_prompt" db:"is_image_prompt"`
	CreatedAt         time.Time      `json:"-" db:"created_at"`
	UpdatedAt         time.Time      `json:"-" db:"updated_at"`
}

type PromptRepository interface {
	GetPromt(code string) (*Prompt, error)
	GetPrompts() (map[string]*Prompt, error)
}
