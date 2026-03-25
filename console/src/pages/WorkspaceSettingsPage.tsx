import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Tabs, ConfigProvider } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { userSettingService, UserSetting } from '../services/api/user_setting'
import { SubscriptionTab } from '../components/settings/SubscriptionTab'
import { EmailSetupTab } from '../components/settings/EmailSetupTab'
import { BrandingTab } from '../components/settings/BrandingTab'
import { useIsMobile } from '../hooks/useIsMobile'

type SettingsSection = 'subscription' | 'email-setup' | 'branding'

const validSections: SettingsSection[] = ['subscription', 'email-setup', 'branding']

const tabsTheme = {
  components: {
    Tabs: {
      itemColor: 'rgba(28, 29, 31, 0.5)',
      itemHoverColor: 'rgba(28, 29, 31, 0.7)',
      itemSelectedColor: '#1C1D1F',
      inkBarColor: '#2F6DFB',
      titleFontSize: 16,
      titleFontSizeLG: 16,
      colorBgContainer: '#FAFAFA',
      controlHeight: 60,
      cardHeight: 60,
      horizontalMargin: '0 0 0 0',
    }
  }
}

export function WorkspaceSettingsPage() {
  const [userSetting, setUserSetting] = useState<UserSetting[]>([])
  const { workspaceId, section } = useParams({
    from: '/workspace/$workspaceId/settings/$section'
  })
  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const fetchSettings = useCallback(async () => {
    const settings = await userSettingService.getUserSettings()
    setUserSetting(settings)
  }, [])

  useEffect(() => {
    let cancelled = false
    userSettingService.getUserSettings().then((settings) => {
      if (!cancelled) setUserSetting(settings)
    })
    return () => { cancelled = true }
  }, [])

  const activeSection: SettingsSection = validSections.includes(section as SettingsSection)
    ? (section as SettingsSection)
    : 'subscription'

  useEffect(() => {
    if (!validSections.includes(section as SettingsSection)) {
      navigate({
        to: '/workspace/$workspaceId/settings/$section',
        params: { workspaceId, section: 'subscription' },
        replace: true
      })
    }
  }, [section, workspaceId, navigate])

  const handleTabChange = (key: string) => {
    navigate({
      to: '/workspace/$workspaceId/settings/$section',
      params: { workspaceId, section: key }
    })
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'subscription':
        return (
          <SubscriptionTab
            workspaceId={workspaceId}
            settings={userSetting}
            onSettingUpdate={fetchSettings}
            user={user}
          />
        )
      case 'email-setup':
        return (
          <EmailSetupTab
            workspaceId={workspaceId}
            settings={userSetting}
            onSettingUpdate={fetchSettings}
            user={user}
          />
        )
      case 'branding':
        return (
          <BrandingTab
            workspaceId={workspaceId}
            settings={userSetting}
            onSettingUpdate={fetchSettings}
            user={user}
          />
        )
    }
  }

  return (
    <div>
      {/* Sticky header + tabs */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        {!isMobile && (
          <div
            className="flex justify-between items-center px-5"
            style={{
              height: '60px',
              backgroundColor: '#FAFAFA',
              borderBottom: '1px solid #EAEAEC'
            }}
          >
            <h1
              className="text-2xl font-semibold"
              style={{ color: '#1C1D1F', marginBottom: 0 }}
            >
              Settings
            </h1>
          </div>
        )}
        <div style={{ padding: isMobile ? '0 16px' : '0 20px', backgroundColor: '#FAFAFA' }}>
          <ConfigProvider theme={tabsTheme}>
            <Tabs
              activeKey={activeSection}
              onChange={handleTabChange}
              items={[
                { key: 'subscription', label: <span style={{ fontWeight: 700 }}>Subscription</span> },
                { key: 'email-setup', label: <span style={{ fontWeight: 700 }}>Email Setup</span> },
                { key: 'branding', label: <span style={{ fontWeight: 700 }}>Branding</span> },
              ]}
            />
          </ConfigProvider>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: isMobile ? '0 16px' : '0 20px' }}>
        {renderContent()}
      </div>
    </div>
  )
}
