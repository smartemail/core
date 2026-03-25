import { ConfigProvider, App as AntApp, ThemeConfig } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { initializeAnalytics } from './utils/analytics-config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

const theme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: '#2F6DFB',
    colorLink: '#2F6DFB',
    colorLinkHover: '#2559D4',

    // Typography
    fontFamily: "'Satoshi', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,

    // Border radius
    borderRadius: 10,
    borderRadiusSM: 5,
    borderRadiusLG: 20,

    // Colors
    colorText: '#1C1D1F',
    colorTextSecondary: 'rgba(28, 29, 31, 0.5)',
    colorTextTertiary: 'rgba(28, 29, 31, 0.3)',
    colorBorder: '#E4E4E4',
    colorBorderSecondary: '#EFEFEF',
    colorBgContainer: '#FAFAFA',
    colorBgLayout: '#F2F2F2',

    // Semantic colors
    colorSuccess: '#65C70F',
    colorInfo: '#3B82F6',
    colorWarning: '#F59E0B',
    colorError: '#EF4444'
  },
  components: {
    Layout: {
      bodyBg: '#F2F2F2',
      lightSiderBg: '#FAFAFA',
      siderBg: '#FAFAFA'
    },
    Button: {
      primaryColor: '#FAFAFA',
      fontWeight: 700,
      paddingInline: 20,
      controlHeight: 40
    },
    Card: {
      headerFontSize: 16,
      borderRadius: 10,
      borderRadiusLG: 10,
      colorBgContainer: '#FAFAFA',
      colorBorderSecondary: '#E4E4E4'
    },
    Table: {
      headerBg: 'transparent',
      fontSize: 12,
      colorTextHeading: 'rgba(28, 29, 31, 0.5)',
      colorBgContainer: 'transparent',
      rowHoverBg: 'transparent',
      headerColor: 'rgba(28, 29, 31, 0.5)'
    },
    Drawer: {
      colorBgElevated: '#FAFAFA'
    },
    Modal: {
      colorBgElevated: '#FAFAFA',
      borderRadiusLG: 20
    },
    Timeline: {
      dotBg: '#FAFAFA'
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40
    },
    Tabs: {
      itemColor: 'rgba(28, 29, 31, 0.5)',
      itemSelectedColor: '#2F6DFB',
      inkBarColor: '#2F6DFB'
    },
    Switch: {
      colorPrimary: '#2F6DFB',
      colorPrimaryHover: '#2559D4',
      trackHeight: 24,
      trackMinWidth: 40,
      handleSize: 16,
      innerMinMargin: 4,
      innerMaxMargin: 24
    }
  }
}

// Initialize analytics service
initializeAnalytics()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider theme={theme}>
          <AntApp>
            <RouterProvider router={router} />
          </AntApp>
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
