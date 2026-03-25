package repository

import (
	"context"
	"database/sql"

	"github.com/Notifuse/notifuse/internal/domain"
)

type pricingRepository struct {
	systemDB *sql.DB
}

func NewPricingRepository(systemDB *sql.DB) domain.PricingRepository {
	return &pricingRepository{systemDB: systemDB}
}

func (r *pricingRepository) GetPricingByCode(ctx context.Context, code string) (*domain.Pricing, error) {
	query := `SELECT id, name, code, credits FROM pricing WHERE code = $1`
	var pricing domain.Pricing
	err := r.systemDB.QueryRow(query, code).Scan(
		&pricing.ID,
		&pricing.Name,
		&pricing.Code,
		&pricing.Credits,
	)
	if err != nil {
		return nil, err
	}
	return &pricing, nil

}

func (r *pricingRepository) GetAllPricings(ctx context.Context) ([]*domain.Pricing, error) {
	query := `SELECT id, name, code, credits FROM pricing`
	rows, err := r.systemDB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pricings []*domain.Pricing
	for rows.Next() {
		var pricing domain.Pricing
		err := rows.Scan(
			&pricing.ID,
			&pricing.Name,
			&pricing.Code,
			&pricing.Credits,
		)
		if err != nil {
			return nil, err
		}
		pricings = append(pricings, &pricing)
	}
	return pricings, nil
}
