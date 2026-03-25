package domain

import (
	"context"
	"time"
)

const (
	PricingCodeGenerateFullEmail = "generate_full_email"
	PricingCodeSendCampaign      = "send_campaign"
)

type Pricing struct {
	ID        int       `json:"id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	Credits   int       `json:"credits"`
	CreatedAt time.Time `json:"-" db:"created_at"`
	UpdatedAt time.Time `json:"-" db:"updated_at"`
}

type PricingRepository interface {
	GetPricingByCode(ctx context.Context, code string) (*Pricing, error)
	GetAllPricings(ctx context.Context) ([]*Pricing, error)
}
