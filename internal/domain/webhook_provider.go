package domain

import (
	"context"
	"time"
)

//go:generate mockgen -destination mocks/mock_webhook_provider.go -package mocks github.com/Notifuse/notifuse/internal/domain WebhookProvider

// WebhookProvider defines a common interface for all email providers that support webhooks
type WebhookProvider interface {
	// RegisterWebhooks registers webhooks for the specified events
	RegisterWebhooks(ctx context.Context, workspaceID, integrationID string, baseURL string, eventTypes []EmailEventType, providerConfig *EmailProvider) (*WebhookRegistrationStatus, error)

	// GetWebhookStatus checks the current status of webhooks
	GetWebhookStatus(ctx context.Context, workspaceID, integrationID string, providerConfig *EmailProvider) (*WebhookRegistrationStatus, error)

	// UnregisterWebhooks removes all webhooks for this integration
	UnregisterWebhooks(ctx context.Context, workspaceID, integrationID string, providerConfig *EmailProvider) error
}

type WebhookEventListParams struct {
	// Cursor-based pagination
	Cursor string `json:"cursor,omitempty"`
	Limit  int    `json:"limit,omitempty"`

	// Workspace identification
	WorkspaceID string `json:"workspace_id"`

	// Filters
	EventType      EmailEventType `json:"event_type,omitempty"`
	RecipientEmail string         `json:"recipient_email,omitempty"`
	MessageID      string         `json:"message_id,omitempty"`

	// Time range filters
	TimestampAfter  *time.Time `json:"timestamp_after,omitempty"`
	TimestampBefore *time.Time `json:"timestamp_before,omitempty"`
}

// WebhookEvent represents an event received from an email provider or integration webhook
type WebhookEvent struct {
	ID             string         `json:"id"`
	Type           EmailEventType `json:"type"`
	Source         WebhookSource  `json:"source"`
	IntegrationID  string         `json:"integration_id"`
	RecipientEmail string         `json:"recipient_email"`
	MessageID      *string        `json:"message_id,omitempty"`
	Timestamp      time.Time      `json:"timestamp"`
	RawPayload     string         `json:"raw_payload"`

	// Bounce specific fields
	BounceType       string `json:"bounce_type,omitempty"`
	BounceCategory   string `json:"bounce_category,omitempty"`
	BounceDiagnostic string `json:"bounce_diagnostic,omitempty"`

	// Complaint specific fields
	ComplaintFeedbackType string `json:"complaint_feedback_type,omitempty"`

	CreatedAt time.Time `json:"created_at"` // Creation timestamp in the database
}

// WebhookEventListResult contains the result of a ListWebhookEvents operation
type WebhookEventListResult struct {
	Events     []*WebhookEvent `json:"events"`
	NextCursor string          `json:"next_cursor,omitempty"`
	HasMore    bool            `json:"has_more"`
}

// WebhookEventServiceInterface defines the interface for webhook event service
type WebhookEventServiceInterface interface {
	// ProcessWebhook processes a webhook event from an email provider
	ProcessWebhook(ctx context.Context, workspaceID, integrationID string, rawPayload []byte) error

	// ListEvents retrieves all webhook events for a workspace
	ListEvents(ctx context.Context, workspaceID string, params WebhookEventListParams) (*WebhookEventListResult, error)
}

// WebhookEventRepository is the interface for webhook event operations
type WebhookEventRepository interface {
	// StoreEvents stores a webhook event in the database
	StoreEvents(ctx context.Context, workspaceID string, events []*WebhookEvent) error

	// ListEvents retrieves all webhook events for a workspace
	ListEvents(ctx context.Context, workspaceID string, params WebhookEventListParams) (*WebhookEventListResult, error)

	// DeleteForEmail deletes all webhook events for a specific email
	DeleteForEmail(ctx context.Context, workspaceID, email string) error
}
