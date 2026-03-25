package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/Notifuse/notifuse/internal/domain"
)

type userSearchRequestResultRepository struct {
	systemDB *sql.DB
}

func NewUserSearchRequestResultRepository(systemDB *sql.DB) domain.UserSearchRequestResultRepository {
	return &userSearchRequestResultRepository{systemDB: systemDB}
}

func (r *userSearchRequestResultRepository) CreateUserSearchRequestResult(ctx context.Context, result *domain.UserSearchRequestResult) error {
	query := `INSERT INTO user_search_request_results (id, user_id, request_id, status, url, email, name, company, position, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := r.systemDB.ExecContext(ctx, query,
		result.ID,
		result.UserID,
		result.RequestId,
		result.Status,
		result.URL,
		result.Email,
		result.Name,
		result.Company,
		result.Position,
		result.CreatedAt,
		result.UpdatedAt,
	)
	return err
}

func (r *userSearchRequestResultRepository) GetUserSearchRequestResults(ctx context.Context, requestId string) ([]*domain.UserSearchRequestResult, error) {

	query := `SELECT id, user_id, request_id, status, url, email, name, company, position, created_at, updated_at
			  FROM user_search_request_results
			  WHERE request_id = $1`

	rows, err := r.systemDB.QueryContext(ctx, query, requestId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*domain.UserSearchRequestResult
	for rows.Next() {
		var result domain.UserSearchRequestResult
		if err := rows.Scan(
			&result.ID,
			&result.UserID,
			&result.RequestId,
			&result.Status,
			&result.URL,
			&result.Email,
			&result.Name,
			&result.Company,
			&result.Position,
			&result.CreatedAt,
			&result.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, &result)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *userSearchRequestResultRepository) DeleteUserSearchRequestResult(ctx context.Context, requestId, resultId string) error {
	query := `DELETE FROM user_search_request_results WHERE request_id = $1 AND id = $2`
	_, err := r.systemDB.ExecContext(ctx, query, requestId, resultId)
	return err
}

func (r *userSearchRequestResultRepository) DeleteAllUserSearchRequestResults(ctx context.Context, requestId string) error {
	query := `DELETE FROM user_search_request_results WHERE request_id = $1`
	_, err := r.systemDB.ExecContext(ctx, query, requestId)
	return err
}

func (r *userSearchRequestResultRepository) GetAllUserSearchRequestResults(ctx context.Context, filters map[string]any, orderBy map[string]string, limit int) ([]*domain.UserSearchRequestResult, error) {
	query := `SELECT id, user_id, request_id, status, url, email, name, company, position, created_at, updated_at
			  FROM user_search_request_results`

	var args []interface{}
	var conditions []string
	i := 1
	for key, value := range filters {
		conditions = append(conditions, key+" = $"+string(i))
		args = append(args, value)
		i++
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	if len(orderBy) > 0 {
		var orderClauses []string
		for key, direction := range orderBy {
			orderClauses = append(orderClauses, key+" "+direction)
		}
		query += " ORDER BY " + strings.Join(orderClauses, ", ")
	}

	if limit > 0 {
		query += " LIMIT " + fmt.Sprintf("%d", limit)
	}

	rows, err := r.systemDB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*domain.UserSearchRequestResult
	for rows.Next() {
		var result domain.UserSearchRequestResult
		if err := rows.Scan(
			&result.ID,
			&result.UserID,
			&result.RequestId,
			&result.Status,
			&result.URL,
			&result.Email,
			&result.Name,
			&result.Company,
			&result.Position,
			&result.CreatedAt,
			&result.UpdatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, &result)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *userSearchRequestResultRepository) UpdateUserSearchRequestResultStatus(ctx context.Context, resultId, status string) error {
	query := `UPDATE user_search_request_results SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.systemDB.ExecContext(ctx, query, status, resultId)
	return err
}
