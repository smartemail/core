package domain

import (
	"context"
	"time"
)

type UserTransaction struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	TransactionType int       `json:"transaction_type"`
	Amount          int       `json:"amount"`
	InvoiceID       string    `json:"invoice_id"`
	SubscriptionID  string    `json:"subscription_id"`
	EntityID        string    `json:"entity_id"`
	EntityType      string    `json:"entity_type"`
	Credits         int       `json:"credits"`
	Notes           string    `json:"notes"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type UserTransactionRepository interface {
	CreateUserTransaction(ctx context.Context, userTransaction *UserTransaction) error
	GetUserTransactionByID(ctx context.Context, id string) (*UserTransaction, error)
	GetUserTransactionsByUserID(ctx context.Context, userID string) ([]*UserTransaction, error)
	UpdateUserTransaction(ctx context.Context, userTransaction *UserTransaction) error
	DeleteUserTransaction(ctx context.Context, id string) error
}

const (
	TransactionTypeSubscriptionPurchase = 1
	TransactionTypeBalanceTopUp         = 2
	TransactionTypeCreditTopUp          = 3
	TransactionTypeCreditCharge         = 4

	TransactionEntityTypeProduct = "product"
	TransactionEntityTypePricing = "pricing"
)

type UserTransactionService interface {
	CreateUserTransaction(ctx context.Context, userTransaction *UserTransaction) error
	GetUserTransactionByID(ctx context.Context, id string) (*UserTransaction, error)
	GetUserTransactionsByUserID(ctx context.Context, userID string) ([]*UserTransaction, error)
	UpdateUserTransaction(ctx context.Context, userTransaction *UserTransaction) error
	DeleteUserTransaction(ctx context.Context, id string) error
}
