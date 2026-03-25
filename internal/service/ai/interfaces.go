package ai

import (
	"context"

	"github.com/Notifuse/notifuse/internal/domain"
)

type RecraftClient interface {
	Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error)
	ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error)
	ImagePromptMultiple(ctx context.Context, promptSetting *PromptSetting, imagePath string) ([][]byte, int, error)
}

type OpenAIClient interface {
	Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error)
	ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error)
	UploadFile(data []byte, filename string) (string, error)
}

type AIClient interface {
	Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error)
	ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error)
}

type Service interface {
	Prompt(ctx context.Context, code string, clientID string, promptSetting *PromptSetting) (string, error)
	ImagePrompt(ctx context.Context, code string, clientID string, promptSetting *PromptSetting) ([]byte, error)
	PromptTemplate(ctx context.Context, code string, clientID string, templateStr string, data map[string]string, promptSetting *PromptSetting) (string, error)
	GetPrompts(ctx context.Context) (map[string]*domain.Prompt, error)
	RenderPrompt(templateStr string, data map[string]string) (string, error)
	ImagePromptTemplate(ctx context.Context, code string, clientID string, templateStr string, data map[string]string, promptSetting *PromptSetting) ([]byte, error)
	ImageRecraftPromptTemplate(ctx context.Context, code string, clientID string, templateStr string, data map[string]string, promptSetting *PromptSetting, imagePath string) ([][]byte, error)
	GetOpenAI() OpenAIClient
	GetGemini() AIClient
	GetGrok() AIClient
	GetClaude() AIClient
	GetPerplexity() AIClient
	GetIdeogram() AIClient
	GetRecraft() RecraftClient
}
