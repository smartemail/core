package repository

import (
	"context"
	"database/sql"

	"github.com/Notifuse/notifuse/internal/domain"
)

type userCodeRepository struct {
	systemDB *sql.DB
}

// NewUserCodeRepository creates a new PostgreSQL user code repository
func NewUserCodeRepository(db *sql.DB) domain.UserCodeRepository {
	return &userCodeRepository{systemDB: db}
}

func (r *userCodeRepository) Create(ctx context.Context, code *domain.UserCode) error {
	_, err := r.systemDB.ExecContext(ctx, `
		INSERT INTO user_codes (user_id, code, type, expires_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, code.UserID, code.Code, code.Type, code.ExpiresAt, code.CreatedAt, code.UpdatedAt)
	return err
}

func (r *userCodeRepository) GetByCode(ctx context.Context, code string) (*domain.UserCode, error) {
	row := r.systemDB.QueryRowContext(ctx, `
		SELECT id, user_id, code, type, expires_at, created_at, updated_at
		FROM user_codes
		WHERE code = $1
	`, code)

	var userCode domain.UserCode
	err := row.Scan(&userCode.ID, &userCode.UserID, &userCode.Code, &userCode.Type, &userCode.ExpiresAt, &userCode.CreatedAt, &userCode.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &userCode, nil
}

func (r *userCodeRepository) Delete(ctx context.Context, id string) error {
	_, err := r.systemDB.ExecContext(ctx, `
		DELETE FROM user_codes
		WHERE id = $1
	`, id)
	return err
}
