package ai

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

type recraftClient struct {
	apiKey string
}

type RecraftImageResponse struct {
	Created int                `json:"created"`
	Credits int                `json:"credits"`
	Data    []RecraftImageItem `json:"data"`
}

type RecraftImageItem struct {
	B64JSON       string          `json:"b64_json"`
	Features      RecraftFeatures `json:"features"`
	ImageID       string          `json:"image_id"`
	RevisedPrompt string          `json:"revised_prompt"`
	URL           string          `json:"url"`
}

type RecraftFeatures struct {
	NSFWScore float64 `json:"nsfw_score"`
}

func NewRecraftClient(apiKey string) RecraftClient {
	return &recraftClient{
		apiKey: apiKey,
	}
}

func (s *recraftClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {

	return "", 0, fmt.Errorf("Recraft does not support text generation")
}

func (s *recraftClient) loadRemoteFile(ctx context.Context, imagePath string) ([]byte, error) {
	resp, err := http.Get(imagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	return data, nil
}

func (s *recraftClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {
	return nil, 0, fmt.Errorf("Recraft support only multiple image generation, use ImagePromptMultiple method")
}

func (s *recraftClient) ImagePromptMultiple(ctx context.Context, promptSetting *PromptSetting, imagePath string) ([][]byte, int, error) {

	file, err := s.loadRemoteFile(ctx, imagePath)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to load remote file: %w", err)
	}
	fileReader := bytes.NewReader(file)
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	fileWriter, err := writer.CreateFormFile("image", "image.png")
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create form file: %w", err)
	}
	_, err = io.Copy(fileWriter, fileReader)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to copy file content: %w", err)
	}

	_ = writer.WriteField("prompt", promptSetting.Msg)
	_ = writer.WriteField("strength", "0.2")
	_ = writer.WriteField("response_format", "b64_json")

	if promptSetting.Setting != "" {
		settingsMap := make(map[string]string)
		if err := json.Unmarshal([]byte(promptSetting.Setting), &settingsMap); err != nil {
			return nil, 0, fmt.Errorf("failed to parse settings JSON: %w", err)
		}
		for key, value := range settingsMap {
			if value == "" {
				continue
			}
			if err := writer.WriteField(key, value); err != nil {
				return nil, 0, fmt.Errorf("failed to write settings field %s: %w", key, err)
			}
		}
	}

	writer.Close()

	req, err := http.NewRequest("POST", "https://external.api.recraft.ai/v1/images/imageToImage", body)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	respProcessing, err := client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to send request: %w", err)
	}
	defer respProcessing.Body.Close()

	respBody, err := io.ReadAll(respProcessing.Body)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to read response body: %w", err)
	}

	parsed := RecraftImageResponse{}
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return nil, 0, fmt.Errorf("failed to parse response JSON: %w", err)
	}

	files := make([][]byte, 0)

	data := parsed.Data
	for _, v := range data {
		decoded, err := base64.StdEncoding.DecodeString(v.B64JSON)
		if err != nil {
			continue
		}
		files = append(files, decoded)
	}

	return files, parsed.Credits, nil
}
