package service

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/Notifuse/notifuse/config"
	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/Notifuse/notifuse/pkg/logger"
	"github.com/wneessen/go-mail"
	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

// GmailService implements the domain.EmailProviderService interface for Sendgrid
type GmailService struct {
	googleService *GoogleService
	config        *config.Config
	logger        logger.Logger
	clientFactory domain.SMTPClientFactory
}

// defaultGmailGoMailFactory implements the domain.SMTPClientFactory interface directly using go-mail
type defaultGmailGoMailFactory struct{}

func (f *defaultGmailGoMailFactory) CreateClient(host string, port int, username, password string, useTLS bool) (*mail.Client, error) {

	return nil, nil
}

// NewGmailService creates a new instance of GmailService
func NewGmailService(googleService *GoogleService, config *config.Config, logger logger.Logger) *GmailService {
	return &GmailService{
		googleService: googleService,
		config:        config,
		logger:        logger,
		clientFactory: &defaultGmailGoMailFactory{},
	}
}

// SendEmail sends an email using Sendgrid
func (s *GmailService) SendEmail(ctx context.Context, request domain.SendEmailProviderRequest) error {

	// Validate the request
	if err := request.Validate(); err != nil {
		return fmt.Errorf("invalid request: %w", err)
	}

	authToken, err := s.googleService.GetAuthToken(ctx, "")
	if err != nil {
		s.logger.Error("Failed to get auth token: " + err.Error())
		return fmt.Errorf("failed to get auth token: %w", err)
	}

	token := &oauth2.Token{AccessToken: authToken.AccessToken, TokenType: "Bearer"}

	srv, err := gmail.NewService(ctx, option.WithTokenSource(oauth2.StaticTokenSource(token)))
	if err != nil {
		return fmt.Errorf("Unable to create Gmail client: %v", err)
	}

	replyto := ""
	if request.EmailOptions.ReplyTo != "" {
		replyto = fmt.Sprintf("Reply-To: %s\r\n", request.EmailOptions.ReplyTo)
	}

	cc := ""
	bcc := ""

	// Add CC recipients if specified (filter out empty strings)
	if len(request.EmailOptions.CC) > 0 {
		validCC := make([]string, 0, len(request.EmailOptions.CC))
		for _, ccAddr := range request.EmailOptions.CC {
			if ccAddr != "" {
				validCC = append(validCC, ccAddr)
			}
		}
		if len(validCC) > 0 {
			cc = "Cc: " + strings.Join(validCC, ",") + "\r\n"
		}
	}

	// Add BCC recipients if specified (filter out empty strings)
	if len(request.EmailOptions.BCC) > 0 {
		validBCC := make([]string, 0, len(request.EmailOptions.BCC))
		for _, bccAddr := range request.EmailOptions.BCC {
			if bccAddr != "" {
				validBCC = append(validBCC, bccAddr)
			}
		}
		if len(validBCC) > 0 {
			bcc = "Bcc: " + strings.Join(validBCC, ",") + "\r\n"
		}
	}

	raw := []byte(
		fmt.Sprintf("From: %s\r\n"+
			"To: %s\r\n"+
			"Subject: %s\r\n"+
			replyto+
			cc+
			bcc+
			"X-Message-ID: %s\r\n"+
			"MIME-Version: 1.0\r\n"+
			"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
			request.FromAddress,
			request.To,
			request.Subject,
			request.MessageID,
			request.Content),
	)

	encoded := base64.URLEncoding.EncodeToString(raw)

	msg := &gmail.Message{
		Raw: encoded,
	}

	_, err = srv.Users.Messages.Send("me", msg).Do()
	if err != nil {
		s.logger.Error("Unable to send Gmail email: " + err.Error())
		return fmt.Errorf("Unable to send Gmail email: %v", err)
	}

	/*

		// Create and configure the message
		msg := mail.NewMsg(mail.WithNoDefaultUserAgent())

		if err := msg.FromFormat(request.FromName, request.FromAddress); err != nil {
			return fmt.Errorf("invalid sender: %w", err)
		}
		if err := msg.To(request.To); err != nil {
			return fmt.Errorf("invalid recipient: %w", err)
		}

		// Add CC recipients if specified (filter out empty strings)
		if len(request.EmailOptions.CC) > 0 {
			validCC := make([]string, 0, len(request.EmailOptions.CC))
			for _, ccAddr := range request.EmailOptions.CC {
				if ccAddr != "" {
					validCC = append(validCC, ccAddr)
				}
			}
			if len(validCC) > 0 {
				if err := msg.Cc(validCC...); err != nil {
					return fmt.Errorf("invalid CC recipients: %w", err)
				}
			}
		}

		// Add BCC recipients if specified (filter out empty strings)
		if len(request.EmailOptions.BCC) > 0 {
			validBCC := make([]string, 0, len(request.EmailOptions.BCC))
			for _, bccAddr := range request.EmailOptions.BCC {
				if bccAddr != "" {
					validBCC = append(validBCC, bccAddr)
				}
			}
			if len(validBCC) > 0 {
				if err := msg.Bcc(validBCC...); err != nil {
					return fmt.Errorf("invalid BCC recipients: %w", err)
				}
			}
		}

		// Add Reply-To if specified
		if request.EmailOptions.ReplyTo != "" {
			if err := msg.ReplyTo(request.EmailOptions.ReplyTo); err != nil {
				return fmt.Errorf("invalid reply-to address: %w", err)
			}
		}

		// Add message ID tracking header
		msg.SetGenHeader("X-Message-ID", request.MessageID)

		// Remove User-Agent and X-Mailer headers
		// msg.SetUserAgent("")

		msg.Subject(request.Subject)
		msg.SetBodyString(mail.TypeTextHTML, request.Content)

		// Add attachments if specified
		for i, att := range request.EmailOptions.Attachments {
			// Decode base64 content
			content, err := att.DecodeContent()
			if err != nil {
				return fmt.Errorf("attachment %d: failed to decode content: %w", i, err)
			}

			// Prepare file options for go-mail
			var fileOpts []mail.FileOption

			// Set content type if provided
			if att.ContentType != "" {
				fileOpts = append(fileOpts, mail.WithFileContentType(mail.ContentType(att.ContentType)))
			}

			// Add attachment or embed inline
			if att.Disposition == "inline" {
				// For inline attachments, set Content-ID for HTML references
				// Generate a simple Content-ID from filename (e.g., <logo.png>)
				contentID := att.Filename
				fileOpts = append(fileOpts, mail.WithFileContentID(contentID))
				_ = msg.EmbedReader(att.Filename, bytes.NewReader(content), fileOpts...)
			} else {
				_ = msg.AttachReader(att.Filename, bytes.NewReader(content), fileOpts...)
			}
		}

		// Send the email directly
		if err := client.DialAndSend(msg); err != nil {
			return fmt.Errorf("failed to send email: %w", err)
		}*/

	return nil
}
