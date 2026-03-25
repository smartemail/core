import { useQuery } from '@tanstack/react-query'
import { Spin, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPaperPlane,
  faCircleCheck,
  faEye,
  faCircleXmark,
  faFaceFrown
} from '@fortawesome/free-regular-svg-icons'
import { faArrowPointer, faTriangleExclamation, faBan } from '@fortawesome/free-solid-svg-icons'
import { getBroadcastStats } from '../../services/api/messages_history'
import { useNavigate } from '@tanstack/react-router'
import type { Workspace } from '../../services/api/types'

const { Text } = Typography

interface BroadcastStatsProps {
  workspaceId: string
  broadcastId: string
  workspace?: Workspace
  isMobile?: boolean
}

export function BroadcastStats({ workspaceId, broadcastId, workspace, isMobile = false }: BroadcastStatsProps) {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['broadcast-stats', workspaceId, broadcastId],
    queryFn: async () => {
      return getBroadcastStats(workspaceId, broadcastId)
    },
    refetchInterval: 60000
  })

  const stats = data?.stats || {
    total_sent: 0,
    total_delivered: 0,
    total_opened: 0,
    total_clicked: 0,
    total_failed: 0,
    total_bounced: 0,
    total_complained: 0,
    total_unsubscribed: 0
  }

  const isSmtpProvider = (() => {
    if (!workspace?.settings?.marketing_email_provider_id) return false
    const marketingProviderId = workspace.settings.marketing_email_provider_id
    const integration = workspace.integrations?.find((i) => i.id === marketingProviderId)
    return integration?.email_provider?.kind === 'smtp'
  })()

  const getRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '-'
    const percentage = (numerator / denominator) * 100
    if (percentage === 0 || percentage >= 10) {
      return `${Math.round(percentage)}%`
    }
    return `${percentage.toFixed(1)}%`
  }

  const navigateToLogs = (filterType: string) => {
    const searchParams = new URLSearchParams()
    searchParams.set('broadcast_id', broadcastId)

    if (filterType !== 'sent') {
      searchParams.set(filterType, 'true')
    }

    const url = `/workspace/${workspaceId}/logs?${searchParams.toString()}`
    navigate({ to: url as any })
  }

  const statItems = [
    {
      key: 'sent',
      icon: faPaperPlane,
      iconColor: 'text-blue-500',
      label: 'Sent',
      value: isLoading ? null : String(stats.total_sent),
      tooltip: `${stats.total_sent} total emails sent`,
      onClick: () => navigateToLogs('sent'),
      disabled: false
    },
    {
      key: 'delivered',
      icon: faCircleCheck,
      iconColor: 'text-green-500',
      label: 'Delivered',
      value: isLoading ? null : isSmtpProvider ? '-' : getRate(stats.total_delivered, stats.total_sent),
      tooltip: isSmtpProvider
        ? "SMTP provider doesn't support delivery webhooks"
        : `${stats.total_delivered} emails delivered`,
      onClick: () => navigateToLogs('is_delivered'),
      disabled: isSmtpProvider
    },
    {
      key: 'opens',
      icon: faEye,
      iconColor: 'text-pink-500',
      label: 'Opens',
      value: isLoading ? null : getRate(stats.total_opened, stats.total_sent),
      tooltip: `${stats.total_opened} total opens`,
      onClick: () => navigateToLogs('is_opened'),
      disabled: false
    },
    {
      key: 'clicks',
      icon: faArrowPointer,
      iconColor: 'text-violet-500',
      label: 'Clicks',
      value: isLoading ? null : getRate(stats.total_clicked, stats.total_sent),
      tooltip: `${stats.total_clicked} total clicks`,
      onClick: () => navigateToLogs('is_clicked'),
      disabled: false
    },
    {
      key: 'failed',
      icon: faCircleXmark,
      iconColor: 'text-red-500',
      label: 'Failed',
      value: isLoading ? null : getRate(stats.total_failed, stats.total_sent),
      tooltip: `${stats.total_failed} emails failed`,
      onClick: () => navigateToLogs('is_failed'),
      disabled: false
    },
    {
      key: 'bounced',
      icon: faTriangleExclamation,
      iconColor: 'text-amber-500',
      label: 'Bounced',
      value: isLoading ? null : isSmtpProvider ? '-' : getRate(stats.total_bounced, stats.total_sent),
      tooltip: isSmtpProvider
        ? "SMTP provider doesn't support bounce webhooks"
        : `${stats.total_bounced} emails bounced`,
      onClick: () => navigateToLogs('is_bounced'),
      disabled: isSmtpProvider
    },
    {
      key: 'complaints',
      icon: faFaceFrown,
      iconColor: 'text-pink-500',
      label: 'Complaints',
      value: isLoading ? null : isSmtpProvider ? '-' : getRate(stats.total_complained, stats.total_sent),
      tooltip: isSmtpProvider
        ? "SMTP provider doesn't support complaint webhooks"
        : `${stats.total_complained} total complaints`,
      onClick: () => navigateToLogs('is_complained'),
      disabled: isSmtpProvider
    },
    {
      key: 'unsub',
      icon: faBan,
      iconColor: 'text-green-600',
      label: 'Unsub.',
      value: isLoading ? null : getRate(stats.total_unsubscribed, stats.total_sent),
      tooltip: `${stats.total_unsubscribed} total unsubscribes`,
      onClick: () => navigateToLogs('is_unsubscribed'),
      disabled: false
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(8, 1fr)',
      gap: isMobile ? 6 : 8,
    }}>
      {statItems.map((item) => (
        <div
          key={item.key}
          title={item.tooltip}
          className={`bg-[#1C1D1F08] transition-colors ${
            item.disabled
              ? 'cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-gray-50'
          }`}
          style={{
            borderRadius: 8,
            padding: '12px',
          }}
          onClick={item.disabled ? undefined : item.onClick}
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
  )
}
