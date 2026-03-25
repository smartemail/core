import React from 'react'
import { Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import numbro from 'numbro'
import { EmailMetricsChart } from './EmailMetricsChart'
import { Workspace } from '../../services/api/types'
import { FailedMessagesTable } from './FailedMessagesTable'
import { NewContactsTable } from './NewContactsTable'
import { analyticsService } from '../../services/api/analytics'
import { useIsMobile } from '../../hooks/useIsMobile'

interface AnalyticsDashboardProps {
  workspace: Workspace
  timeRange: [string, string]
  timezone?: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  workspace,
  timeRange,
  timezone
}) => {
  const isMobile = useIsMobile()
  // Use timeRange and timezone as refresh key to update components when they change
  const refreshKey = `${timeRange[0]}-${timeRange[1]}-${timezone || ''}`

  // Query for total contacts count
  const { data: totalContactsData, isLoading: totalContactsLoading } = useQuery({
    queryKey: ['analytics', 'total-contacts', workspace.id],
    queryFn: async () => {
      return analyticsService.query(
        {
          schema: 'contacts',
          measures: ['count'],
          dimensions: [],
          filters: []
        },
        workspace.id
      )
    },
    refetchInterval: 60000
  })

  // Query for new contacts in the given date range
  const { data: newContactsData, isLoading: newContactsLoading } = useQuery({
    queryKey: ['analytics', 'new-contacts', workspace.id, timeRange[0], timeRange[1]],
    queryFn: async () => {
      return analyticsService.query(
        {
          schema: 'contacts',
          measures: ['count'],
          dimensions: [],
          filters: [
            {
              member: 'created_at',
              operator: 'inDateRange',
              values: timeRange
            }
          ]
        },
        workspace.id
      )
    },
    refetchInterval: 60000
  })

  // Calculate totals
  const totalContacts = totalContactsData?.data?.[0]?.['count'] || 0
  const newContactsCount = newContactsData?.data?.[0]?.['count'] || 0

  const formatValue = (value: number, isLoading: boolean) => {
    if (isLoading) {
      return <Spin size="small" />
    }
    return numbro(value).format({ thousandSeparated: true })
  }

  return (
    <div>
      {/* Overview Section */}
      <div
        style={{
          borderRadius: 10,
          border: '1px solid #EAEAEC',
          background: '#FAFAFA',
          padding: isMobile ? 14 : 20,
          marginBottom: isMobile ? 12 : 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1D1F', marginBottom: isMobile ? 12 : 16 }}>
          Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: isMobile ? 10 : 16 }}>
          {/* Total Contacts */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 10,
              background: '#1C1D1F08',
              padding: isMobile ? '14px' : '20px',
              height: isMobile ? 80 : 100,
            }}
          >
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500, lineHeight: 1.5, color: '#1C1D1F' }}>Total Contacts</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, lineHeight: 1.5, color: '#1C1D1F', marginTop: 10 }}>
              {formatValue(totalContacts, totalContactsLoading)}
            </div>
            <svg
              width={isMobile ? 84 : 135}
              height={isMobile ? 65 : 104}
              viewBox="0 0 135 104"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', right: 0, bottom: 0 }}
            >
              <g opacity="0.2">
                <path
                  d="M117.196 100.37L125.883 99.6104C132.301 99.0488 137.424 93.1899 134.852 87.282C130.933 78.2786 122.797 73.3383 109.187 72.5712M89.7859 55.13C91.5235 55.5166 93.4825 55.6001 95.6653 55.4092C105.35 54.5618 109.757 49.1572 108.668 36.7047C107.578 24.2523 102.3 19.695 92.6148 20.5424C90.432 20.7333 88.5173 21.1558 86.8733 21.8382M62.3236 75.893C84.2504 73.9747 96.045 79.3886 100.604 91.8814C102.497 97.0696 98.178 102.034 92.6761 102.516L37.0553 107.382C31.5534 107.863 26.438 103.724 27.4015 98.2858C29.7216 85.1912 40.3969 77.8114 62.3236 75.893ZM60.7984 58.4596C70.4836 57.6123 74.8905 52.2076 73.801 39.7552C72.7116 27.3028 67.4332 22.7455 57.748 23.5928C48.0627 24.4402 43.6559 29.8448 44.7454 42.2972C45.8348 54.7497 51.1132 59.307 60.7984 58.4596Z"
                  stroke="#2F6DFB"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>

          {/* New Contacts */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 10,
              background: '#1C1D1F08',
              padding: isMobile ? '14px' : '20px',
              height: isMobile ? 80 : 100,
            }}
          >
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500, lineHeight: 1.5, color: '#1C1D1F' }}>New Contacts</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, lineHeight: 1.5, color: '#1C1D1F', marginTop: 10 }}>
              {formatValue(newContactsCount, newContactsLoading)}
            </div>
            <svg
              width={isMobile ? 76 : 122}
              height={isMobile ? 65 : 104}
              viewBox="0 0 122 104"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', right: 0, bottom: 0 }}
            >
              <g opacity="0.2">
                <path
                  d="M73.8013 42.7554L77.8685 89.2445M99.0794 63.9663L52.5903 68.0336M80.4106 118.3C109.295 115.773 130.662 90.3089 128.135 61.4243C125.608 32.5396 100.144 11.1726 71.2592 13.6997C42.3746 16.2268 21.0076 41.691 23.5347 70.5756C26.0617 99.4602 51.5259 120.827 80.4106 118.3Z"
                  stroke="#2F6DFB"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Email Metrics Chart - Full Width */}
      <EmailMetricsChart
        key={`email-metrics-${refreshKey}`}
        workspace={workspace}
        timeRange={timeRange}
        timezone={timezone}
        isMobile={isMobile}
      />

      <div style={{ marginTop: isMobile ? 12 : 16 }}>
        <NewContactsTable key={`new-contacts-${refreshKey}`} workspace={workspace} isMobile={isMobile} />
      </div>

      <div style={{ marginTop: isMobile ? 12 : 16 }}>
        <FailedMessagesTable key={`failed-messages-${refreshKey}`} workspace={workspace} isMobile={isMobile} />
      </div>
    </div>
  )
}
