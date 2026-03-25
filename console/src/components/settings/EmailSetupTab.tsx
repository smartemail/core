import { useEffect, useState } from 'react'
import { Row, Col, Card, Input, Button, App } from 'antd'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { User } from '../../services/api/types'
import { InfoSideCard } from './InfoSideCard'
import { CheckCircleIcon, EmailShieldIcon } from './SettingsIcons'
import { useIsMobile } from '../../hooks/useIsMobile'

interface EmailSetupTabProps {
  workspaceId: string
  settings: UserSetting[]
  onSettingUpdate: () => void
  user: User | null
}

export function EmailSetupTab({ settings, onSettingUpdate, user }: EmailSetupTabProps) {
  const [replyToEmail, setReplyToEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const isMobile = useIsMobile()

  useEffect(() => {
    const setting = settings.find(s => s.code === 'send_from_email')
    if (setting) {
      setReplyToEmail(setting.value)
    }
  }, [settings])

  const handleSave = async () => {
    setLoading(true)
    try {
      await userSettingService.updateUserSettings([
        { code: 'send_from_email', value: replyToEmail }
      ])
      onSettingUpdate()
      message.success('Saved successfully')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: isMobile ? '16px 0' : '20px 0' }}>
      {/* Info card on top for mobile */}
      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <InfoSideCard
            icon={<EmailShieldIcon />}
            title="Reliable by Default"
            description="We use SendGrid to handle delivery and tracking, so you don't need to worry about the technical details here."
          />
        </div>
      )}
      <Row gutter={isMobile ? 0 : 20}>
        {/* Left column — Email Setup */}
        <Col xs={24} lg={15}>
          <Card
            title={<span style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, padding: 0 }}>Email Setup</span>}
            styles={{
              header: {
                borderBottom: 'none',
                padding: 0,
                minHeight: 'auto',
                marginBottom: isMobile ? 20 : 30,
              },
              body: { padding: 0 }
            }}
            style={{
              border: '1px solid #E4E4E4',
              padding: isMobile ? 16 : 30,
              marginBottom: isMobile ? 16 : 20,
              borderRadius: isMobile ? 16 : 20,
            }}
          >
            {/* Registered Email */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 30, marginBottom: isMobile ? 20 : 30 }}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={{ color: '#1C1D1F', fontWeight: 700, fontSize: 16, lineHeight: '150%', marginBottom: 5 }}>Registered Email</div>
                <div style={{ color: '#1C1D1F', fontWeight: 500, fontSize: 14, lineHeight: '130%', opacity: 0.3 }}>
                  Used as the default sender address for all outgoing emails.
                </div>
              </div>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <Input
                  value={user?.email || ''}
                  disabled
                  style={{
                    height: 50,
                    borderRadius: 10,
                    padding: 20,
                    background: '#1C1D1F08',
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                />
              </div>
            </div>

            {/* Reply-to Email */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 30 }}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={{ color: '#1C1D1F', fontWeight: 700, fontSize: 16, lineHeight: 1.5, marginBottom: 5 }}>
                  Reply-to Email <span style={{ opacity: 0.3 }}>(optional)</span>
                </div>
                <div style={{ color: '#1C1D1F', fontWeight: 500, fontSize: 14, lineHeight: 1.3, opacity: 0.3 }}>
                  If left empty, replies go to the registered email.
                </div>
              </div>
              <div className="flex gap-2" style={{ flex: isMobile ? undefined : 1 }}>
                <Input
                  placeholder="hello@mycompany.com"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 10,
                    padding: 20,
                    background: '#1C1D1F08',
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                />
                <Button
                  disabled={!replyToEmail}
                  type="primary"
                  onClick={handleSave}
                  loading={loading}
                  style={{ height: 50, borderRadius: 10 }}
                >
                  <CheckCircleIcon size={20} />
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right column — Info card (desktop only) */}
        {!isMobile && (
          <Col lg={9}>
            <InfoSideCard
              icon={<EmailShieldIcon />}
              title="Reliable by Default"
              description="We use SendGrid to handle delivery and tracking, so you don't need to worry about the technical details here."
            />
          </Col>
        )}
      </Row>
    </div>
  )
}
