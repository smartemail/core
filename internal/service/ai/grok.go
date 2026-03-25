package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type grokClient struct {
	apiKey string
}

type GrokResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int64    `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   struct {
		TotalTokens int `json:"total_tokens"`
	} `json:"usage"`
}

type Choice struct {
	Index   int     `json:"index"`
	Message Message `json:"message"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func NewGrokClient(apiKey string) AIClient {
	return &grokClient{
		apiKey: apiKey,
	}
}

func (s *grokClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {

	apiKey := s.apiKey

	body := map[string]interface{}{
		"model": promptSetting.ModelName,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": promptSetting.Msg,
			},
		},
		"max_tokens": 200,
	}

	jsonBody, _ := json.Marshal(body)

	req, err := http.NewRequest(
		"POST",
		"https://api.x.ai/v1/chat/completions",
		bytes.NewBuffer(jsonBody),
	)
	if err != nil {
		return "", 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	response := &GrokResponse{}
	json.Unmarshal(respBody, response)

	return response.Choices[0].Message.Content, response.Usage.TotalTokens, nil
}

func (s *grokClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {
	return nil, 0, fmt.Errorf("Grok does not support image generation")
}
