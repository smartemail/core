import React, { useState, useEffect } from 'react'
import { Alert, Spin, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPaperPlane,
  faCircleCheck,
  faEye,
  faCircleXmark,
  faFaceFrown
} from '@fortawesome/free-regular-svg-icons'
import { faArrowPointer, faTriangleExclamation, faBan } from '@fortawesome/free-solid-svg-icons'
import { ChartVisualization } from './ChartVisualization'
import { analyticsService, AnalyticsQuery, AnalyticsResponse } from '../../services/api/analytics'
import { Workspace } from '../../services/api/types'

const { Text } = Typography

interface EmailMetricsChartProps {
  workspace: Workspace
  timeRange?: [string, string]
  timezone?: string
  isMobile?: boolean
}

type MessageTypeFilter = 'all' | 'broadcasts' | 'transactional'

export const EmailMetricsChart: React.FC<EmailMetricsChartProps> = ({
  workspace,
  timeRange = ['2024-01-01', '2024-12-31'],
  timezone,
  isMobile = false
}) => {
  const [messageTypeFilter, setMessageTypeFilter] = useState<MessageTypeFilter>('broadcasts')
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [statsData, setStatsData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State to track which chart lines are visible
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    count_sent: true,
    count_delivered: true,
    count_opened: true,
    count_clicked: true,
    count_bounced: true,
    count_complained: true,
    count_unsubscribed: true,
    count_failed: true
  })

  // Function to toggle line visibility
  const toggleLineVisibility = (measure: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [measure]: !prev[measure]
    }))
  }

  const buildQuery = (filter: MessageTypeFilter): AnalyticsQuery => {
    // Only include measures that are visible
    const visibleMeasures = [
      'count_sent',
      'count_delivered',
      'count_bounced',
      'count_complained',
      'count_opened',
      'count_clicked',
      'count_unsubscribed',
      'count_failed'
    ].filter((measure) => visibleLines[measure])

    const baseQuery: AnalyticsQuery = {
      schema: 'message_history',
      measures: visibleMeasures,
      dimensions: [],
      timezone: timezone || workspace.settings.timezone || 'UTC',
      timeDimensions: [
        {
          dimension: 'created_at',
          granularity: 'day',
          dateRange: timeRange
        }
      ],
      filters: []
    }

    // Add broadcast_id filter if not 'all'
    if (filter === 'broadcasts') {
      baseQuery.filters?.push({
        member: 'broadcast_id',
        operator: 'set',
        values: []
      })
    } else if (filter === 'transactional') {
      baseQuery.filters?.push({
        member: 'broadcast_id',
        operator: 'notSet',
        values: []
      })
    }

    return baseQuery
  }

  const buildStatsQuery = (filter: MessageTypeFilter): AnalyticsQuery => {
    // Stats query should always include all measures regardless of visibility
    const baseQuery: AnalyticsQuery = {
      schema: 'message_history',
      measures: [
        'count_sent',
        'count_delivered',
        'count_bounced',
        'count_complained',
        'count_opened',
        'count_clicked',
        'count_unsubscribed',
        'count_failed'
      ],
      dimensions: [],
      timezone: timezone || workspace.settings.timezone || 'UTC',
      timeDimensions: [
        {
          dimension: 'created_at',
          granularity: 'day',
          dateRange: timeRange
        }
      ],
      filters: []
    }

    // Add broadcast_id filter if not 'all'
    if (filter === 'broadcasts') {
      baseQuery.filters?.push({
        member: 'broadcast_id',
        operator: 'set',
        values: []
      })
    } else if (filter === 'transactional') {
      baseQuery.filters?.push({
        member: 'broadcast_id',
        operator: 'notSet',
        values: []
      })
    }

    return baseQuery
  }

  const fetchData = async (filter: MessageTypeFilter) => {
    try {
      setLoading(true)
      setStatsLoading(true)
      setError(null)

      // Fetch both chart data and stats data in parallel
      const [chartResponse, statsResponse] = await Promise.all([
        analyticsService.query(buildQuery(filter), workspace.id),
        analyticsService.query(buildStatsQuery(filter), workspace.id)
      ])

      setData(chartResponse)
      setStatsData(statsResponse)
    } catch (err) {
      console.error('Failed to fetch email metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch email metrics')
    } finally {
      setLoading(false)
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(messageTypeFilter)
  }, [workspace.id, messageTypeFilter, timeRange, visibleLines])

  // Extract and aggregate stats from the stats response (sum up all daily values)
  const stats = statsData?.data?.reduce(
    (acc, row) => ({
      count_sent: acc.count_sent + (row.count_sent || 0),
      count_delivered: acc.count_delivered + (row.count_delivered || 0),
      count_opened: acc.count_opened + (row.count_opened || 0),
      count_clicked: acc.count_clicked + (row.count_clicked || 0),
      count_bounced: acc.count_bounced + (row.count_bounced || 0),
      count_complained: acc.count_complained + (row.count_complained || 0),
      count_unsubscribed: acc.count_unsubscribed + (row.count_unsubscribed || 0),
      count_failed: acc.count_failed + (row.count_failed || 0)
    }),
    {
      count_sent: 0,
      count_delivered: 0,
      count_opened: 0,
      count_clicked: 0,
      count_bounced: 0,
      count_complained: 0,
      count_unsubscribed: 0,
      count_failed: 0
    }
  ) || {
    count_sent: 0,
    count_delivered: 0,
    count_opened: 0,
    count_clicked: 0,
    count_bounced: 0,
    count_complained: 0,
    count_unsubscribed: 0,
    count_failed: 0
  }

  const getRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '-'
    const percentage = (numerator / denominator) * 100
    if (percentage === 0 || percentage >= 10) {
      return `${Math.round(percentage)}%`
    }
    return `${percentage.toFixed(1)}%`
  }

  // Define colors that match the icon colors in the statistics cards
  const chartColors = {
    count_sent: '#3b82f6', // blue-500
    count_delivered: '#10b981', // green-500
    count_opened: '#8b5cf6', // purple-500
    count_clicked: '#06b6d4', // cyan-500
    count_bounced: '#f97316', // orange-500
    count_complained: '#f97316', // orange-500
    count_unsubscribed: '#f97316', // orange-500
    count_failed: '#ef4444' // red-500
  }

  // Define measure titles for tooltip display
  const measureTitles = {
    count_sent: 'Sent',
    count_delivered: 'Delivered',
    count_opened: 'Opens',
    count_clicked: 'Clicks',
    count_bounced: 'Bounced',
    count_complained: 'Complaints',
    count_unsubscribed: 'Unsubscribes',
    count_failed: 'Failed'
  }

  const statItems = [
    {
      key: 'count_sent',
      icon: faPaperPlane,
      iconColor: 'text-blue-500',
      label: 'Sent',
      value: statsLoading ? null : String(stats.count_sent),
      tooltip: `${stats.count_sent} total emails sent`
    },
    {
      key: 'count_delivered',
      icon: faCircleCheck,
      iconColor: 'text-green-500',
      label: 'Delivered',
      value: statsLoading ? null : getRate(stats.count_delivered, stats.count_sent),
      tooltip: `${stats.count_delivered} emails delivered`
    },
    {
      key: 'count_opened',
      icon: faEye,
      iconColor: 'text-pink-500',
      label: 'Opens',
      value: statsLoading ? null : getRate(stats.count_opened, stats.count_sent),
      tooltip: `${stats.count_opened} total opens`
    },
    {
      key: 'count_clicked',
      icon: faArrowPointer,
      iconColor: 'text-violet-500',
      label: 'Clicks',
      value: statsLoading ? null : getRate(stats.count_clicked, stats.count_sent),
      tooltip: `${stats.count_clicked} total clicks`
    },
    {
      key: 'count_failed',
      icon: faCircleXmark,
      iconColor: 'text-red-500',
      label: 'Failed',
      value: statsLoading ? null : getRate(stats.count_failed, stats.count_sent),
      tooltip: `${stats.count_failed} emails failed`
    },
    {
      key: 'count_bounced',
      icon: faTriangleExclamation,
      iconColor: 'text-amber-500',
      label: 'Bounced',
      value: statsLoading ? null : getRate(stats.count_bounced, stats.count_sent),
      tooltip: `${stats.count_bounced} emails bounced`
    },
    {
      key: 'count_complained',
      icon: faFaceFrown,
      iconColor: 'text-pink-500',
      label: 'Complaints',
      value: statsLoading ? null : getRate(stats.count_complained, stats.count_sent),
      tooltip: `${stats.count_complained} total complaints`
    },
    {
      key: 'count_unsubscribed',
      icon: faBan,
      iconColor: 'text-green-600',
      label: 'Unsub.',
      value: statsLoading ? null : getRate(stats.count_unsubscribed, stats.count_sent),
      tooltip: `${stats.count_unsubscribed} total unsubscribes`
    }
  ]

  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid #EAEAEC',
        background: '#FAFAFA',
        padding: isMobile ? 14 : 20,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1D1F', marginBottom: isMobile ? 12 : 16 }}>
        Email Metrics
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(8, 1fr)',
          gap: isMobile ? 6 : 8,
        }}
      >
        {statItems.map((item) => (
          <div
            key={item.key}
            title={`${item.tooltip}${!visibleLines[item.key] ? ' (hidden from chart)' : ''}`}
            className={`bg-[#1C1D1F08] cursor-pointer hover:bg-gray-100 transition-colors ${
              !visibleLines[item.key] ? 'opacity-50' : ''
            }`}
            style={{ borderRadius: 8, padding: '12px' }}
            onClick={() => toggleLineVisibility(item.key)}
          >
            <div className="flex items-center gap-1.5" style={{ marginBottom: 6 }}>
              <FontAwesomeIcon
                icon={item.icon}
                className={item.iconColor}
                style={{ fontSize: 15 }}
              />
              <Text style={{ fontSize: 16, fontWeight: 500 }}>{item.label}</Text>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
              {item.value === null ? <Spin size="small" /> : item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ChartVisualization
        data={data}
        chartType="line"
        query={buildQuery(messageTypeFilter)}
        loading={loading}
        error={error}
        height={isMobile ? 180 : 220}
        showLegend={false}
        colors={chartColors}
        measureTitles={measureTitles}
      />
    </div>
  )
}
