package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/Notifuse/notifuse/internal/domain"
)

type userSettingRepository struct {
	systemDB *sql.DB
}

func NewUserSettingRepository(systemDB *sql.DB) domain.UserSettingRepository {
	return &userSettingRepository{systemDB: systemDB}
}

func (r *userSettingRepository) UpdateUserSetting(ctx context.Context, userSetting *domain.UserSetting) error {

	_, err := r.systemDB.ExecContext(ctx, `
		INSERT INTO user_settings (user_id, code, value, created_at, updated_at)
		VALUES ( $1, $2, $3, now(), now())
		ON CONFLICT (user_id, code)
		DO UPDATE SET value = $3, updated_at = now()
	`, userSetting.UserID, userSetting.Code, userSetting.Value)
	if err != nil {
		return fmt.Errorf("failed to update user settings: %w", err)
	}

	return nil
}

func (r *userSettingRepository) GetUserSetting(ctx context.Context, userId string) ([]*domain.UserSetting, error) {

	rows, err := r.systemDB.QueryContext(ctx, `
		SELECT id, user_id, code, value, created_at, updated_at
		FROM user_settings
		WHERE user_id = $1
	`, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to get user settings: %w", err)
	}
	defer rows.Close()

	var settings []*domain.UserSetting
	for rows.Next() {
		var setting domain.UserSetting
		if err := rows.Scan(&setting.ID, &setting.UserID, &setting.Code, &setting.Value, &setting.CreatedAt, &setting.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan user setting: %w", err)
		}
		settings = append(settings, &setting)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating user settings: %w", err)
	}

	return settings, nil
}
