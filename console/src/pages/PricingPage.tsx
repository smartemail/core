import { useState, useEffect } from 'react'
import { Row, Col, Card, Input, Button, Tag, Segmented, Spin, Typography, ConfigProvider } from 'antd'
import { InfoSideCard } from '../components/settings/InfoSideCard'
import { DiamondIcon, CheckCircleIcon, CreditCardCheckIcon } from '../components/settings/SettingsIcons'
import { pricingApi, Product } from '../services/api/pricing'
import { useIsMobile } from '../hooks/useIsMobile'

const { Title, Text } = Typography

const YEARLY_DISCOUNT = 0.20

const segmentedTheme = {
  components: {
    Segmented: {
      itemColor: 'rgba(28, 29, 31, 0.5)',
      itemHoverColor: 'rgba(28, 29, 31, 0.7)',
      itemSelectedBg: '#2F6DFB',
      itemSelectedColor: '#F8F8F8',
      trackBg: '#F4F4F5',
      borderRadius: 10,
      controlHeight: 40,
      trackPadding: 5,
    },
  },
}

const cardStyle: React.CSSProperties = {
  padding: 30,
  marginBottom: 20,
  borderRadius: 20,
  border: '1px solid #E4E4E4',
}

const cardStyles = {
  header: {
    borderBottom: 'none' as const,
    padding: 0,
    minHeight: 'auto',
    marginBottom: 30,
  },
  body: { padding: 0 },
}

// Pricing table data
interface PricingItem {
  name: string
  cost: string
  suffix?: string
  isFree?: boolean
}

const PRICING_TABLE: PricingItem[] = [
  { name: 'Generate Email', cost: '15 credits' },
  { name: 'Send Email', cost: '1 credits', suffix: 'per contact' },
  { name: 'Test send / preview', cost: 'FREE', isFree: true },
]

export function PricingPage({ isPublic = false }: { isPublic?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const hasAuth = !!localStorage.getItem('auth_token')
        const response = hasAuth
          ? await pricingApi.get(appliedCoupon)
          : await pricingApi.publicGet(appliedCoupon)
        setProducts((response.products || []).filter(p => p.credits > 0))
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [appliedCoupon])

  const formatPrice = (price: number) => {
    const final = billingCycle === 'Yearly' ? price * (1 - YEARLY_DISCOUNT) : price
    return `$${final.toFixed(2)}`
  }

  const mobileCardStyle: React.CSSProperties = {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    border: '1px solid #E4E4E4',
  }

  return (
    <div>
      {/* Page Header */}
      {!isMobile && !isPublic && (
        <div
          className="flex justify-between items-center px-5 shrink-0"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: '60px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #EAEAEC',
          }}
        >
          <h1 className="text-2xl font-semibold" style={{ color: '#1C1D1F', marginBottom: 0 }}>
            Pricing
          </h1>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: isPublic ? 0 : isMobile ? 16 : 20 }}>
        {/* Info card on top for mobile */}
        {isMobile && (
          <div style={{ marginBottom: 16 }}>
            <InfoSideCard
              icon={<CreditCardCheckIcon size={32} />}
              title="How Credits Work"
              description="Credits are used for everything inside Smart Mail AI — generating content, building emails, and sending campaigns. You'll always see the estimated credit cost before sending."
              showPolicyLinks={false}
            />
          </div>
        )}
        <Row gutter={isMobile ? 0 : 20}>
          {/* Left column: all three sections stacked */}
          <Col xs={24} lg={15}>
            {/* Section 1: Flexible subscription plans */}
            <Card
              style={isMobile ? mobileCardStyle : cardStyle}
              styles={cardStyles}
              title={
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: isMobile ? 16 : 0 }}>
                  <Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>
                    Flexible subscription plans for every need
                  </Title>
                  <ConfigProvider theme={segmentedTheme}>
                    <Segmented
                      value={billingCycle}
                      onChange={(value) => setBillingCycle(value as 'Monthly' | 'Yearly')}
                      options={['Monthly', 'Yearly']}
                    />
                  </ConfigProvider>
                </div>
              }
            >
              {loadingProducts ? (
                <div className="flex justify-center py-8"><Spin /></div>
              ) : (
                <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]}>
                  {products.slice(0, 3).map((product, index) => (
                    <Col xs={24} sm={8} key={product.id || index}>
                      <div
                        style={{
                          textAlign: 'center',
                          borderRadius: 20,
                          padding: isMobile ? 24 : '30px 20px',
                          background: '#F4F4F5',
                        }}
                      >
                        <div style={{ marginBottom: 10 }}>
                          <Text style={{ fontSize: isMobile ? 20 : 24, fontWeight: 500, lineHeight: 1 }}>
                            {product.name}
                          </Text>
                        </div>
                        <Tag
                          style={{
                            marginBottom: 10,
                            marginRight: 0,
                            padding: '8px 14px',
                            borderRadius: 10,
                            background: '#1C1D1F0D',
                            border: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <DiamondIcon size={16} />
                          <Text style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', marginLeft: 5 }}>
                            {(product.credits ?? 0).toLocaleString()} credits
                          </Text>
                        </Tag>
                        <div style={{ marginBottom: isMobile ? 20 : 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                          <Text style={{ fontSize: isMobile ? 28 : 32, fontWeight: 500, lineHeight: 1, color: '#1C1D1F' }}>
                            {formatPrice(product.price)}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: 500, color: 'rgba(28, 29, 31, 0.5)', paddingBottom: 2 }}>
                            /month
                          </Text>
                        </div>
                        <Button
                          type="primary"
                          block
                          onClick={() => window.open(product.checkout_url, '_blank')}
                          style={{ borderRadius: 8, height: 40, fontWeight: 600 }}
                        >
                          Select Plan
                        </Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>

            {/* Section 2: Got a discount? */}
            <Card
              style={isMobile ? mobileCardStyle : cardStyle}
              styles={cardStyles}
              title={
                <Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>
                  Got a discount?
                </Title>
              }
            >
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 12 : 16 }}>
                <div style={{ flex: isMobile ? undefined : 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 600 }}>
                    Enter the code in the box
                  </Text>
                  <br />
                  <Text style={{ fontSize: 14, fontWeight: 500, color: 'rgba(28, 29, 31, 0.4)' }}>
                    before starting subscription to receive discounted price
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="XX-XX-XX-XX"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      width: isMobile ? undefined : 240,
                      flex: isMobile ? 1 : undefined,
                      height: 50,
                      borderRadius: 10,
                      textAlign: 'center',
                      fontSize: 14,
                    }}
                  />
                  <Button
                    type="primary"
                    disabled={!couponCode}
                    onClick={() => setAppliedCoupon(couponCode)}
                    style={{
                      height: 50,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      paddingInline: 24,
                      gap: 8,
                      ...(!couponCode ? { backgroundColor: '#2F6DFB33', border: 'none', color: '#FAFAFA' } : {}),
                    }}
                  >
                    <CheckCircleIcon size={18} />
                    Apply
                  </Button>
                </div>
              </div>
            </Card>

            {/* Section 3: Pricing Table */}
            <Card
              style={{ ...(isMobile ? mobileCardStyle : cardStyle), marginBottom: isMobile ? 16 : 0 }}
              styles={cardStyles}
              title={
                <Title level={3} style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>
                  Pricing Table
                </Title>
              }
            >
              {PRICING_TABLE.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 4 : 0,
                    padding: isMobile ? '10px 8px' : '10px',
                    borderRadius: 10,
                    background: idx % 2 === 0 ? '#1C1D1F08' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500 }}>{item.name}</Text>
                  <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                    {!item.isFree && <DiamondIcon size={14} />}
                    <Text
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        ...(item.isFree ? { color: '#1C1D1F' } : {}),
                      }}
                    >
                      {item.cost}
                    </Text>
                    {item.suffix && (
                      <Text style={{ fontSize: isMobile ? 13 : 14, fontWeight: 500, color: 'rgba(28, 29, 31, 0.4)' }}>
                        {item.suffix}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </Col>

          {/* Right column: Info card (desktop only, shown on top for mobile) */}
          {!isMobile && <Col lg={9}>
            <InfoSideCard
              icon={<CreditCardCheckIcon size={32} />}
              title="How Credits Work"
              description="Credits are used for everything inside Smart Mail AI — generating content, building emails, and sending campaigns. You'll always see the estimated credit cost before sending."
              showPolicyLinks={false}
            />
          </Col>}
        </Row>
      </div>
    </div>
  )
}
