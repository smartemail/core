package domain

import (
	"context"
	"fmt"

	"github.com/Notifuse/notifuse/pkg/crypto"
	"github.com/wneessen/go-mail"
)

//go:generate mockgen -destination mocks/mock_smtp_client.go -package mocks github.com/Notifuse/notifuse/internal/domain SMTPClientFactory,SMTPService

// SMTPWebhookPayload represents an SMTP webhook payload
// SMTP doesn't typically have a built-in webhook system, so this is a generic structure
// that could be used with a third-party SMTP provider that offers webhooks
type GmailWebhookPayload struct {
	Event          string            `json:"event"`
	Timestamp      string            `json:"timestamp"`
	MessageID      string            `json:"message_id"`
	Recipient      string            `json:"recipient"`
	Metadata       map[string]string `json:"metadata,omitempty"`
	Tags           []string          `json:"tags,omitempty"`
	Reason         string            `json:"reason,omitempty"`
	Description    string            `json:"description,omitempty"`
	BounceCategory string            `json:"bounce_category,omitempty"`
	DiagnosticCode string            `json:"diagnostic_code,omitempty"`
	ComplaintType  string            `json:"complaint_type,omitempty"`
}

// GmailSettings contains configuration for SMTP email server
type GmailSettings struct {
	Host              string `json:"host"`
	Port              int    `json:"port"`
	EncryptedUsername string `json:"encrypted_username,omitempty"`
	EncryptedPassword string `json:"encrypted_password,omitempty"`
	UseTLS            bool   `json:"use_tls"`

	// decoded username, not stored in the database
	// decoded password , not stored in the database
	Username string `json:"username"`
	Password string `json:"password,omitempty"`

	UseSystemData bool `json:"use_system_data"`
}

func (s *GmailSettings) DecryptUsername(passphrase string) error {
	username, err := crypto.DecryptFromHexString(s.EncryptedUsername, passphrase)
	if err != nil {
		return fmt.Errorf("failed to decrypt SMTP username: %w", err)
	}
	s.Username = username
	return nil
}

func (s *GmailSettings) EncryptUsername(passphrase string) error {
	encryptedUsername, err := crypto.EncryptString(s.Username, passphrase)
	if err != nil {
		return fmt.Errorf("failed to encrypt SMTP username: %w", err)
	}
	s.EncryptedUsername = encryptedUsername
	return nil
}

func (s *GmailSettings) DecryptPassword(passphrase string) error {
	password, err := crypto.DecryptFromHexString(s.EncryptedPassword, passphrase)
	if err != nil {
		return fmt.Errorf("failed to decrypt SMTP password: %w", err)
	}
	s.Password = password
	return nil
}

func (s *GmailSettings) EncryptPassword(passphrase string) error {
	encryptedPassword, err := crypto.EncryptString(s.Password, passphrase)
	if err != nil {
		return fmt.Errorf("failed to encrypt SMTP password: %w", err)
	}
	s.EncryptedPassword = encryptedPassword
	return nil
}

func (s *GmailSettings) Validate(passphrase string) error {

	return nil
}

// GmailClientFactory is an interface for creating SMTP mail clients
type GmailClientFactory interface {
	CreateClient(host string, port int, username, password string, useTLS bool) (*mail.Client, error)
}

// GmailService is an interface for SMTP email sending service
type GmailService interface {
	SendEmail(ctx context.Context, workspaceID string, fromAddress, fromName, to, subject, content string, provider *EmailProvider) error
}
