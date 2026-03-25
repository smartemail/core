import React, { useState, useEffect } from 'react'
import { Segmented, Input, Typography, ConfigProvider, Spin, Tooltip } from 'antd'
import { StylingSourceIcon } from '../CampaignIcons'
import { FlipIcon } from '../../settings/SettingsIcons'
import { useNavigate } from '@tanstack/react-router'
import { LAYOUT_PRESETS } from '../constants'
import { useIsMobile } from '../../../hooks/useIsMobile'
import type { BrandingData } from '../hooks/useCampaignWizard'

import cleanMinimalImg from '../../../assets/clean_minimal.png'
import warmLocalImg from '../../../assets/warm_local.png'
import luxuryPremiumImg from '../../../assets/luxury_premium.png'
import boldVibrantImg from '../../../assets/bold_vibrant.png'
import ecoGreenImg from '../../../assets/eco_green.png'
import industrialTechnicalImg from '../../../assets/industrial_technical.png'

const { Text } = Typography

interface StylingSourceSectionProps {
  workspaceId: string
  stylingSource: 'branding' | 'preset'
  onStylingSourceChange: (v: 'branding' | 'preset') => void
  websiteUrl: string
  onWebsiteUrlChange: (v: string) => void
  onRefreshUrl?: () => void
  selectedPreset: string | null
  onSelectedPresetChange: (v: string | null) => void
  selectedPalette: string | null
  onSelectedPaletteChange: (v: string | null) => void
  brandingData: BrandingData | null
  extracting?: boolean
  isGuestMode?: boolean
}

// --- Checklist icons ---

function ColorsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 11.6679 3.06 13.2048 4 14.4295C4.37124 14.9143 5 15 5.5769 15C6.69231 15 7.5 14.0385 8.75 14.0385C9.61538 14.0385 10.25 14.6635 10.25 15.5288C10.25 16.1859 10.0641 16.8109 10.0641 17.5C10.0641 17.5 17.5 16.6667 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5Z" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.83" cy="11.67" r="1" stroke="#71717A" strokeWidth="1.2" />
      <circle cx="8.75" cy="6.67" r="1" stroke="#71717A" strokeWidth="1.2" />
      <circle cx="14.17" cy="8.33" r="1" stroke="#71717A" strokeWidth="1.2" />
    </svg>
  )
}

function TypographyTIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.16667 5.83333V4.16667H15.8333V5.83333M7.5 15.8333H12.5M10 4.16667V15.8333" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.33333 5H16.6667M3.33333 8.33333H13.3333M3.33333 11.6667H16.6667M3.33333 15H10" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PeopleSmallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 17.5V16.1667C13.3333 14.3257 11.8409 12.8333 10 12.8333H5.83333C3.99238 12.8333 2.5 14.3257 2.5 16.1667V17.5M17.5 17.5V16.1667C17.5 14.6057 16.4055 13.2916 14.9167 12.9167M12.0833 2.61667C13.5759 2.98891 14.6733 4.30512 14.6733 5.87C14.6733 7.43488 13.5759 8.75109 12.0833 9.12333M10.4167 5.83333C10.4167 7.67428 8.92428 9.16667 7.08333 9.16667C5.24238 9.16667 3.75 7.67428 3.75 5.83333C3.75 3.99238 5.24238 2.5 7.08333 2.5C8.92428 2.5 10.4167 3.99238 10.4167 5.83333Z" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10.8333C11.3807 10.8333 12.5 9.71404 12.5 8.33333C12.5 6.95262 11.3807 5.83333 10 5.83333C8.61929 5.83333 7.5 6.95262 7.5 8.33333C7.5 9.71404 8.61929 10.8333 10 10.8333Z" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 17.5C10 17.5 16.6667 13.3333 16.6667 8.33333C16.6667 4.65143 13.6819 1.66667 10 1.66667C6.31811 1.66667 3.33334 4.65143 3.33334 8.33333C3.33334 13.3333 10 17.5 10 17.5Z" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircleBlue() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#2F6DFB" fillOpacity="0.05" />
      <path d="M21.2498 10.8335L12.4998 19.5835L9.1665 16.2502" stroke="#2F6DFB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XCircleRed() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 15C0 6.71573 6.71573 0 15 0C23.2843 0 30 6.71573 30 15C30 23.2843 23.2843 30 15 30C6.71573 30 0 23.2843 0 15Z" fill="#FB2F4A" fillOpacity="0.05" />
      <path d="M10 10L20 20M20 10L10 20" stroke="#FB2F4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// --- Branding checklist ---

const CHECKLIST_ITEMS = [
  { label: 'Colors', icon: <ColorsIcon />, field: 'brandColors' as const },
  { label: 'Company Name', icon: <TypographyTIcon />, field: 'businessName' as const },
  { label: 'Company Description', icon: <LinesIcon />, field: 'companyDescription' as const },
  { label: 'Audience Description', icon: <PeopleSmallIcon />, field: 'audienceDescription' as const },
  { label: 'Company Address', icon: <PinIcon />, field: 'companyAddress' as const },
]

function hasFieldData(brandingData: BrandingData, field: string): boolean {
  if (field === 'brandColors') return Array.isArray(brandingData.brandColors) && brandingData.brandColors.length > 0
  return !!(brandingData as Record<string, unknown>)[field]
}

function hasAnyBrandingData(data: BrandingData | null): boolean {
  if (!data) return false
  return !!(
    (Array.isArray(data.brandColors) && data.brandColors.length > 0) ||
    data.businessName ||
    data.companyDescription ||
    data.audienceDescription ||
    data.companyAddress
  )
}

function hasCorebranding(data: BrandingData | null): boolean {
  if (!data) return false
  return !!((Array.isArray(data.brandColors) && data.brandColors.length > 0) || data.businessName)
}

function BrandingChecklist({
  brandingData,
  extracting,
}: {
  brandingData: BrandingData | null
  extracting?: boolean
}) {
  const [animationStep, setAnimationStep] = useState(extracting ? 0 : -1)

  useEffect(() => {
    if (!extracting) {
      return
    }

    let step = 0
    const timer = setInterval(() => {
      step += 1
      if (step > 4) {
        clearInterval(timer)
        return
      }
      setAnimationStep(step)
    }, 2000)

    return () => clearInterval(timer)
  }, [extracting])

  // Derive the effective step: -1 when not extracting
  const effectiveStep = extracting ? animationStep : -1

  return (
    <div
      style={{
        background: '#FAFAFA',
        border: '1px solid #E7E7E7',
        borderRadius: 10,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {CHECKLIST_ITEMS.map((item, index) => {
        let indicator: React.ReactNode
        if (effectiveStep >= 0) {
          if (index === effectiveStep) {
            indicator = <Spin size="small" />
          } else if (index < effectiveStep) {
            indicator = <CheckCircleBlue />
          } else {
            indicator = <XCircleRed />
          }
        } else if (brandingData) {
          indicator = hasFieldData(brandingData, item.field) ? <CheckCircleBlue /> : <XCircleRed />
        } else {
          indicator = <XCircleRed />
        }

        return (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1C1D1F' }}>
              {item.label}
            </span>
            <span style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {indicator}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const PRESET_IMAGES: Record<string, string> = {
  'clean-minimal': cleanMinimalImg,
  'warm-local': warmLocalImg,
  'luxury-premium': luxuryPremiumImg,
  'bold-vibrant': boldVibrantImg,
  'eco-green': ecoGreenImg,
  'industrial-technical': industrialTechnicalImg,
}

// --- Main component ---

export function StylingSourceSection({
  workspaceId,
  stylingSource,
  onStylingSourceChange,
  websiteUrl,
  onWebsiteUrlChange,
  onRefreshUrl,
  selectedPreset,
  onSelectedPresetChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedPalette,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectedPaletteChange,
  brandingData,
  extracting,
  isGuestMode = false,
}: StylingSourceSectionProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const inputFontSize = isMobile ? 16 : 14
  const [expanded, setExpanded] = useState(false)
  // Hidden for now
  // const [paletteExpanded, setPaletteExpanded] = useState(false)
  // const currentPalette = COLOR_PALETTES.find((p) => p.id === selectedPalette) || COLOR_PALETTES[0]

  const canExtract = !!websiteUrl.trim() && !extracting
  const showCompactBranding = !extracting && hasCorebranding(brandingData)

  return (
    <div style={{ borderBottom: expanded ? '1px solid #E4E4E4' : 'none' }}>
      {/* Section header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #E4E4E4',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StylingSourceIcon />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1C1D1F' }}>Styling Source</span>
        </div>
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          style={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M3.33332 6.66675L9.99999 13.3334L16.6667 6.66675" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Section content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
          {/* Segmented control */}
          <ConfigProvider
            theme={{
              components: {
                Segmented: {
                  itemSelectedBg: '#2F6DFB',
                  itemSelectedColor: '#FFFFFF',
                  trackBg: '#F4F4F5',
                  itemColor: '#1C1D1F',
                  borderRadius: 10,
                  borderRadiusSM: 5,
                  controlHeight: 40,
                },
              },
            }}
          >
            <Segmented
              value={stylingSource}
              onChange={(v) => onStylingSourceChange(v as 'branding' | 'preset')}
              options={[
                { label: 'Branding', value: 'branding' },
                { label: 'Preset', value: 'preset' },
              ]}
              block
              style={{ border: '1px solid #E4E4E4', borderRadius: 10 }}
            />
          </ConfigProvider>

          {/* Branding tab */}
          {stylingSource === 'branding' && isGuestMode && (
            <Tooltip title="Sign up to use your brand identity">
              <div style={{ opacity: 0.5, padding: '20px 10px', textAlign: 'center', cursor: 'not-allowed' }}>
                <Text style={{ fontSize: 14, color: '#1C1D1F' }}>
                  Enter your website URL to sync company data
                </Text>
              </div>
            </Tooltip>
          )}
          {stylingSource === 'branding' && !isGuestMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {showCompactBranding ? (
                <>
                  {/* Compact brand card */}
                  <div
                    style={{
                      background: '#F4F4F5',
                      border: '1px solid #E4E4E4',
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    <div
                      style={{
                        background: '#FAFAFA',
                        border: '1px solid #E4E4E4',
                        borderRadius: 20,
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {brandingData!.logoUrl && (
                        <img
                          src={brandingData!.logoUrl}
                          alt="Logo"
                          style={{ height: 40, objectFit: 'contain' }}
                        />
                      )}
                      <Text style={{ fontWeight: 700, flex: 1, minWidth: 0, fontSize: 16 }} ellipsis>
                        {brandingData!.businessName || 'Your Brand'}
                      </Text>
                      {Array.isArray(brandingData!.brandColors) && brandingData!.brandColors.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {brandingData!.brandColors.slice(0, 3).map((color, i) => (
                            <div
                              key={i}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                background: color,
                                border: '2px solid #E4E4E4',
                                marginLeft: i === 0 ? 0 : -20,
                                zIndex: 3 - i,
                              }}
                            />
                          ))}
                          {brandingData!.brandColors.length > 3 && (
                            <Text style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', marginLeft: 4 }}>
                              {brandingData!.brandColors.length - 3}+
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* URL input view */}
                  <div style={{ padding: '0 10px' }}>
                    <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                      Enter your website URL to sync company data
                      <span style={{ color: '#EF4444' }}>*</span>
                    </Text>
                  </div>

                  {/* URL input + refresh button */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => onWebsiteUrlChange(e.target.value)}
                      placeholder="mycompany.com"
                      disabled={extracting}
                      style={{
                        flex: 1,
                        height: 50,
                        borderRadius: 10,
                        background: '#F4F4F5',
                        border: '1px solid #E7E7E7',
                        padding: '0 20px',
                        fontSize: inputFontSize,
                      }}
                    />
                    <div
                      onClick={canExtract ? onRefreshUrl : undefined}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        background: canExtract ? '#2F6DFB' : '#E4E4E4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: canExtract ? 'pointer' : 'not-allowed',
                        flexShrink: 0,
                      }}
                    >
                      {extracting ? (
                        <Spin size="small" />
                      ) : (
                        <span style={{ color: canExtract ? '#FFFFFF' : '#A0A0A0', display: 'flex' }}>
                          <FlipIcon size={24} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Branding checklist — shown during extraction or when partial data exists */}
                  {(extracting || hasAnyBrandingData(brandingData)) && (
                    <BrandingChecklist brandingData={brandingData} extracting={extracting} />
                  )}
                </>
              )}

              {/* Edit Branding button — shown only when data exists or extracting */}
              {(extracting || hasAnyBrandingData(brandingData) || showCompactBranding) && (
                <div
                  onClick={() =>
                    navigate({
                      to: '/workspace/$workspaceId/settings/$section',
                      params: { workspaceId, section: 'branding' },
                    })
                  }
                  style={{
                    height: 40,
                    borderRadius: 10,
                    border: '1px solid #2F6DFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#2F6DFB' }}>Edit Branding</span>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.66899 1H2.66899C1.56442 1 0.668991 1.89543 0.668991 3V15C0.668991 16.1046 1.56442 17 2.66899 17H14.669C15.7736 17 16.669 16.1046 16.669 15V9M5.66899 12V9.5L14.419 0.75C15.1094 0.0596441 16.2286 0.0596441 16.919 0.75C17.6094 1.44036 17.6094 2.55964 16.919 3.25L12.169 8L8.16899 12H5.66899Z" stroke="#2F6DFB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Preset tab */}
          {stylingSource === 'preset' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {LAYOUT_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id
                return (
                  <div
                    key={preset.id}
                    onClick={() => onSelectedPresetChange(isSelected ? null : preset.id)}
                    style={{
                      border: isSelected ? '1px solid #2F6DFB' : '1px solid #E4E4E4',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: '#FFFFFF',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={PRESET_IMAGES[preset.id]}
                      alt={preset.name}
                      style={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: isSelected ? '5px solid #2F6DFB' : '2px solid #D4D4D8',
                          flexShrink: 0,
                          boxSizing: 'border-box',
                        }}
                      />
                      <Text style={{ fontWeight: 500, fontSize: 14 }}>{preset.name}</Text>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
