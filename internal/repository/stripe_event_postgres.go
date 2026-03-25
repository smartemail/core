package repository

import (
	"context"
	"database/sql"

	"github.com/Notifuse/notifuse/internal/domain"
)

type stripeEventRepository struct {
	systemDB *sql.DB
}

func NewStripeEventRepository(systemDB *sql.DB) domain.StripeEventRepository {
	return &stripeEventRepository{systemDB: systemDB}
}

func (r *stripeEventRepository) CreateStripeEvent(ctx context.Context, stripeEvent *domain.StripeEvent) error {
	query := `INSERT INTO stripe_events (id, payload, created_at, processed_at)
	VALUES ($1, $2, $3, $4)`

	_, err := r.systemDB.ExecContext(ctx, query,
		stripeEvent.ID,
		stripeEvent.Payload,
		stripeEvent.CreatedAt,
		stripeEvent.ProcessedAt,
	)
	if err != nil {
		return err
	}

	return nil

}
func (r *stripeEventRepository) GetStripeEvent(ctx context.Context, id string) (*domain.StripeEvent, error) {

	stripeEvent := &domain.StripeEvent{}
	query := `SELECT * FROM stripe_events WHERE id = $1`
	row := r.systemDB.QueryRowContext(ctx, query, id)
	err := row.Scan(
		stripeEvent.ID,
		stripeEvent.Payload,
		stripeEvent.CreatedAt,
		stripeEvent.ProcessedAt,
	)
	if err != nil {
		return nil, err
	}
	return stripeEvent, nil

}
func (r *stripeEventRepository) UpdateStripeEvent(ctx context.Context, stripeEvent *domain.StripeEvent) error {

	query := `UPDATE stripe_events SET 
	processed_at = $2
	WHERE id = $1
	`

	_, err := r.systemDB.ExecContext(ctx, query,
		stripeEvent.ID,
		stripeEvent.ProcessedAt,
	)
	if err != nil {
		return err
	}

	return nil

}
func (r *stripeEventRepository) DeleteStripeEvent(ctx context.Context, id string) error {
	query := `DELETE FROM stripe_events WHERE id = $1`
	_, err := r.systemDB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	return nil
}
