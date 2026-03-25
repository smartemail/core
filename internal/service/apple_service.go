package service

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"os"

	"github.com/Notifuse/notifuse/config"
	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/Notifuse/notifuse/pkg/logger"
	"github.com/Timothylock/go-signin-with-apple/apple"
)

type AppleService struct {
	logger logger.Logger
	config *config.Config
}

type AppleClaims struct {
	Sub      string `json:"sub"`
	Email    string `json:"email"`
	AuthTime int64  `json:"auth_time"`
}

func NewAppleService(logger logger.Logger, config *config.Config) *AppleService {
	return &AppleService{
		logger: logger,
		config: config,
	}
}

func (s *AppleService) GetSignInUrl() string {
	state := "random_csrf_token_or_session_id"
	v := url.Values{}
	v.Set("response_type", "code")
	v.Set("response_mode", "form_post")
	v.Set("client_id", s.config.Apple.ClientID)
	v.Set("redirect_uri", s.config.Apple.RedirectUrl)

	v.Set("scope", "name email")
	v.Set("state", state)

	authURL := "https://appleid.apple.com/auth/authorize?" + v.Encode()
	return authURL
}

func (s *AppleService) CheckUser(code string) (*domain.AppleUser, error) {

	appleUser := &domain.AppleUser{}
	applePrivateKey, err := os.ReadFile(s.config.Apple.PrivateKey)
	if err != nil {
		return nil, err
	}
	clientSecret, err := apple.GenerateClientSecret(
		string(applePrivateKey),
		s.config.Apple.TeamID,
		s.config.Apple.ClientID,
		s.config.Apple.KeyID,
	)

	if err != nil {
		s.logger.Error("GenerateClientSecret error: " + err.Error())
		return nil, err
	}

	client := apple.New()

	vReq := apple.WebValidationTokenRequest{
		ClientID:     s.config.Apple.ClientID,
		ClientSecret: clientSecret,
		Code:         code,
		RedirectURI:  s.config.Apple.RedirectUrl,
	}

	var resp apple.ValidationResponse

	if err := client.VerifyWebToken(context.Background(), vReq, &resp); err != nil {
		s.logger.Error("VerifyWebToken error: " + err.Error())
		return nil, err
	}

	claimsMap, err := apple.GetClaims(resp.IDToken)
	if err != nil {
		log.Printf("GetClaims error: %v", err)
		return nil, err
	}

	jsonData, _ := json.Marshal(claimsMap)

	var claims AppleClaims
	if err := json.Unmarshal(jsonData, &claims); err != nil {
		log.Printf("claims unmarshal error: %v", err)
		return nil, err
	}

	appleUser.Email = claims.Email
	appleUser.Sub = claims.Sub
	appleUser.AuthTime = claims.AuthTime

	return appleUser, nil
}
