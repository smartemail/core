package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"

	"net/http"
	"time"

	"github.com/Notifuse/notifuse/config"
	"github.com/Notifuse/notifuse/internal/domain"
	"github.com/Notifuse/notifuse/pkg/logger"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/people/v1"
)

type GoogleService struct {
	authService       domain.AuthService
	authTokenRepo     domain.AuthTokenRepository
	logger            logger.Logger
	config            *config.Config
	googleOauthConfig *oauth2.Config
}

type PlaceSearchRequest struct {
	TextQuery    string `json:"textQuery"`
	LocationBias struct {
		Circle struct {
			Center struct {
				Latitude  float64 `json:"latitude"`
				Longitude float64 `json:"longitude"`
			} `json:"center"`
			Radius int `json:"radius"`
		} `json:"circle"`
	} `json:"locationBias"`
	PageToken string `json:"pageToken,omitempty"`
}

type Place struct {
	ID          string `json:"id"`
	DisplayName struct {
		Text string `json:"text"`
	} `json:"displayName"`
	FormattedAddress string `json:"formattedAddress"`
	WebsiteUri       string `json:"websiteUri"`
}

type PlaceSearchResponse struct {
	Places        []Place `json:"places"`
	NextPageToken string  `json:"nextPageToken"`
}

func NewGoogleService(
	authService domain.AuthService,
	authTokenRepo domain.AuthTokenRepository,
	logger logger.Logger, config *config.Config) *GoogleService {

	googleOauthConfig := &oauth2.Config{
		RedirectURL:  config.Google.CallbackUrl,
		ClientID:     config.Google.ClientID,
		ClientSecret: config.Google.ClientSecret,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/contacts.other.readonly",
			"https://www.googleapis.com/auth/gmail.send",
		},
		Endpoint: google.Endpoint,
	}

	return &GoogleService{
		authService:       authService,
		authTokenRepo:     authTokenRepo,
		logger:            logger,
		config:            config,
		googleOauthConfig: googleOauthConfig,
	}
}

func (s *GoogleService) CheckUser(code string) (domain.GoogleUser, *oauth2.Token, error) {

	var userInfo domain.GoogleUser

	token, err := s.googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		s.logger.Error("Code exchange failed: " + err.Error())
		return userInfo, nil, err
	}

	idToken := token.Extra("id_token").(string)
	resp, _ := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
	defer resp.Body.Close()

	json.NewDecoder(resp.Body).Decode(&userInfo)

	return userInfo, token, nil
}

func (s *GoogleService) GetClient(ctx context.Context, userID string) (*http.Client, bool, error) {

	savedToken, _ := s.authTokenRepo.GetTokens(ctx, userID)
	isRefreshed := false
	if !savedToken.Valid() {
		s.logger.Info("Refresh token")
		ts := s.googleOauthConfig.TokenSource(context.Background(), savedToken)
		newToken, err := ts.Token()
		if err != nil {
			s.logger.Error("Failed to refresh token: " + err.Error())
			return nil, isRefreshed, fmt.Errorf("failed to refresh token: %w", err)
		}
		savedToken = newToken
		isRefreshed = true
		s.UpdateAuthToken(ctx, userID, savedToken)
	}

	tokenSource := oauth2.StaticTokenSource(savedToken)
	client := oauth2.NewClient(context.Background(), tokenSource)
	return client, isRefreshed, nil
}

func (s *GoogleService) GetAuthToken(ctx context.Context, userID string) (*oauth2.Token, error) {

	if userID == "" {
		//Get from context
		user, err := s.authService.AuthenticateUserFromContext(ctx)
		if err != nil {
			return nil, err
		}

		userID = user.ID
	}
	savedToken, _ := s.authTokenRepo.GetTokens(ctx, userID)
	if !savedToken.Valid() {
		s.logger.Info("Refresh token")
		ts := s.googleOauthConfig.TokenSource(context.Background(), savedToken)
		newToken, err := ts.Token()
		if err != nil {
			s.logger.Error("Failed to refresh token: " + err.Error())
			return nil, fmt.Errorf("failed to refresh token: %w", err)
		}
		savedToken = newToken
		s.UpdateAuthToken(ctx, userID, savedToken)
	}

	return savedToken, nil
}

func (s *GoogleService) UpdateAuthToken(ctx context.Context, userID string, token *oauth2.Token) error {
	return s.authTokenRepo.UpdateTokens(ctx, userID, token)
}

func (s *GoogleService) ImportContacts(ctx context.Context, userId, workspaceID string) ([]*domain.Contact, error) {

	contacts := []*domain.Contact{}
	client, _, err := s.GetClient(ctx, userId)
	if err != nil {
		return contacts, err
	}
	srv, err := people.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		s.logger.Error("Unable to create People API service: " + err.Error())
		return contacts, err
	}
	pageToken := ""
	for {
		req := srv.People.Connections.List("people/me").
			PersonFields("names,emailAddresses,phoneNumbers").
			PageSize(1000)

		if pageToken != "" {
			req = req.PageToken(pageToken)
		}

		resp, err := req.Do()
		if err != nil {
			s.logger.Error("Unable to retrieve contacts: " + err.Error())
		}

		for _, person := range resp.Connections {
			if len(person.EmailAddresses) > 0 {
				if len(person.EmailAddresses) > 0 {
					contact := &domain.Contact{}
					if len(person.Names) > 0 {
						contact.FirstName = &domain.NullableString{String: person.Names[0].GivenName}
						contact.LastName = &domain.NullableString{String: person.Names[0].FamilyName}
					}
					contact.Email = person.EmailAddresses[0].Value
					contacts = append(contacts, contact)
				}

			}
		}

		if resp.NextPageToken == "" {
			break
		}
		pageToken = resp.NextPageToken
	}

	pageToken = ""
	for {
		req := srv.OtherContacts.List().
			ReadMask("names,emailAddresses").
			PageSize(1000)

		if pageToken != "" {
			req = req.PageToken(pageToken)
		}

		resp, err := req.Do()
		if err != nil {
			s.logger.Error("Unable to retrieve contacts: " + err.Error())
		}

		for _, person := range resp.OtherContacts {
			if len(person.EmailAddresses) > 0 {
				if len(person.EmailAddresses) > 0 {
					contact := &domain.Contact{}
					if len(person.Names) > 0 {
						contact.FirstName = &domain.NullableString{String: person.Names[0].GivenName}
						contact.LastName = &domain.NullableString{String: person.Names[0].FamilyName}
					}
					contact.Email = person.EmailAddresses[0].Value
					contacts = append(contacts, contact)
				}

			}
		}

		if resp.NextPageToken == "" {
			break
		}
		pageToken = resp.NextPageToken
	}

	return contacts, nil
}

func (s *GoogleService) PlacesTextSearchAll(query string, lat, lng float64, radius int) ([]Place, error) {
	url := "https://places.googleapis.com/v1/places:searchText"

	var allPlaces []Place
	var nextPageToken string

	for {
		reqBody := PlaceSearchRequest{
			TextQuery: query,
		}
		reqBody.LocationBias.Circle.Center.Latitude = lat
		reqBody.LocationBias.Circle.Center.Longitude = lng
		reqBody.LocationBias.Circle.Radius = radius
		reqBody.PageToken = nextPageToken

		jsonBody, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Goog-Api-Key", s.config.Google.PlaceApiKey)
		req.Header.Set("X-Goog-FieldMask", "*")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)

		var data PlaceSearchResponse
		if err := json.Unmarshal(body, &data); err != nil {
			return nil, err
		}

		allPlaces = append(allPlaces, data.Places...)

		if data.NextPageToken == "" {
			break
		}

		nextPageToken = data.NextPageToken

		time.Sleep(2 * time.Second)
	}

	return allPlaces, nil
}
