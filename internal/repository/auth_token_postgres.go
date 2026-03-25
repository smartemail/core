package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

type authTokenRepository struct {
	systemDB *sql.DB
}

func NewAuthTokenRepository(db *sql.DB) domain.AuthTokenRepository {
	return &authTokenRepository{
		systemDB: db,
	}
}

func (r *authTokenRepository) UpdateTokens(ctx context.Context, userID string, token *oauth2.Token) error {
	_, err := r.systemDB.ExecContext(ctx, "DELETE FROM auth_tokens WHERE user_id = $1", userID)
	if err != nil {
		return err
	}
	id := uuid.New().String()
	_, err = r.systemDB.ExecContext(ctx, "INSERT INTO auth_tokens (id, user_id, access_token, refresh_token, expires_at) VALUES ($1, $2, $3, $4, $5)",
		id, userID, token.AccessToken, token.RefreshToken, token.Expiry)
	if err != nil {
		return err
	}

	return nil
}

func (r *authTokenRepository) GetTokens(ctx context.Context, userID string) (*oauth2.Token, error) {

	row := r.systemDB.QueryRowContext(ctx, "SELECT access_token, refresh_token, expires_at FROM auth_tokens WHERE user_id = $1", userID)

	var accessToken, refreshToken string
	var expiresAt time.Time

	err := row.Scan(&accessToken, &refreshToken, &expiresAt)
	if err != nil {
		return nil, err
	}

	token := &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Expiry:       expiresAt,
	}

	return token, nil
}
