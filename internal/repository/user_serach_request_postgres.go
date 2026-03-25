package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/Notifuse/notifuse/internal/domain"
)

type userSearchRequestRepository struct {
	systemDB *sql.DB
}

func NewUserSearchRequestRepository(systemDB *sql.DB) domain.UserSearchRequestRepository {
	return &userSearchRequestRepository{systemDB: systemDB}
}

func (r *userSearchRequestRepository) CreateUserSearchRequest(ctx context.Context, request *domain.UserSearchRequest) error {
	query := `INSERT INTO user_search_requests (id, user_id, status, location, query, is_business_email, is_personal_email, contacts_number, created_at, updated_at, lat, lng, radius)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
	_, err := r.systemDB.ExecContext(ctx, query,
		request.ID,
		request.UserID,
		request.Status,
		request.Location,
		request.Query,
		request.IsBusinessEmail,
		request.IsPersonalEmail,
		request.ContactsNumber,
		request.CreatedAt,
		request.UpdatedAt,
		request.Lat,
		request.Lng,
		request.Radius,
	)
	return err
}

func (r *userSearchRequestRepository) GetAllUserSearchRequests(ctx context.Context, filters map[string]any, orderBy map[string]string, limit int) ([]*domain.UserSearchRequest, error) {

	where := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if userId, ok := filters["user_id"]; ok {
		where += " AND user_id = $" + fmt.Sprintf("%d", argIndex)
		args = append(args, userId)
		argIndex++
	}

	if status, ok := filters["status"]; ok {
		where += " AND status = $" + fmt.Sprintf("%d", argIndex)
		args = append(args, status)
		argIndex++
	}

	orderByClause := ""
	if len(orderBy) > 0 {
		orderByClause = "ORDER BY "
		i := 0
		for field, direction := range orderBy {
			if i > 0 {
				orderByClause += ", "
			}
			orderByClause += fmt.Sprintf("%s %s", field, direction)
			i++
		}
	}

	query := `SELECT id, user_id, status, location, query, is_business_email, is_personal_email, contacts_number, created_at, updated_at, lat, lng, radius
			  FROM user_search_requests ` + where + ` ` + orderByClause
	if limit > 0 {
		query += fmt.Sprintf(" LIMIT %d", limit)
	}

	rows, err := r.systemDB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*domain.UserSearchRequest
	for rows.Next() {
		var request domain.UserSearchRequest
		if err := rows.Scan(
			&request.ID,
			&request.UserID,
			&request.Status,
			&request.Location,
			&request.Query,
			&request.IsBusinessEmail,
			&request.IsPersonalEmail,
			&request.ContactsNumber,
			&request.CreatedAt,
			&request.UpdatedAt,
			&request.Lat,
			&request.Lng,
			&request.Radius,
		); err != nil {
			return nil, err
		}
		requests = append(requests, &request)
	}
	return requests, nil
}

func (r *userSearchRequestRepository) GetUserSearchRequests(ctx context.Context, userId string) ([]*domain.UserSearchRequest, error) {
	query := `SELECT id, user_id, status, location, query, is_business_email, is_personal_email, contacts_number, created_at, updated_at, lat, lng, radius
			  FROM user_search_requests
			  WHERE user_id = $1
			  ORDER BY created_at DESC`
	rows, err := r.systemDB.QueryContext(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*domain.UserSearchRequest
	for rows.Next() {
		var request domain.UserSearchRequest
		if err := rows.Scan(
			&request.ID,
			&request.UserID,
			&request.Status,
			&request.Location,
			&request.Query,
			&request.IsBusinessEmail,
			&request.IsPersonalEmail,
			&request.ContactsNumber,
			&request.CreatedAt,
			&request.UpdatedAt,
			&request.Lat,
			&request.Lng,
			&request.Radius,
		); err != nil {
			return nil, err
		}
		requests = append(requests, &request)
	}
	return requests, nil
}

func (r *userSearchRequestRepository) DeleteUserSearchRequest(ctx context.Context, userId, requestId string) error {
	query := `DELETE FROM user_search_requests WHERE id = $1 AND user_id = $2`
	_, err := r.systemDB.ExecContext(ctx, query, requestId, userId)
	return err
}

func (r *userSearchRequestRepository) GetUserSearchRequestById(ctx context.Context, requestId string) (*domain.UserSearchRequest, error) {
	query := `SELECT id, user_id, status, location, query, is_business_email, is_personal_email, contacts_number, created_at, updated_at, lat, lng, radius
			  FROM user_search_requests
			  WHERE id = $1`
	row := r.systemDB.QueryRowContext(ctx, query, requestId)

	var request domain.UserSearchRequest
	if err := row.Scan(
		&request.ID,
		&request.UserID,
		&request.Status,
		&request.Location,
		&request.Query,
		&request.IsBusinessEmail,
		&request.IsPersonalEmail,
		&request.ContactsNumber,
		&request.CreatedAt,
		&request.UpdatedAt,
		&request.Lat,
		&request.Lng,
		&request.Radius,
	); err != nil {
		return nil, err
	}
	return &request, nil
}

func (r *userSearchRequestRepository) UpdateUserSearchRequestStatus(ctx context.Context, requestId, status string) error {
	query := `UPDATE user_search_requests SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := r.systemDB.ExecContext(ctx, query, status, time.Now(), requestId)
	return err
}
