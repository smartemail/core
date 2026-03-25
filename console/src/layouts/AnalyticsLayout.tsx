import { Outlet, useParams, useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, Segmented, ConfigProvider } from 'antd'
import type { AnalyticsSearch } from '../router'
import { useIsMobile } from '../hooks/useIsMobile'

type TimePeriod = '7D' | '14D' | '30D' | '90D'

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
    }
  }
}

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

export function AnalyticsLayout() {
  const { workspaceId } = useParams({ strict: false }) as { workspaceId: string }
  const location = useLocation()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as AnalyticsSearch
  const isMobile = useIsMobile()

  const selectedPeriod = search.period || '14D'

  // Determine active tab based on current path
  const getActiveKey = () => {
    if (location.pathname.includes('/broadcasts')) {
      return 'campaigns'
    }
    return 'dashboard'
  }

  const handleTabChange = (key: string) => {
    const path = key === 'campaigns'
      ? `/workspace/${workspaceId}/broadcasts`
      : `/workspace/${workspaceId}/analytics`
    navigate({ to: path, search: { period: selectedPeriod } as AnalyticsSearch })
  }

  const handlePeriodChange = (value: TimePeriod) => {
    navigate({
      to: location.pathname,
      search: { period: value } as AnalyticsSearch
    })
  }

  return (
    <div className="flex flex-col" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
      {/* Header */}
      <div
        className="shrink-0"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 20px',
          height: isMobile ? 50 : 60,
          backgroundColor: '#FAFAFA',
          borderBottom: '1px solid #EAEAEC',
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? 22 : 24,
            fontWeight: 600,
            color: '#1C1D1F',
            marginBottom: 0,
          }}
        >
          Analytics
        </h1>
        <ConfigProvider theme={segmentedTheme}>
          <Segmented
            value={selectedPeriod}
            onChange={(value) => handlePeriodChange(value as TimePeriod)}
            options={[
              { label: '7D', value: '7D' },
              { label: '14D', value: '14D' },
              { label: '30D', value: '30D' },
              { label: '90D', value: '90D' }
            ]}
            size="middle"
          />
        </ConfigProvider>
      </div>
      {/* Tabs */}
      <div className="shrink-0" style={{ padding: isMobile ? '0 16px' : '0 20px', marginBottom: 0, background: '#FAFAFA' }}>
        <ConfigProvider theme={tabsTheme}>
          <Tabs
            activeKey={getActiveKey()}
            items={[
              { key: 'campaigns', label: <span style={{ fontWeight: 700 }}>Campaigns</span> },
              { key: 'dashboard', label: <span style={{ fontWeight: 700 }}>Dashboard</span> }
            ]}
            onChange={handleTabChange}
          />
        </ConfigProvider>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
