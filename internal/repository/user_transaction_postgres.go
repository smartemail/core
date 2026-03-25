package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/google/uuid"
)

type userTransactionRepository struct {
	systemDB *sql.DB
}

func NewUserTransactionRepository(db *sql.DB) domain.UserTransactionRepository {
	return &userTransactionRepository{systemDB: db}
}

func (r *userTransactionRepository) CreateUserTransaction(ctx context.Context, userTransaction *domain.UserTransaction) error {
	if userTransaction.ID == "" {
		userTransaction.ID = uuid.NewString()
	}
	userTransaction.CreatedAt = time.Now()
	userTransaction.UpdatedAt = time.Now()

	query := `
			INSERT INTO user_transactions (id, user_id, transaction_type, amount, invoice_id, subscription_id, entity_id, entity_type, credits, notes, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		`
	_, err := r.systemDB.ExecContext(ctx, query,
		userTransaction.ID,
		userTransaction.UserID,
		userTransaction.TransactionType,
		userTransaction.Amount,
		userTransaction.InvoiceID,
		userTransaction.SubscriptionID,
		userTransaction.EntityID,
		userTransaction.EntityType,
		userTransaction.Credits,
		userTransaction.Notes,
		userTransaction.CreatedAt,
		userTransaction.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create user transaction: %w", err)
	}

	return nil
}
func (r *userTransactionRepository) GetUserTransactionByID(ctx context.Context, id string) (*domain.UserTransaction, error) {
	userTransaction := &domain.UserTransaction{}
	query := `SELECT * FROM user_transactions WHERE id = $1`
	row := r.systemDB.QueryRowContext(ctx, query, id)
	err := row.Scan(
		&userTransaction.ID,
		&userTransaction.UserID,
		&userTransaction.TransactionType,
		&userTransaction.Amount,
		&userTransaction.InvoiceID,
		&userTransaction.SubscriptionID,
		&userTransaction.EntityID,
		&userTransaction.EntityType,
		&userTransaction.Credits,
		&userTransaction.Notes,
		&userTransaction.CreatedAt,
		&userTransaction.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user transaction: %w", err)
	}
	return userTransaction, nil
}
func (r *userTransactionRepository) GetUserTransactionsByUserID(ctx context.Context, userID string) ([]*domain.UserTransaction, error) {
	userTransactions := []*domain.UserTransaction{}
	query := `SELECT * FROM user_transactions WHERE user_id = $1 ORDER BY created_at ASC`
	rows, err := r.systemDB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user transactions: %w", err)
	}
	for rows.Next() {
		userTransaction := domain.UserTransaction{}

		err := rows.Scan(
			&userTransaction.ID,
			&userTransaction.UserID,
			&userTransaction.TransactionType,
			&userTransaction.Amount,
			&userTransaction.InvoiceID,
			&userTransaction.SubscriptionID,
			&userTransaction.EntityID,
			&userTransaction.EntityType,
			&userTransaction.Credits,
			&userTransaction.Notes,
			&userTransaction.CreatedAt,
			&userTransaction.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		userTransactions = append(userTransactions, &userTransaction)
	}

	return userTransactions, nil
}
func (r *userTransactionRepository) UpdateUserTransaction(ctx context.Context, userTransaction *domain.UserTransaction) error {
	userTransaction.UpdatedAt = time.Now()
	query := `UPDATE user_transactions SET 
			user_id = $2, 
			transaction_type = $3, 
			amount = $4, 
			invoice_id = $5, 
			subscription_id = $6, 
			entity_id = $7, 
			entity_type = $8, 
			credits = $9, 
			notes = $10, 
			updated_at = $11 
			WHERE id = $1`
	_, err := r.systemDB.ExecContext(ctx, query, userTransaction.ID,
		userTransaction.UserID,
		userTransaction.TransactionType,
		userTransaction.Amount,
		userTransaction.InvoiceID,
		userTransaction.SubscriptionID,
		userTransaction.EntityID,
		userTransaction.EntityType,
		userTransaction.Credits,
		userTransaction.Notes,
		userTransaction.UpdatedAt,
	)
	if err != nil {
		return err
	}
	return nil
}
func (r *userTransactionRepository) DeleteUserTransaction(ctx context.Context, id string) error {
	query := `DELETE FROM user_transactions WHERE id = $1`
	_, err := r.systemDB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	return nil
}
