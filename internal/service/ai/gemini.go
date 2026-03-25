package ai

import (
	"context"
	"fmt"

	"google.golang.org/genai"
)

type geminiClient struct {
	apiKey string
}

func NewGeminiClient(apiKey string) AIClient {
	return &geminiClient{
		apiKey: apiKey,
	}
}

func (s *geminiClient) getClient() (*genai.Client, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: s.apiKey,
	})
	if err != nil {
		return nil, err
	}

	return client, nil
}

func (s *geminiClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {

	client, err := s.getClient()
	if err != nil {
		return "", 0, err
	}

	var tools []*genai.Tool
	tools = append(tools, &genai.Tool{
		GoogleSearch: &genai.GoogleSearch{},
	})

	cfg := &genai.GenerateContentConfig{

		Tools: tools,
	}

	if promptSetting.SystemInstruction != "" {
		parts := []*genai.Part{
			genai.NewPartFromText(promptSetting.SystemInstruction),
		}
		cfg.SystemInstruction = &genai.Content{
			Role:  "system",
			Parts: parts,
		}
	}

	result, err := client.Models.GenerateContent(
		ctx,
		promptSetting.ModelName,
		genai.Text(promptSetting.Msg),
		cfg,
	)

	if err != nil {
		return "", 0, fmt.Errorf("Gemini error: %v", err)
	}

	return result.Text(), int(result.UsageMetadata.TotalTokenCount), nil
}

func (s *geminiClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {

	client, err := s.getClient()
	if err != nil {
		return nil, 0, err
	}

	result, _ := client.Models.GenerateContent(
		ctx,
		promptSetting.ModelName,
		genai.Text(promptSetting.Msg),
		&genai.GenerateContentConfig{
			ImageConfig: &genai.ImageConfig{
				AspectRatio: "16:9",
			},
		},
	)

	resultBytes := []byte{}

	for _, part := range result.Candidates[0].Content.Parts {
		if part.InlineData != nil {
			resultBytes = append(resultBytes, part.InlineData.Data...)
		}
	}
	return resultBytes, int(result.UsageMetadata.TotalTokenCount), nil
}
