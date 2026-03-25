package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
)

type openAIClient struct {
	apiKey string
}

type OpenAIResponse struct {
	ID          string `json:"id"`
	Object      string `json:"object"`
	CreatedAt   int64  `json:"created_at"`
	Status      string `json:"status"`
	CompletedAt int64  `json:"completed_at"`
	Error       struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error"`
	IncompleteDetails  interface{}     `json:"incomplete_details"`
	Instructions       interface{}     `json:"instructions"`
	MaxOutputTokens    interface{}     `json:"max_output_tokens"`
	Model              string          `json:"model"`
	Output             []OpenAIOutput  `json:"output"`
	ParallelToolCalls  bool            `json:"parallel_tool_calls"`
	PreviousResponseID interface{}     `json:"previous_response_id"`
	Reasoning          OpenAIReasoning `json:"reasoning"`
	Store              bool            `json:"store"`
	Temperature        float64         `json:"temperature"`
	Text               OpenAITextBlock `json:"text"`
	ToolChoice         string          `json:"tool_choice"`
	Tools              []any           `json:"tools"`
	TopP               float64         `json:"top_p"`
	Truncation         string          `json:"truncation"`
	Usage              OpenAIUsage     `json:"usage"`
	User               interface{}     `json:"user"`
	Metadata           map[string]any  `json:"metadata"`
}

type OpenAIOutput struct {
	Type    string          `json:"type"`
	ID      string          `json:"id"`
	Status  string          `json:"status"`
	Role    string          `json:"role"`
	Content []OpenAIContent `json:"content"`
}

type OpenAIContent struct {
	Type        string        `json:"type"`
	Text        string        `json:"text"`
	Annotations []interface{} `json:"annotations"`
}

type OpenAIReasoning struct {
	Effort  interface{} `json:"effort"`
	Summary interface{} `json:"summary"`
}

type OpenAITextBlock struct {
	Format struct {
		Type string `json:"type"`
	} `json:"format"`
}

type OpenAIRequest struct {
	Model string        `json:"model"`
	Input []OpenAIInput `json:"input"`
}

type OpenAIInput struct {
	Role    string               `json:"role"`
	Content []OpenAIInputContent `json:"content"`
}

type OpenAIInputContent struct {
	Type     string `json:"type"`
	Text     string `json:"text,omitempty"`
	FileURL  string `json:"file_url,omitempty"`
	FileID   string `json:"file_id,omitempty"`
	FileName string `json:"filename,omitempty"`
}

type OpenAIUsage struct {
	InputTokens        int `json:"input_tokens"`
	InputTokensDetails struct {
		CachedTokens int `json:"cached_tokens"`
	} `json:"input_tokens_details"`
	OutputTokens        int `json:"output_tokens"`
	OutputTokensDetails struct {
		ReasoningTokens int `json:"reasoning_tokens"`
	} `json:"output_tokens_details"`
	TotalTokens int `json:"total_tokens"`
}

func NewOpenAIClient(apiKey string) OpenAIClient {
	return &openAIClient{
		apiKey: apiKey,
	}
}

func (s *openAIClient) detectInputType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
		return "input_image"

	case ".pdf", ".txt", ".csv", ".json", ".doc", ".docx",
		".ppt", ".pptx", ".xls", ".xlsx", ".md", ".html":
		return "input_file"

	default:
		// fallback — если неизвестный формат, считаем документом
		return "input_file"
	}
}

func (s *openAIClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {
	url := "https://api.openai.com/v1/responses"

	fileId := promptSetting.Variables["file_id"]
	fileName := promptSetting.Variables["filename"]

	// Базовый контент — текст
	content := []OpenAIInputContent{
		{
			Type: "input_text",
			Text: promptSetting.Msg,
		},
	}

	// Если есть file_id — добавляем файл
	if fileId != "" {
		content = append(content, OpenAIInputContent{
			Type:   s.detectInputType(fileName),
			FileID: fileId,
		})
	}

	// Новый формат запроса
	reqBody := OpenAIRequest{
		Model: promptSetting.ModelName,
		Input: []OpenAIInput{
			{
				Role:    "user",
				Content: content,
			},
		},
	}

	bodyBytes, _ := json.Marshal(reqBody)

	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	// Новый формат ответа
	var result OpenAIResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", 0, fmt.Errorf("OpenAI error: %v", err)
	}

	fmt.Println(result)

	if len(result.Output) == 0 ||
		len(result.Output[0].Content) == 0 ||
		result.Output[0].Content[0].Text == "" {
		return "", 0, fmt.Errorf("OpenAI error: empty response from OpenAI")
	}

	return result.Output[0].Content[0].Text, result.Usage.TotalTokens, nil
}

func (s *openAIClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {
	return nil, 0, fmt.Errorf("OpenAI does not support image generation")
}

func (s *openAIClient) UploadFile(data []byte, filename string) (string, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Создаём файл в multipart
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", err
	}

	// Пишем байты файла
	if _, err = part.Write(data); err != nil {
		return "", err
	}

	// Обязательное поле
	if err := writer.WriteField("purpose", "user_data"); err != nil {
		return "", err
	}

	writer.Close()

	// Формируем запрос
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/files", &body)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Ответ
	var result struct {
		ID       string `json:"id"`
		FileName string `json:"filename"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {

		return "", err
	}

	return result.ID, nil
}
