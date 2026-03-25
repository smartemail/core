package domain

import (
	"context"
	"time"
)

type UserSetting struct {
	ID        string    `json:"-" db:"id"`
	UserID    string    `json:"-" db:"user_id"`
	Code      string    `json:"code" db:"code"`
	Value     string    `json:"value" db:"value"`
	CreatedAt time.Time `json:"-" db:"created_at"`
	UpdatedAt time.Time `json:"-" db:"updated_at"`
}

const (
	UserSettingCodeSubscriptionPlan       = "subscription_plan"
	UserSettingCodeRegisteredEmail        = "registered_email"
	UserSettingCodeEmailProvider          = "email_provider"
	UserSettingCodeSendFromEmail          = "send_from_email"
	UserSettingCodeWebsiteURL             = "website_url"
	UserSettingCodeFonts                  = "fonts"
	UserSettingCodeBusinessName           = "business_name"
	UserSettingCodeCompanyName            = "company_name"
	UserSettingCodeAudience               = "audience"
	UserSettingCodeServices               = "services"
	UserSettingCodeBrandColors            = "brand_colors"
	UserSettingCodeBrandColorsDescription = "brand_colors_description"
	UserSettingCodeLogo                   = "logo"
	UserSettingCodeCompanyAddress         = "company_address"
)

type UserSettingRepository interface {
	UpdateUserSetting(ctx context.Context, userSetting *UserSetting) error
	GetUserSetting(ctx context.Context, userId string) ([]*UserSetting, error)
}

type UserSettingService interface {
	UpdateUserSetting(ctx context.Context, userSetting *UserSetting) error
	GetUserSetting(ctx context.Context) ([]*UserSetting, error)
	ExtractUserSettingFromWebsite(ctx context.Context, website string) (map[string]string, error)
	ExtractColorsFromBranding(ctx context.Context, branding []byte, filename string) (map[string]string, error)
}

func GetAllUserSettingsKey() []string {
	return []string{
		UserSettingCodeSubscriptionPlan,
		UserSettingCodeRegisteredEmail,
		UserSettingCodeEmailProvider,
		UserSettingCodeSendFromEmail,
		UserSettingCodeWebsiteURL,
		UserSettingCodeFonts,
		UserSettingCodeBusinessName,
		UserSettingCodeAudience,
		UserSettingCodeServices,
		UserSettingCodeBrandColors,
		UserSettingCodeCompanyName,
		UserSettingCodeLogo,
		UserSettingCodeCompanyAddress,
	}
}
