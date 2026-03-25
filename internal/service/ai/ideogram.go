package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"mime/multipart"
	"net/http"
)

type ideogramClient struct {
	apiKey string
}

type IdeogramResponse struct {
	Created string `json:"created"`
	Data    []struct {
		Prompt      string `json:"prompt"`
		Resolution  string `json:"resolution"`
		IsImageSafe bool   `json:"is_image_safe"`
		Seed        int    `json:"seed"`
		URL         string `json:"url"`
		StyleType   string `json:"style_type"`
	} `json:"data"`
}

func NewIdeogramClient(apiKey string) AIClient {
	return &ideogramClient{
		apiKey: apiKey,
	}
}

func (s *ideogramClient) Prompt(ctx context.Context, promptSetting *PromptSetting) (string, int, error) {

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	if err := writer.WriteField("prompt", promptSetting.Msg); err != nil {
		return "", 0, fmt.Errorf("failed to write prompt field: %w", err)
	}

	if err := writer.WriteField("rendering_speed", "TURBO"); err != nil {
		return "", 0, fmt.Errorf("failed to write rendering_speed field: %w", err)
	}

	if err := writer.WriteField("seed", fmt.Sprintf("%d", rand.Intn(2147483647))); err != nil {
		return "", 0, fmt.Errorf("failed to write seed field: %w", err)
	}

	if promptSetting.Setting != "" {
		settingsMap := make(map[string]string)
		if err := json.Unmarshal([]byte(promptSetting.Setting), &settingsMap); err != nil {
			return "", 0, fmt.Errorf("failed to parse settings JSON: %w", err)
		}
		for key, value := range settingsMap {
			if value == "" {
				continue
			}

			if key == "style_reference_images" {
				if url, ok := promptSetting.Variables[value]; ok {

					resp, err := http.Get(url)
					if err != nil {
						return "", 0, fmt.Errorf("failed to download style reference image: %w", err)
					}
					defer resp.Body.Close()

					if resp.StatusCode != http.StatusOK {
						return "", 0, fmt.Errorf("failed to download style reference image: status %d", resp.StatusCode)
					}

					fileWriter, err := writer.CreateFormFile(key, "style_reference_images.png")
					if err != nil {
						return "", 0, fmt.Errorf("failed to create form file for %s: %w", key, err)
					}

					_, err = io.Copy(fileWriter, resp.Body)
					if err != nil {
						return "", 0, fmt.Errorf("failed to create form file for %s: %w", key, err)
					}

				}
				continue
			}

			if err := writer.WriteField(key, value); err != nil {
				return "", 0, fmt.Errorf("failed to write settings field %s: %w", key, err)
			}
		}
	}

	writer.Close()

	req, err := http.NewRequest("POST", "https://api.ideogram.ai/v1/ideogram-v3/generate", body)
	if err != nil {
		return "", 0, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Api-Key", s.apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", 0, fmt.Errorf("ideogram API error: status %d, body: %s", resp.StatusCode, string(body))
	}

	var ideogramResp IdeogramResponse
	if err := json.NewDecoder(resp.Body).Decode(&ideogramResp); err != nil {
		return "", 0, fmt.Errorf("failed to decode response: %w", err)
	}
	if len(ideogramResp.Data) == 0 {
		return "", 0, fmt.Errorf("ideogram API error: no data in response")
	}

	return ideogramResp.Data[0].URL, 0, nil
}

func (s *ideogramClient) ImagePrompt(ctx context.Context, promptSetting *PromptSetting) ([]byte, int, error) {

	result, _, err := s.Prompt(ctx, promptSetting)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get image URL: %w", err)
	}

	resp, err := http.Get(result)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, 0, fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	imageData := &bytes.Buffer{}
	if _, err := imageData.ReadFrom(resp.Body); err != nil {
		return nil, 0, fmt.Errorf("failed to read image data: %w", err)
	}

	return imageData.Bytes(), 0, nil
}
