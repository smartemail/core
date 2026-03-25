import { useState } from 'react'
import { Input, Switch, Tooltip, Typography, Spin, DatePicker } from 'antd'
import dayjs from '../../../lib/dayjs'
import { InfoCircleOutlined } from '@ant-design/icons'
import { PromptIcon } from '../CampaignIcons'
import { useIsMobile } from '../../../hooks/useIsMobile'
import type { EmailBuilderTrendsResponse } from '../../../services/api/email_builder'

const { Text } = Typography

interface PromptSectionProps {
  prompt: string
  onPromptChange: (v: string) => void
  isEventInvitation: boolean
  onEventInvitationChange: (v: boolean) => void
  eventDateTime: string
  onEventDateTimeChange: (v: string) => void
  eventLocation: string
  onEventLocationChange: (v: string) => void
  addButton: boolean
  onAddButtonChange: (v: boolean) => void
  buttonName: string
  onButtonNameChange: (v: string) => void
  buttonLink: string
  onButtonLinkChange: (v: string) => void
  trendingEnabled: boolean
  onTrendingEnabledChange: (v: boolean) => void
  trends: EmailBuilderTrendsResponse[]
  trendsLoading: boolean
  selectedTrend: EmailBuilderTrendsResponse | null
  onSelectedTrendChange: (v: EmailBuilderTrendsResponse | null) => void
  isGuestMode?: boolean,
  searchTrends?: (v: string) => void
}

function Divider() {
  return <div style={{ height: 1, background: '#F0F0F0', margin: '0 10px' }} />
}

export function PromptSection({
  prompt,
  onPromptChange,
  isEventInvitation,
  onEventInvitationChange,
  eventDateTime,
  onEventDateTimeChange,
  eventLocation,
  onEventLocationChange,
  addButton,
  onAddButtonChange,
  buttonName,
  onButtonNameChange,
  buttonLink,
  onButtonLinkChange,
  trendingEnabled,
  onTrendingEnabledChange,
  trends,
  trendsLoading,
  selectedTrend,
  onSelectedTrendChange,
  isGuestMode = false,
  searchTrends,
}: PromptSectionProps) {
  const isMobile = useIsMobile()
  const inputFontSize = isMobile ? 16 : 14
  const [expanded, setExpanded] = useState(true)
  const [includeTime, setIncludeTime] = useState(
    // Auto-detect if existing value has time
    eventDateTime ? eventDateTime.includes(' at ') : false
  )

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
          <PromptIcon />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1C1D1F' }}>Prompt</span>
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
            {/* Email content label + info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                Email content (message)<span style={{ color: '#FB2F4A' }}>*</span>
              </Text>
              <Tooltip title="Describe the main message of your email. The AI will generate the full structure, tone, and layout.">
                <InfoCircleOutlined style={{ color: '#A0A0A0', fontSize: 14 }} />
              </Tooltip>
            </div>

            {/* Description */}
            <div style={{ padding: '0 10px' }}>
              <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F', opacity: 0.3, lineHeight: 1.3 }}>
                Describe what this email is about.{'\n'}We'll handle structure, tone, and layout.
              </Text>
            </div>

            {/* TextArea */}
            <div style={{ position: 'relative' }}>
              <Input.TextArea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="Enter your prompt"
                maxLength={1000}
                autoSize={{ minRows: 5 }}
                style={{
                  borderRadius: 10,
                  resize: 'none',
                  background: '#F4F4F5',
                  border: '1px solid #E7E7E7',
                  padding: 20,
                  fontSize: inputFontSize,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 13,
                  right: 12,
                  fontSize: 12,
                  color: '#1C1D1F',
                  opacity: 0.3,
                }}
              >
                {prompt.length}/1000
              </span>
            </div>

            {/* Trending hooks toggle row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>Trending hooks</Text>
                <Tooltip title="Use current topics or local trends to make your message more relevant.">
                  <InfoCircleOutlined style={{ color: '#A0A0A0', fontSize: 14 }} />
                </Tooltip>
              </div>
              {isGuestMode ? (
                <Tooltip title="Sign up to access trending hooks">
                  <Switch checked={false} disabled />
                </Tooltip>
              ) : (
                <Switch
                  checked={trendingEnabled}
                  onChange={onTrendingEnabledChange}
                />
              )}
            </div>

            {/* Trending pills */}
            {trendingEnabled && (
              <div>
                <div style={{ display: 'flex', gap: 8, padding: '0px' }}>
                  <Input
                    placeholder="Search trends..."
                    onPressEnter={(e) => {
                      const value = (e.target as HTMLInputElement).value
                      if (searchTrends) {
                        searchTrends(value)
                      }
                    }}
                    style={{
                      borderRadius: 10,
                      background: '#F4F4F5',
                      border: '1px solid #E7E7E7',
                      fontSize: inputFontSize,
                      height: 40,
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)
                      if (input) {
                        const value = input.value
                        if (searchTrends) {
                          searchTrends(value)
                        }
                      }
                    }}
                    style={{
                      borderRadius: 10,
                      background: '#2F6DFB',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0 20px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    Search
                  </button>
                </div>
                <div style={{ padding: '0 10px' }}>
                  {trendsLoading ? (
                    <div style={{ textAlign: 'center', padding: 12 }}>
                      <Spin size="small" />
                    </div>
                  ) : trends.length > 0 ? (
                    <div>
                      <div style={{ marginTop: 10 }}></div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 2px' }}>
                        {trends.map((trend) => {
                          const isSelected = selectedTrend?.trend === trend.trend
                          return (
                            <div
                              key={trend.trend}
                              onClick={() => onSelectedTrendChange(isSelected ? null : trend)}
                              style={{
                                border: isSelected ? '1px solid #2F6DFB' : '1px solid rgba(28,29,31,0.3)',
                                borderRadius: 99,
                                padding: 8,
                                cursor: 'pointer',
                                background: isSelected ? '#2F6DFB' : 'transparent',
                                color: isSelected ? '#FFFFFF' : '#1C1D1F',
                                fontSize: 12,
                                fontWeight: 500,
                                lineHeight: '0.6',
                                transition: 'all 0.15s',
                              }}
                            >
                              {trend.trend}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/*   
                    <Text style={{ fontSize: 13, color: '#A0A0A0' }}>
                      No trending hooks available
                    </Text>
                    */}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trending description */}
            {trendingEnabled && trends.length > 0 && (
              <div style={{ padding: '0 10px' }}>
                <Text style={{ fontSize: 14, color: '#1C1D1F', opacity: selectedTrend ? 0.6 : 0.3, lineHeight: 1.3 }}>
                  {selectedTrend ? selectedTrend.description : "Select a hook to read more about its origin."}
                </Text>
              </div>
            )}

            <Divider />

            {/* Event invitation toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>It's an event invitation</Text>
                <Tooltip title="Enable this if the email is for an event or meetup.">
                  <InfoCircleOutlined style={{ color: '#A0A0A0', fontSize: 14 }} />
                </Tooltip>
              </div>
              <Switch
                checked={isEventInvitation}
                onChange={onEventInvitationChange}
              />
            </div>

            {/* Event details (shown when event invitation is enabled) */}
            {isEventInvitation && (
              <div style={{
                margin: '0 10px',
                background: '#FAFAFA',
                borderRadius: 20,
                padding: 10,
                border: '1px solid #E4E4E4',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div>
                  <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                    Date and time<span style={{ color: '#FB2F4A' }}>*</span>
                  </Text>
                  <DatePicker
                    showTime={includeTime ? { use12Hours: true, format: 'hh:mm A' } : false}
                    format={includeTime ? 'MM/DD/YYYY, hh:mm A' : 'MM/DD/YYYY'}
                    value={eventDateTime ? dayjs(eventDateTime, includeTime ? 'MMMM D, YYYY [at] hh:mm A' : 'MMMM D, YYYY') : null}
                    onChange={(date) => {
                      if (!date) {
                        onEventDateTimeChange('')
                        return
                      }
                      onEventDateTimeChange(
                        includeTime
                          ? date.format('MMMM D, YYYY [at] hh:mm A')
                          : date.format('MMMM D, YYYY')
                      )
                    }}
                    placeholder={includeTime ? 'MM/DD/YYYY, --:-- AM' : 'MM/DD/YYYY'}
                    style={{
                      marginTop: 6,
                      borderRadius: 10,
                      background: '#F4F4F5',
                      border: '1px solid #E7E7E7',
                      fontSize: inputFontSize,
                      height: 50,
                      width: '100%',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Switch
                      size="small"
                      checked={includeTime}
                      onChange={(checked) => {
                        setIncludeTime(checked)
                        // Re-format existing value when toggling
                        if (eventDateTime) {
                          const parsed = dayjs(eventDateTime, checked ? 'MMMM D, YYYY' : 'MMMM D, YYYY [at] hh:mm A')
                          if (parsed.isValid()) {
                            onEventDateTimeChange(
                              checked
                                ? parsed.format('MMMM D, YYYY [at] hh:mm A')
                                : parsed.format('MMMM D, YYYY')
                            )
                          }
                        }
                      }}
                    />
                    <Text style={{ fontSize: 13, color: '#1C1D1F', opacity: 0.5 }}>Include time</Text>
                  </div>
                </div>
                <div>
                  <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                    Location
                  </Text>
                  <Input
                    value={eventLocation}
                    onChange={(e) => onEventLocationChange(e.target.value)}
                    placeholder="Your event's address"
                    style={{
                      marginTop: 6,
                      borderRadius: 10,
                      background: '#F4F4F5',
                      border: '1px solid #E7E7E7',
                      fontSize: inputFontSize,
                      height: 50,
                    }}
                  />
                </div>
              </div>
            )}

            <Divider />

            {/* Add button toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>Add button</Text>
                <Tooltip title="Include a call-to-action button in the email.">
                  <InfoCircleOutlined style={{ color: '#A0A0A0', fontSize: 14 }} />
                </Tooltip>
              </div>
              <Switch
                checked={addButton}
                onChange={onAddButtonChange}
              />
            </div>

            {/* Button details (shown when add button is enabled) */}
            {addButton && (
              <div style={{
                margin: '0 10px',
                background: '#FAFAFA',
                borderRadius: 20,
                padding: 10,
                border: '1px solid #E4E4E4',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div>
                  <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                    Button name<span style={{ color: '#FB2F4A' }}>*</span>
                  </Text>
                  <Input
                    value={buttonName}
                    onChange={(e) => onButtonNameChange(e.target.value)}
                    placeholder="Click me!"
                    style={{
                      marginTop: 6,
                      borderRadius: 10,
                      background: '#F4F4F5',
                      border: '1px solid #E7E7E7',
                      fontSize: inputFontSize,
                      height: 50,
                    }}
                  />
                </div>
                <div>
                  <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                    Button link<span style={{ color: '#FB2F4A' }}>*</span>
                  </Text>
                  <Input
                    value={buttonLink}
                    onChange={(e) => onButtonLinkChange(e.target.value)}
                    placeholder="https://www..."
                    style={{
                      marginTop: 6,
                      borderRadius: 10,
                      background: '#F4F4F5',
                      border: '1px solid #E7E7E7',
                      fontSize: inputFontSize,
                      height: 50,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
