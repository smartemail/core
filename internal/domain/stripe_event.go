package domain

import (
	"context"
	"database/sql"
	"time"
)

type StripeEvent struct {
	ID          string       `json:"id"`
	Payload     string       `json:"payload"`
	ProcessedAt sql.NullTime `json:"processed_at"`
	CreatedAt   time.Time    `json:"created_at"`
}

type StripeEventRepository interface {
	CreateStripeEvent(ctx context.Context, stripeEvent *StripeEvent) error
	GetStripeEvent(ctx context.Context, id string) (*StripeEvent, error)
	UpdateStripeEvent(ctx context.Context, stripeEvent *StripeEvent) error
	DeleteStripeEvent(ctx context.Context, id string) error
}
