package repository

import (
	"context"
	"database/sql"

	"github.com/Notifuse/notifuse/internal/domain"
)

type promptLogRepository struct {
	systemDB *sql.DB
}

func NewPromptLogRepository(systemDB *sql.DB) domain.PromptLogRepository {
	return &promptLogRepository{systemDB: systemDB}
}

func (r *promptLogRepository) Write(ctx context.Context, promptLog *domain.PromptLog) error {
	query := `INSERT INTO prompts_log(code, client_id, model_name, prompt_text, token_usage, created_at, updated_at, user_id)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.systemDB.ExecContext(ctx, query,
		promptLog.Code,
		promptLog.ClientID,
		promptLog.ModelName,
		promptLog.PromptText,
		promptLog.TokenUsage,
		promptLog.CreatedAt,
		promptLog.UpdatedAt,
		promptLog.UserID,
	)
	if err != nil {
		return err
	}

	return nil
}
