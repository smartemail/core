package ai

import (
	"context"
	"fmt"

	"github.com/sgaunet/perplexity-go/v2"
)

type perplexityClient struct {
	apiKey string
}

func NewpPerplexityClient(apiKey string) AIClient {
	return &perplexityClient{
		apiKey: apiKey,
	}
}

func (s *perplexityClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {
	client := perplexity.NewClient(s.apiKey)
	promptMsg := []perplexity.Message{
		{
			Role:    "user",
			Content: promptSetting.Msg,
		},
	}

	req := perplexity.NewCompletionRequest(perplexity.WithMessages(promptMsg))
	err := req.Validate()
	if err != nil {
		return "", 0, fmt.Errorf("Perplexity error: %v", err)
	}

	res, err := client.SendCompletionRequest(req)
	if err != nil {
		return "", 0, fmt.Errorf("Perplexity error: %v", err)
	}

	return res.GetLastContent(), res.Usage.TotalTokens, nil
}

func (s *perplexityClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {
	return nil, 0, fmt.Errorf("Perplexity does not support image generation")
}
