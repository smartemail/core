package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type claudeClient struct {
	apiKey string
}

type MessageRequest struct {
	Model     string        `json:"model"`
	MaxTokens int           `json:"max_tokens"`
	Messages  []MessageItem `json:"messages"`
	System    string        `json:"system"`
}

type MessageItem struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MessageResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
	Usage struct {
		InputTokens  int `json:"input_tokens"`
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}

func NewClaudeClient(apiKey string) AIClient {
	return &claudeClient{
		apiKey: apiKey,
	}
}

func (s *claudeClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {

	reqBody := MessageRequest{
		Model:     promptSetting.ModelName,
		MaxTokens: 200,
		Messages: []MessageItem{
			{
				Role:    "user",
				Content: promptSetting.Msg,
			},
		},
		System: promptSetting.SystemInstruction,
	}

	bodyBytes, _ := json.Marshal(reqBody)

	req, err := http.NewRequest(
		"POST",
		"https://api.anthropic.com/v1/messages",
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		return "", 0, fmt.Errorf("Claude error: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("Claude error: %v", err)
	}
	defer resp.Body.Close()

	var result MessageResponse
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return "", 0, fmt.Errorf("Claude error: %v", err)
	}

	var response strings.Builder
	for _, c := range result.Content {
		response.WriteString(c.Text)
	}

	return response.String(), result.Usage.InputTokens + result.Usage.OutputTokens, nil

}

func (s *claudeClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {
	return nil, 0, fmt.Errorf("Claude does not support image generation")
}
