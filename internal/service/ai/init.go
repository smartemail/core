package ai

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"html/template"
	"time"

	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/Notifuse/notifuse/pkg/logger"
)

type service struct {
	OpenAI         OpenAIClient
	Gemini         AIClient
	Grok           AIClient
	Claude         AIClient
	Perplexity     AIClient
	Ideogram       AIClient
	Recraft        RecraftClient
	aiSettingsRepo domain.AISettingRepository
	promtRepo      domain.PromptRepository
	promptLogRepo  domain.PromptLogRepository
	authService    domain.AuthService
	logger         logger.Logger
	config         Config
}

type PromptSetting struct {
	SystemInstruction string
	Msg               string
	ModelName         string
	Setting           string
	Variables         map[string]string
}

func NewAiService(aiSettingsRepo domain.AISettingRepository, promtRepo domain.PromptRepository, promptLogRepo domain.PromptLogRepository, authService domain.AuthService, logger logger.Logger, config Config) Service {
	return &service{
		promtRepo:      promtRepo,
		promptLogRepo:  promptLogRepo,
		OpenAI:         NewOpenAIClient(config.OpenAIKey),
		Gemini:         NewGeminiClient(config.GeminiKey),
		Grok:           NewGrokClient(config.GrokKey),
		Claude:         NewClaudeClient(config.ClaudeKey),
		Perplexity:     NewpPerplexityClient(config.PerplexityKey),
		Ideogram:       NewIdeogramClient(config.IdeogramKey),
		Recraft:        NewRecraftClient(config.RecraftKey),
		aiSettingsRepo: aiSettingsRepo,
		authService:    authService,
		logger:         logger,
		config:         config,
	}
}

func (s *service) GetPrompts(ctx context.Context) (map[string]*domain.Prompt, error) {

	return s.promtRepo.GetPrompts()
}

func (s *service) Prompt(ctx context.Context, code string, clientID string, promptSetting *PromptSetting) (string, error) {

	var err error
	result := ""
	totalTokens := 0

	s.logger.GetFileLogger().Prompt(fmt.Sprintf("Start call prompt: code=%s, clientID=%s, modelName=%s", code, clientID, promptSetting.ModelName))
	s.logger.GetFileLogger().Prompt(fmt.Sprintf("Prompt: %s", promptSetting.Msg))

	switch clientID {
	case CLIENT_OPENAI:
		result, totalTokens, err = s.OpenAI.Prompt(ctx, promptSetting)
	case CLIENT_CLAUDE:
		result, totalTokens, err = s.Claude.Prompt(ctx, promptSetting)
	case CLIENT_GROK:
		result, totalTokens, err = s.Grok.Prompt(ctx, promptSetting)
	case CLIENT_GEMINI:
		result, totalTokens, err = s.Gemini.Prompt(ctx, promptSetting)
	case CLIENT_PERPLEXITY:
		result, totalTokens, err = s.Perplexity.Prompt(ctx, promptSetting)
	case CLIENT_IDEOGRAM:
		result, totalTokens, err = s.Ideogram.Prompt(ctx, promptSetting)
	case CLIENT_RECRAFT:
		result, totalTokens, err = s.Recraft.Prompt(ctx, promptSetting)
	}

	if err != nil {
		s.logger.GetFileLogger().Error(fmt.Sprintf("Prompt error: code=%s, clientID=%s, modelName=%s, error=%v", code, clientID, promptSetting.ModelName, err))
		return "", err
	}

	userID := sql.NullString{}

	user, _ := s.authService.AuthenticateUserFromContext(ctx)
	if user != nil {
		userID = sql.NullString{String: user.ID, Valid: true}
	}

	go func() {
		promtLog := domain.PromptLog{
			Code:       code,
			UserID:     userID,
			ClientID:   clientID,
			ModelName:  sql.NullString{String: promptSetting.ModelName, Valid: true},
			PromptText: promptSetting.Msg,
			TokenUsage: totalTokens,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		logerr := s.promptLogRepo.Write(context.Background(), &promtLog)
		if logerr != nil {
			s.logger.GetFileLogger().Error(fmt.Sprintf("Failed to write prompt log: %v", logerr))
		}
	}()

	s.logger.GetFileLogger().Prompt(fmt.Sprintf("End call prompt: code=%s, clientID=%s, modelName=%s", code, clientID, promptSetting.ModelName))

	return result, err
}

func (s *service) ImagePrompt(ctx context.Context, code string, clientID string, promptSetting *PromptSetting) ([]byte, error) {

	var err error
	result := []byte{}
	totalTokens := 0

	s.logger.GetFileLogger().Prompt(fmt.Sprintf("Start call prompt: code=%s, clientID=%s, modelName=%s", code, clientID, promptSetting.ModelName))
	s.logger.GetFileLogger().Prompt(fmt.Sprintf("Prompt: %s", promptSetting.Msg))

	switch clientID {
	case CLIENT_OPENAI:
		result, totalTokens, err = s.OpenAI.ImagePrompt(ctx, promptSetting)
	case CLIENT_CLAUDE:
		result, totalTokens, err = s.Claude.ImagePrompt(ctx, promptSetting)
	case CLIENT_GROK:
		result, totalTokens, err = s.Grok.ImagePrompt(ctx, promptSetting)
	case CLIENT_GEMINI:
		result, totalTokens, err = s.Gemini.ImagePrompt(ctx, promptSetting)
	case CLIENT_PERPLEXITY:
		result, totalTokens, err = s.Perplexity.ImagePrompt(ctx, promptSetting)
	case CLIENT_IDEOGRAM:
		result, totalTokens, err = s.Ideogram.ImagePrompt(ctx, promptSetting)
	case CLIENT_RECRAFT:
		result, totalTokens, err = s.Recraft.ImagePrompt(ctx, promptSetting)
	}

	if err != nil {
		s.logger.GetFileLogger().Error(fmt.Sprintf("Prompt error: code=%s, clientID=%s, modelName=%s, error=%v", code, clientID, promptSetting.ModelName, err))
		return nil, err
	}

	userID := sql.NullString{}

	user, _ := s.authService.AuthenticateUserFromContext(ctx)
	if user != nil {
		userID = sql.NullString{String: user.ID, Valid: true}
	}

	go func() {
		promtLog := domain.PromptLog{
			Code:       code,
			UserID:     userID,
			ClientID:   clientID,
			ModelName:  sql.NullString{String: promptSetting.ModelName, Valid: true},
			PromptText: promptSetting.Msg,
			TokenUsage: totalTokens,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		logerr := s.promptLogRepo.Write(context.Background(), &promtLog)
		if logerr != nil {
			s.logger.GetFileLogger().Error(fmt.Sprintf("Failed to write prompt log: %v", logerr))
		}

	}()

	s.logger.GetFileLogger().Prompt(fmt.Sprintf("End call prompt: code=%s, clientID=%s, modelName=%s", code, clientID, promptSetting.ModelName))

	return result, err
}

func (s *service) RenderPrompt(templateStr string, data map[string]string) (string, error) {
	tmpl, err := template.New("prompt").Parse(templateStr)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (s *service) PromptTemplate(ctx context.Context, code string, clientID string, templateStr string, data map[string]string, promptSetting *PromptSetting) (string, error) {

	var err error
	promptSetting.Msg, err = s.RenderPrompt(templateStr, data)
	if err != nil {
		return "", err
	}

	if promptSetting.SystemInstruction != "" {
		promptSetting.SystemInstruction, err = s.RenderPrompt(promptSetting.SystemInstruction, data)
		if err != nil {
			return "", err
		}
	}

	promptSetting.Variables = data

	return s.Prompt(ctx, code, clientID, promptSetting)
}

func (s *service) ImagePromptTemplate(ctx context.Context, code string, clientID string, templateStr string, data map[string]string, promptSetting *PromptSetting) ([]byte, error) {

	var err error
	promptSetting.Msg, err = s.RenderPrompt(templateStr, data)
	if err != nil {
		return nil, err
	}

	if promptSetting.SystemInstruction != "" {
		promptSetting.SystemInstruction, err = s.RenderPrompt(promptSetting.SystemInstruction, data)
		if err != nil {
			return nil, err
		}
	}

	promptSetting.Variables = data

	return s.ImagePrompt(ctx, code, clientID, promptSetting)
}

func (s *service) ImageRecraftPromptTemplate(ctx context.Context, code string, clientID string, templateStr string, data map[string]string, promptSetting *PromptSetting, imagePath string) ([][]byte, error) {

	s.logger.GetFileLogger().Prompt(fmt.Sprintf("Start call prompt: code=%s, clientID=%s, modelName=%s", code, clientID, promptSetting.ModelName))
	s.logger.GetFileLogger().Prompt(fmt.Sprintf("Prompt: %s", promptSetting.Msg))

	var err error
	promptSetting.Msg, err = s.RenderPrompt(templateStr, data)
	if err != nil {
		return nil, err
	}

	if promptSetting.SystemInstruction != "" {
		promptSetting.SystemInstruction, err = s.RenderPrompt(promptSetting.SystemInstruction, data)
		if err != nil {
			return nil, err
		}
	}

	result, totalTokens, err := s.Recraft.ImagePromptMultiple(ctx, promptSetting, imagePath)
	if err != nil {
		s.logger.GetFileLogger().Error(fmt.Sprintf("Prompt error: code=%s, clientID=%s, modelName=%s, error=%v", code, clientID, promptSetting.ModelName, err))
		return nil, err
	}

	userID := sql.NullString{}

	user, _ := s.authService.AuthenticateUserFromContext(ctx)
	if user != nil {
		userID = sql.NullString{String: user.ID, Valid: true}
	}

	go func() {

		promtLog := domain.PromptLog{
			Code:       code,
			UserID:     userID,
			ClientID:   clientID,
			ModelName:  sql.NullString{String: promptSetting.ModelName, Valid: true},
			PromptText: promptSetting.Msg,
			TokenUsage: totalTokens,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		logerr := s.promptLogRepo.Write(context.Background(), &promtLog)
		if logerr != nil {
			s.logger.GetFileLogger().Error(fmt.Sprintf("Failed to write prompt log: %v", logerr))
		}

	}()

	s.logger.GetFileLogger().Prompt(fmt.Sprintf("End call prompt: code=%s, clientID=%s, modelName=%s", code, clientID, promptSetting.ModelName))

	return result, err

}

func (s *service) GetOpenAI() OpenAIClient {
	return s.OpenAI
}

func (s *service) GetGemini() AIClient {
	return s.Gemini
}

func (s *service) GetGrok() AIClient {
	return s.Grok
}

func (s *service) GetClaude() AIClient {
	return s.Claude
}

func (s *service) GetPerplexity() AIClient {
	return s.Perplexity
}

func (s *service) GetIdeogram() AIClient {
	return s.Ideogram
}

func (s *service) GetRecraft() RecraftClient {
	return s.Recraft
}
