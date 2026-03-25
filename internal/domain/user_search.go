package domain

import (
	"context"
	"time"
)

const (
	UserSearchRequestStatusPending    = "pending"
	UserSearchRequestStatusProcessing = "processing"
	UserSearchRequestStatusCompleted  = "completed"
	UserSearchRequestStatusFailed     = "failed"
)

type UserSearchRequest struct {
	ID              string    `json:"-" db:"id"`
	UserID          string    `json:"-" db:"user_id"`
	Status          string    `json:"status" db:"status"`
	Location        string    `json:"location" db:"location"`
	Query           string    `json:"query" db:"query"`
	IsBusinessEmail bool      `json:"is_business_email" db:"is_business_email"`
	IsPersonalEmail bool      `json:"is_personal_email" db:"is_personal_email"`
	ContactsNumber  int       `json:"contacts_number" db:"contacts_number"`
	Lat             float64   `json:"lat" db:"lat"`
	Lng             float64   `json:"lng" db:"lng"`
	Radius          int       `json:"radius" db:"radius"`
	CreatedAt       time.Time `json:"-" db:"created_at"`
	UpdatedAt       time.Time `json:"-" db:"updated_at"`
}

type SerpSearchResponse struct {
	SearchParameters SerpSearchParameters `json:"searchParameters"`
	Organic          []SerpOrganicResult  `json:"organic"`
	Credits          int                  `json:"credits"`
}

type SerpSearchParameters struct {
	Q      string `json:"q"`
	Type   string `json:"type"`
	Page   int    `json:"page"`
	Engine string `json:"engine"`
}

type SerpOrganicResult struct {
	Title    string `json:"title"`
	Link     string `json:"link"`
	Snippet  string `json:"snippet"`
	Position int    `json:"position"`
	Date     string `json:"date,omitempty"` // поле есть не у всех
}

type UserSearchRequestRepository interface {
	CreateUserSearchRequest(ctx context.Context, request *UserSearchRequest) error
	GetUserSearchRequests(ctx context.Context, userId string) ([]*UserSearchRequest, error)
	DeleteUserSearchRequest(ctx context.Context, userId, requestId string) error
	GetUserSearchRequestById(ctx context.Context, requestId string) (*UserSearchRequest, error)
	GetAllUserSearchRequests(ctx context.Context, filters map[string]any, orderBy map[string]string, limit int) ([]*UserSearchRequest, error)
	UpdateUserSearchRequestStatus(ctx context.Context, requestId, status string) error
}

type UserSearchRequestService interface {
	CreateUserSearchRequest(ctx context.Context, request *UserSearchRequest) error
	GetUserSearchRequests(ctx context.Context) ([]*UserSearchRequest, error)
	DeleteUserSearchRequest(ctx context.Context, requestId string) error
	GetUserSearchRequestById(ctx context.Context, requestId string) (*UserSearchRequest, error)
	ProcessSearchRequests()
}
