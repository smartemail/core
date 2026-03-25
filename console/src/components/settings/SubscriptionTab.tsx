import { useEffect, useState, ReactNode, useMemo } from 'react'
import { Row, Col, Card, Tag, Button, Slider, Spin, Typography } from 'antd'
import { pricingApi, SubscriptionPlanResponse } from '../../services/api/pricing'
import { UserSetting } from '../../services/api/user_setting'
import { User } from '../../services/api/types'
import { DiamondIcon, DollarIcon, PeopleIcon, CalendarIcon } from './SettingsIcons'
import { useIsMobile } from '../../hooks/useIsMobile'

const { Title, Text } = Typography

// Credit tier marks for the slider (non-linear scale)
const CREDIT_TIERS = [
  500, 1_000, 2_000, 5_000, 10_000, 15_000, 20_000,
  30_000, 40_000, 50_000, 75_000, 100_000, 150_000, 200_000, 500_000,
]

// Price for each tier (client-side, will be replaced by API later)
const TIER_PRICES: Record<number, number> = {
  500: 5.00,
  1_000: 8.00,
  2_000: 14.00,
  5_000: 30.00,
  10_000: 50.00,
  15_000: 67.50,
  20_000: 84.00,
  30_000: 112.50,
  40_000: 140.00,
  50_000: 162.50,
  75_000: 210.00,
  100_000: 250.00,
  150_000: 235.00,
  200_000: 290.00,
  500_000: 500.00,
}

// Build slider marks: index → label
const SLIDER_MARKS: Record<number, any> = {}
CREDIT_TIERS.forEach((credits, index) => {
  const label = credits >= 1000 ? `${credits / 1000}K` : String(credits)
  SLIDER_MARKS[index] = {
    style: { transform: 'translateX(-50%)', top: 12 },
    label: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 1, height: 11, background: 'rgba(28, 29, 31, 0.3)', marginBottom: 10 }} />
        <span style={{ fontSize: 13, color: '#878788', fontWeight: 500 }}>{label}</span>
      </div>
    ),
  }
})

const customSliderCss = `
  .custom-credits-slider .ant-slider-rail {
    height: 8px !important;
    border-radius: 4px !important;
    background-color: #D9D9D9 !important;
  }
  .custom-credits-slider .ant-slider-track {
    height: 8px !important;
    border-radius: 4px !important;
    background-color: #2F6DFB !important;
  }
  .custom-credits-slider .ant-slider-handle {
    width: 28px !important;
    height: 28px !important;
    margin-top: -10px !important;
    background: #2F6DFB url("data:image/svg+xml,%3Csvg width='10' height='9' viewBox='0 0 10 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0.5H10M0 4.5H10M0 8.5H10' stroke='white' stroke-opacity='0.3' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat center center !important;
    border: 3px solid #FFFFFF !important;
    border-radius: 50% !important;
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.2) !important;
  }
  .custom-credits-slider .ant-slider-handle::after {
    display: none !important;
  }
  .custom-credits-slider .ant-slider-handle:hover,
  .custom-credits-slider .ant-slider-handle:active,
  .custom-credits-slider .ant-slider-handle:focus {
    box-shadow: 0px 2px 7px rgba(0, 0, 0, 0.2) !important;
    border-color: #FFFFFF !important;
  }
  .custom-credits-slider .ant-slider-dot {
    display: none !important;
  }
`;

interface SubscriptionTabProps {
  workspaceId: string
  settings: UserSetting[]
  onSettingUpdate: () => void
  user: User | null
}

export function SubscriptionTab(props: SubscriptionTabProps) {
  void props
  const [subscription, setSubscription] = useState<SubscriptionPlanResponse | null>(null)
  const [loadingSub, setLoadingSub] = useState(true)
  const [tierIndex, setTierIndex] = useState(12) // default 150K
  const isMobile = useIsMobile()

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await pricingApi.subscription()
        setSubscription(response)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSub(false)
      }
    }
    loadSubscription()
  }, [])

  const selectedCredits = CREDIT_TIERS[tierIndex]

  const price = useMemo(() => {
    return TIER_PRICES[selectedCredits] ?? 0
  }, [selectedCredits])

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const formatPrice = (p: number | undefined) => {
    if (p === undefined || p === null) return '$0'
    return `$${p.toFixed(2)}`
  }

  const statCards: { icon: ReactNode; label: string; value: string }[] = [
    {
      icon: <DiamondIcon />,
      label: 'Credits',
      value: (subscription?.credits ?? 0).toLocaleString(),
    },
    {
      icon: <DollarIcon />,
      label: 'Price',
      value: formatPrice(subscription?.price ?? 0),
    },
    {
      icon: <PeopleIcon />,
      label: 'Credits left',
      value: (subscription?.credits_left ?? 0).toLocaleString(),
    },
    {
      icon: <CalendarIcon />,
      label: 'Active until',
      value: formatDate(subscription?.active_until),
    },
  ]

  const mobileCardStyle: React.CSSProperties = {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    border: '1px solid #E4E4E4',
  }

  const desktopCardStyle: React.CSSProperties = {
    padding: 30,
    marginBottom: 20,
    borderRadius: 20,
  }

  const cardHeaderStyles = {
    header: {
      borderBottom: 'none' as const,
      padding: 0,
      minHeight: 'auto',
      marginBottom: isMobile ? 20 : 30,
    },
    body: { padding: 0 },
  }

  return (
    <div style={{ padding: isMobile ? '16px 0' : '20px 0' }}>
      {/* Current Subscription */}
      <Card
        style={isMobile ? mobileCardStyle : { ...desktopCardStyle, border: '1px dashed #E4E4E4' }}
        styles={cardHeaderStyles}
        title={
          <div className="flex items-center gap-3">
            <Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : undefined }}>Current Subscription</Title>
            {subscription?.billing_cycle && (
              <Tag
                style={{
                  textTransform: 'capitalize',
                  padding: '5px 10px',
                  borderRadius: 10,
                  background: '#CFD8F680',
                  border: 'none',
                  color: '#2F6DFB',
                  fontWeight: 500,
                }}
              >
                {subscription.billing_cycle}
              </Tag>
            )}
          </div>
        }
      >
        {loadingSub ? (
          <div className="flex justify-center py-8"><Spin /></div>
        ) : (
          <Row gutter={[10, 10]}>
            {statCards.map((stat, index) => (
              <Col xs={12} sm={12} lg={6} key={index}>
                <div
                  style={{
                    background: '#1C1D1F08',
                    borderRadius: 10,
                    padding: isMobile ? '14px' : '16px 20px',
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 8 : 12,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ display: 'flex', alignItems: 'center' }}>{stat.icon}</span>
                    <Text style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500, color: '#1C1D1F' }}>{stat.label}</Text>
                  </div>
                  <Text style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, lineHeight: '150%' }}>
                    {stat.value}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Push custom CSS to document head */}
      <style dangerouslySetInnerHTML={{ __html: customSliderCss }} />

      {/* Purchase Additional Credits */}
      <Card
        style={isMobile ? mobileCardStyle : { ...desktopCardStyle, background: '#FAFAFA', border: '1px solid #E4E4E4' }}
        styles={cardHeaderStyles}
        title={
          <div>
            <Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>Purchase additional credits</Title>
            <Text style={{ fontSize: 14, fontWeight: 500, color: 'rgba(28, 29, 31, 0.5)' }}>
              Drag the slider to set the amount of Credits you wish to acquire.
            </Text>
          </div>
        }
      >
        {/* Slider */}
        <div style={{ padding: '0 10px', marginBottom: 80 }}>
          <Slider
            className="custom-credits-slider"
            min={0}
            max={CREDIT_TIERS.length - 1}
            value={tierIndex}
            onChange={(value: number) => setTierIndex(value)}
            marks={SLIDER_MARKS}
            step={null}
            tooltip={{ formatter: (value) => (value !== undefined ? CREDIT_TIERS[value].toLocaleString() : '') }}
          />
          {isMobile && (
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: 600, color: 'rgba(28, 29, 31, 0.5)' }}>
                {selectedCredits.toLocaleString()} credits
              </Text>
            </div>
          )}
        </div>

        {/* Credits = Price display */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end', justifyContent: 'space-between', gap: isMobile ? 12 : 24, padding: '0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 8 : 16 }}>
            <div style={{ width: isMobile ? 'auto' : 180, flex: isMobile ? 1 : undefined }}>
              <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Credits:
              </Text>
              <div
                style={{
                  background: '#F4F4F5',
                  border: '1px solid #E7E7E7',
                  borderRadius: 10,
                  padding: '12px 20px',
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 500, color: '#1C1D1F' }}>
                  {selectedCredits.toLocaleString()}
                </Text>
              </div>
            </div>

            <Text style={{ fontSize: 24, fontWeight: 500, color: '#1C1D1F', height: 50, display: 'flex', alignItems: 'center' }}>=</Text>

            <div style={{ width: isMobile ? 'auto' : 180, flex: isMobile ? 1 : undefined }}>
              <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Price:
              </Text>
              <div
                style={{
                  background: '#F4F4F5',
                  border: '1px solid #E7E7E7',
                  borderRadius: 10,
                  padding: '12px 20px',
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 500, color: '#1C1D1F' }}>
                  {formatPrice(price)}
                </Text>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block={isMobile}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}><path d="M21 14V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V14M21 14H3M21 14V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V14" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            style={{
              height: 50,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 16,
              marginTop: isMobile ? 4 : 0,
              minWidth: isMobile ? undefined : 200,
              paddingInline: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            Purchase
          </Button>
        </div>
      </Card>
    </div>
  )
}
