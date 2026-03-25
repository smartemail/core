package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Notifuse/notifuse/internal/domain"
)

type aiSettingRepository struct {
	systemDB *sql.DB
}

func NewAISettingRepository(systemDB *sql.DB) domain.AISettingRepository {
	return &aiSettingRepository{systemDB: systemDB}
}

func (r *aiSettingRepository) GetSettings(ctx context.Context, clientID string) (*domain.AISetting, error) {
	settings := &domain.AISetting{}

	query := `
		SELECT id, client_id, model_name, settings, created_at, updated_at
		FROM contact_lists
		WHERE client_id = $1
	`

	err := r.systemDB.QueryRowContext(ctx, query, clientID).Scan(
		&settings.ID,
		&settings.ClientID,
		&settings.ModelName,
		&settings.Settings,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return settings, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get settings: %w", err)
	}

	return settings, nil
}

func (r *aiSettingRepository) UpsertSettings(ctx context.Context, settings *domain.AISetting) error {

	_, err := r.systemDB.ExecContext(ctx, `
		INSERT INTO ai_settings (id, client_id, model_name, settings , created_at, updated_at)
		VALUES ( $1, $2, $3, $4, now(), now())
		ON CONFLICT (id)
		DO UPDATE SET model_name = $3, settings = $4,updated_at = now()
	`,
		settings.ID, settings.ClientID, settings.ModelName, settings.Settings,
	)
	if err != nil {
		return fmt.Errorf("failed to update user settings: %w", err)
	}

	return nil
}
