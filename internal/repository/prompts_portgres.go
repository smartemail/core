package repository

import (
	"database/sql"

	"github.com/Notifuse/notifuse/internal/domain"
)

type promptRepository struct {
	systemDB *sql.DB
}

func NewPromptRepository(systemDB *sql.DB) domain.PromptRepository {
	return &promptRepository{systemDB: systemDB}
}

func (r *promptRepository) GetPromt(code string) (*domain.Prompt, error) {
	query := `SELECT id, is_active, name, code, system_instruction, prompt_text, client_id, model_name, is_image_prompt, settings FROM prompts WHERE code = $1`
	var prompt domain.Prompt
	err := r.systemDB.QueryRow(query, code).Scan(
		&prompt.ID,
		&prompt.IsActive,
		&prompt.Name,
		&prompt.Code,
		&prompt.SystemInstruction,
		&prompt.PromptText,
		&prompt.ClientID,
		&prompt.ModelName,
		&prompt.IsImagePrompt,
		&prompt.Settings,
	)
	if err != nil {
		return nil, err
	}
	return &prompt, nil
}

func (r *promptRepository) GetPrompts() (map[string]*domain.Prompt, error) {
	query := `SELECT id, is_active, name, code, system_instruction, prompt_text, client_id, model_name, is_image_prompt, settings FROM prompts`
	rows, err := r.systemDB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	prompts := make(map[string]*domain.Prompt)
	for rows.Next() {
		var prompt domain.Prompt
		err := rows.Scan(&prompt.ID, &prompt.IsActive, &prompt.Name, &prompt.Code, &prompt.SystemInstruction, &prompt.PromptText, &prompt.ClientID, &prompt.ModelName, &prompt.IsImagePrompt, &prompt.Settings)
		if err != nil {
			return nil, err
		}
		prompts[prompt.Code] = &prompt
	}
	return prompts, nil
}
