import { useEffect, useState } from 'react'
import { Row, Col, Card, Input, Button, App } from 'antd'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { workspaceService } from '../../services/api/workspace'
import { InfoSideCard } from './InfoSideCard'
import { BrandColorPicker } from './BrandColorPicker'
import { LogoUpload } from './LogoUpload'
import { DesignDocUpload } from './DesignDocUpload'
import { SparkleIcon, FlipIcon } from './SettingsIcons'
import { useIsMobile } from '../../hooks/useIsMobile'

interface BrandingTabProps {
  workspaceId: string
  settings: UserSetting[]
  onSettingUpdate: () => void
  user: unknown
}

function parseColors(value: string): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // not JSON — try comma-separated format
  }
  // support "brand_colors": "#000000,#FFFFFF,#FF0000"
  const colors = value.split(',').map(s => s.trim()).filter(s => /^#[0-9A-Fa-f]{3,8}$/.test(s))
  return colors
}

const inputStyle = {
  height: 50,
  borderRadius: 10,
  padding: 20,
  background: '#1C1D1F08',
  fontWeight: 500,
  fontSize: 16,
}

const TEXTAREA_MAX_LENGTH = 250

const textareaWrapperStyle: React.CSSProperties = {
  position: 'relative',
  padding: '12px 16px 28px 16px',
  background: '#F4F4F5',
}

const textareaStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: 16,
  resize: 'none',
  color: '#1C1D1F',
  border: 'none',
  outline: 'none',
  boxShadow: 'none',
  padding: 0,
  background: 'transparent',
}

const countStyle = {
  position: 'absolute' as const,
  bottom: 8,
  right: 12,
  fontSize: 12,
  color: 'rgba(28, 29, 31, 0.3)',
}

const labelStyle = { color: '#1C1D1F', fontWeight: 700, fontSize: 16, lineHeight: '150%' }
const subtitleStyle = { color: '#1C1D1F', fontWeight: 500, fontSize: 14, lineHeight: '130%', opacity: 0.3 }

export function BrandingTab({ settings, onSettingUpdate }: BrandingTabProps) {
  const { message } = App.useApp()
  const isMobile = useIsMobile()

  // General info state
  const [businessName, setBusinessName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [extracting, setExtracting] = useState(false)

  // Branding state
  const [designDocUrl, setDesignDocUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [brandColors, setBrandColors] = useState<string[]>([])
  // Additional info state
  const [companyDescription, setCompanyDescription] = useState('')
  const [audienceDescription, setAudienceDescription] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  // Load from settings
  useEffect(() => {
    const load = (code: string) => settings.find(s => s.code === code)?.value || ''

    setBusinessName(load('business_name'))
    setWebsiteUrl(load('website_url'))
    setDesignDocUrl(load('design_doc') || null)
    setLogoUrl(load('logo') || null)
    setBrandColors(parseColors(load('brand_colors')))
    setCompanyDescription(load('services'))
    setAudienceDescription(load('audience'))
    setCompanyAddress(load('company_address'))
  }, [settings])

  // Save helpers
  const saveSettings = async (data: UserSetting[]) => {
    await userSettingService.updateUserSettings(data)
    onSettingUpdate()
  }

  // Auto-save individual general info fields on blur
  const handleSaveField = async (code: string, value: string) => {
    try {
      await saveSettings([{ code, value }])
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  // Extract favicon/branding from website
  const handleExtract = async () => {
    if (!websiteUrl) return
    setExtracting(true)
    try {
      const result = await userSettingService.extractWebsiteInfo(websiteUrl)

      // Update local state immediately for responsiveness
      setBusinessName(result.business_name || '')
      setBrandColors(parseColors(result.brand_colors || ''))
      setCompanyDescription(result.services || '')
      setAudienceDescription(result.audience || '')
      setCompanyAddress(result.company_address || '')

      // Backend already saved everything to DB, refetch to get resolved logo URL etc.
      onSettingUpdate()
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to extract')
    } finally {
      setExtracting(false)
    }
  }

  // Brand colors — auto-save on change
  const handleColorsChange = async (newColors: string[]) => {
    setBrandColors(newColors)
    try {
      await saveSettings([{ code: 'brand_colors', value: JSON.stringify(newColors) }])
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to save colors')
    }
  }

  // Design doc — refetch settings after upload
  const handleDesignDocUploaded = () => {
    onSettingUpdate()
  }

  const handleDesignDocDelete = async () => {
    setDesignDocUrl(null)
    try {
      await saveSettings([{ code: 'design_doc', value: '' }])
      message.success('Design documentation removed')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to remove document')
    }
  }

  // Logo — refetch settings after upload (LogoUpload handles the upload itself)
  const handleLogoUploaded = () => {
    onSettingUpdate()
  }

  const handleLogoDelete = async () => {
    setLogoUrl(null)
    try {
      await saveSettings([{ code: 'logo', value: '' }])
      message.success('Logo removed')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to remove logo')
    }
  }


  const titleStyle = { fontSize: isMobile ? 20 : 24, fontWeight: 700 }

  const cardStyle: React.CSSProperties = {
    padding: isMobile ? 16 : 30,
    marginBottom: isMobile ? 16 : 20,
    borderRadius: isMobile ? 16 : 20,
    border: '1px solid #E4E4E4',
  }

  const cardStyles = {
    header: {
      borderBottom: 'none' as const,
      padding: 0,
      minHeight: 'auto',
      marginBottom: isMobile ? 20 : 30,
    },
    body: { padding: 0 },
  }

  // Row style helper for label+input pairs
  const rowStyle = (mb = true): React.CSSProperties => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    gap: isMobile ? 12 : 30,
    marginBottom: mb ? (isMobile ? 20 : 30) : 0,
  })

  return (
    <div style={{ padding: isMobile ? '16px 0' : '20px 0' }}>
      {/* Info card on top for mobile */}
      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <InfoSideCard
            icon={<SparkleIcon />}
            title="Gathered information will be used for AI-generated content"
            description="The AI uses recent data (2024–2025), but we still recommend reviewing and confirming any information pulled from your website."
          />
        </div>
      )}
      <Row gutter={isMobile ? 0 : 20}>
        {/* Left column */}
        <Col xs={24} lg={15}>
          {/* Card 1 — General info */}
          <Card
            title={<span style={titleStyle}>General info</span>}
            style={cardStyle}
            styles={cardStyles}
          >
            {/* Official Website */}
            <div style={rowStyle()}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>
                  Official Website <span style={{ opacity: 0.3 }}>(optional)</span>
                </div>
                <div style={subtitleStyle}>
                  Will be used to extract information and styling.
                </div>
              </div>
              <div className="flex gap-2" style={{ flex: isMobile ? undefined : 1 }}>
                <Input
                  placeholder="mycompany.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onBlur={() => handleSaveField('website_url', websiteUrl)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <Button
                  type="primary"
                  onClick={handleExtract}
                  loading={extracting}
                  disabled={!websiteUrl}
                  style={{ height: 50, minWidth: 120, borderRadius: 10 }}
                >
                  {!extracting && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><FlipIcon size={24} /> Extract</span>}
                </Button>
              </div>
            </div>

            {/* Business Name */}
            <div style={rowStyle()}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Business Name</div>
                <div style={subtitleStyle}>Will be displayed in the emails.</div>
              </div>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <Input
                  placeholder="MyBusiness"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  onBlur={() => handleSaveField('business_name', businessName)}
                  style={inputStyle}
                />
              </div>
            </div>

          </Card>

          {/* Card 2 — Branding */}
          <Card
            title={<span style={titleStyle}>Branding</span>}
            style={cardStyle}
            styles={cardStyles}
          >
            {/* Design Documentation */}
            <div style={rowStyle()}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Design Documentation</div>
                <div style={subtitleStyle}>Branding guideline, style guide or brand book</div>
              </div>
              <div style={{ flex: isMobile ? undefined : 1, minWidth: 0 }}>
                <DesignDocUpload
                  docUrl={designDocUrl}
                  onUpload={handleDesignDocUploaded}
                  onDelete={handleDesignDocDelete}
                />
              </div>
            </div>

            {/* Brand Logo */}
            <div style={rowStyle()}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Brand Logo</div>
                <div style={subtitleStyle}>Will be displayed in the emails.</div>
              </div>
              <div style={{ flex: isMobile ? undefined : 1, minWidth: 0 }}>
                <LogoUpload
                  logoUrl={logoUrl}
                  onUpload={handleLogoUploaded}
                  onDelete={handleLogoDelete}
                />
              </div>
            </div>

            {/* Brand Colors */}
            <div style={rowStyle(false)}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Brand Colors</div>
                <div style={subtitleStyle}>
                  Will be used to extract information and styling.
                </div>
              </div>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <BrandColorPicker
                  colors={brandColors}
                  onChange={handleColorsChange}
                />
              </div>
            </div>
          </Card>

          {/* Card 3 — Additional Info */}
          <Card
            title={<span style={titleStyle}>Additional Info</span>}
            style={{ ...cardStyle, marginBottom: isMobile ? 16 : 0 }}
            styles={cardStyles}
          >
            {/* Company Description */}
            <div style={{ ...rowStyle(), alignItems: isMobile ? 'stretch' : 'flex-start' }}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Company Description </div>
                <div style={subtitleStyle}>
                  Please provide information about your products, goals, bio, and any additional details you consider valuable.
                </div>
              </div>
              <div className="textarea-wrapper" style={{ flex: isMobile ? undefined : 1, ...textareaWrapperStyle }}>
                <Input.TextArea
                  placeholder="Write something (or leave it be...)"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  onBlur={() => handleSaveField('services', companyDescription)}
                  maxLength={TEXTAREA_MAX_LENGTH}
                  rows={3}
                  style={textareaStyle}
                />
                <span style={countStyle}>
                  {companyDescription.length} / {TEXTAREA_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Audience Description */}
            <div style={{ ...rowStyle(), alignItems: isMobile ? 'stretch' : 'flex-start' }}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Audience Description</div>
                <div style={subtitleStyle}>
                  Who is your desired clientele? What are their age, location, height, and pronouns? Feel free to provide user portraits if you have any.
                </div>
              </div>
              <div className="textarea-wrapper" style={{ flex: isMobile ? undefined : 1, ...textareaWrapperStyle }}>
                <Input.TextArea
                  placeholder="Write something (or leave it be...)"
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  onBlur={() => handleSaveField('audience', audienceDescription)}
                  maxLength={TEXTAREA_MAX_LENGTH}
                  rows={3}
                  style={textareaStyle}
                />
                <span style={countStyle}>
                  {audienceDescription.length} / {TEXTAREA_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Company address */}
            <div style={{ ...rowStyle(), alignItems: isMobile ? 'stretch' : 'flex-start' }}>
              <div style={{ flex: isMobile ? undefined : 1 }}>
                <div style={labelStyle}>Company Address</div>
                <div style={subtitleStyle}>
                  Please provide your company's address, including street, city, state, and postal code.
                </div>
              </div>
              <div className="textarea-wrapper" style={{ flex: isMobile ? undefined : 1, ...textareaWrapperStyle }}>
                <Input.TextArea
                  placeholder="Write something (or leave it be...)"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  onBlur={() => handleSaveField('company_address', companyAddress)}
                  maxLength={TEXTAREA_MAX_LENGTH}
                  rows={3}
                  style={textareaStyle}
                />
                <span style={countStyle}>
                  {companyAddress.length} / {TEXTAREA_MAX_LENGTH}
                </span>
              </div>
            </div>

          </Card>
        </Col>

        {/* Right column — Info card (desktop only) */}
        {!isMobile && (
          <Col lg={9}>
            <InfoSideCard
              icon={<SparkleIcon />}
              title="Gathered information will be used for AI-generated content"
              description="The AI uses recent data (2024–2025), but we still recommend reviewing and confirming any information pulled from your website."
            />
          </Col>
        )}
      </Row>
    </div>
  )
}
