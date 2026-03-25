import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Space,
  Tooltip,
  Button,
  Modal,
  Input,
  App,
  Badge,
  Progress,
  Popover,
  Alert,
  Popconfirm,
  Tag
} from 'antd'
import { useParams, Link } from '@tanstack/react-router'
import { broadcastApi, Broadcast } from '../services/api/broadcast'
import { listsApi } from '../services/api/list'
import { taskApi } from '../services/api/task'
import { listSegments } from '../services/api/segment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCirclePause,
  faPenToSquare,
  faTrashCan,
  faCirclePlay,
  faCopy,
  faCircleQuestion
} from '@fortawesome/free-regular-svg-icons'
import {
  faBan,
  faSpinner,
  faRefresh
} from '@fortawesome/free-solid-svg-icons'
import React, { useState } from 'react'
import dayjs from '../lib/dayjs'
import { UpsertBroadcastDrawer } from '../components/broadcasts/UpsertBroadcastDrawer'
import { EmptyState, EnvelopeIcon } from '../components/common'
import { PlusOutlined } from '@ant-design/icons'
import { SendOrScheduleModal } from '../components/broadcasts/SendOrScheduleModal'
import { useAuth, useWorkspacePermissions } from '../contexts/AuthContext'
import { BroadcastStats } from '../components/broadcasts/BroadcastStats'
import { List } from '../services/api/types'
import { useIsMobile } from '../hooks/useIsMobile'
import { PaginationFooter } from '../components/common'

const { Text } = Typography

// Helper function to calculate remaining test time
const getRemainingTestTime = (broadcast: Broadcast, testResults?: any) => {
  if (
    broadcast.status !== 'testing' ||
    !broadcast.test_settings.enabled ||
    !broadcast.test_settings.test_duration_hours
  ) {
    return null
  }

  const testStartTime = testResults?.test_started_at || broadcast.test_sent_at
  if (!testStartTime) {
    return null
  }

  const startTime = dayjs(testStartTime)
  const endTime = startTime.add(broadcast.test_settings.test_duration_hours, 'hours')
  const now = dayjs()

  if (now.isAfter(endTime)) {
    return null
  }

  return now.to(endTime, true) + ' remaining'
}

// Status tag component matching the mockup design
const StatusTag: React.FC<{ broadcast: Broadcast; remainingTime?: string | null }> = ({
  broadcast,
  remainingTime
}) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'text-gray-500 bg-gray-100' },
    scheduled: { label: 'Scheduled', className: 'text-blue-600 bg-blue-50' },
    sending: { label: 'In Progress', className: 'text-green-600 bg-green-50' },
    paused: { label: 'Paused', className: 'text-amber-600 bg-amber-50' },
    sent: { label: 'Completed', className: 'text-orange-600 bg-orange-50' },
    cancelled: { label: 'Cancelled', className: 'text-red-600 bg-red-50' },
    failed: { label: 'Failed', className: 'text-red-600 bg-red-50' },
    testing: { label: 'A/B Testing', className: 'text-violet-600 bg-violet-50' },
    test_completed: { label: 'Test Completed', className: 'text-green-600 bg-green-50' },
    winner_selected: { label: 'Winner Selected', className: 'text-green-600 bg-green-50' }
  }

  const config = statusConfig[broadcast.status] || {
    label: broadcast.status,
    className: 'text-gray-500 bg-gray-100'
  }

  return (
    <Space size="small">
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-block ${config.className}`}
      >
        {config.label}
      </span>
      {remainingTime && (
        <span className="text-xs text-gray-400">({remainingTime})</span>
      )}
      {broadcast.status === 'paused' && broadcast.pause_reason && (
        <Tooltip title={broadcast.pause_reason}>
          <FontAwesomeIcon
            icon={faCircleQuestion}
            className="text-orange-500 cursor-help opacity-70 text-xs"
          />
        </Tooltip>
      )}
    </Space>
  )
}

// Component for rendering a single broadcast card
interface BroadcastCardProps {
  broadcast: Broadcast
  lists: List[]
  segments: { id: string; name: string; color: string; users_count?: number }[]
  workspaceId: string
  onDelete: (broadcast: Broadcast) => void
  onPause: (broadcast: Broadcast) => void
  onResume: (broadcast: Broadcast) => void
  onCancel: (broadcast: Broadcast) => void
  onSchedule: (broadcast: Broadcast) => void
  onRefresh: (broadcast: Broadcast) => void
  currentWorkspace: any
  permissions: any
  currentPage: number
  pageSize: number
  isMobile: boolean
}

const BroadcastCard: React.FC<BroadcastCardProps> = ({
  broadcast,
  lists,
  segments,
  workspaceId,
  onDelete,
  onPause,
  onResume,
  onCancel,
  onSchedule,
  onRefresh,
  currentWorkspace,
  permissions,
  currentPage,
  pageSize,
  isMobile
}) => {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  // Fetch task associated with this broadcast
  const { data: task, isLoading: isTaskLoading } = useQuery({
    queryKey: ['task', workspaceId, broadcast.id],
    queryFn: () => {
      return taskApi.findByBroadcastId(workspaceId, broadcast.id)
    },
    refetchInterval:
      broadcast.status === 'sending'
        ? 5000
        : broadcast.status === 'scheduled'
          ? 30000
          : false
  })

  // Fetch test results if broadcast has A/B testing enabled and is in testing phase
  const { data: testResults } = useQuery({
    queryKey: ['testResults', workspaceId, broadcast.id],
    queryFn: () => {
      return broadcastApi.getTestResults({
        workspace_id: workspaceId,
        id: broadcast.id
      })
    },
    enabled:
      broadcast.test_settings.enabled &&
      ['testing', 'test_completed', 'winner_selected'].includes(broadcast.status),
    refetchInterval: broadcast.status === 'testing' ? 10000 : false
  })

  const remainingTestTime = getRemainingTestTime(broadcast, testResults)

  const handleSelectWinner = async (templateId: string) => {
    try {
      await broadcastApi.selectWinner({
        workspace_id: workspaceId,
        id: broadcast.id,
        template_id: templateId
      })
      message.success(
        'Winner selected successfully! The broadcast will be sent to remaining recipients.'
      )
      queryClient.invalidateQueries({
        queryKey: ['broadcasts', workspaceId, currentPage, pageSize]
      })
      queryClient.invalidateQueries({ queryKey: ['testResults', workspaceId, broadcast.id] })
    } catch (error) {
      message.error('Failed to select winner')
      console.error(error)
    }
  }

  // Task status popover
  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge status="processing" text="Pending" />
      case 'running':
        return <Badge status="processing" text="Running" />
      case 'completed':
        return <Badge status="success" text="Completed" />
      case 'failed':
        return <Badge status="error" text="Failed" />
      case 'cancelled':
        return <Badge status="warning" text="Cancelled" />
      case 'paused':
        return <Badge status="warning" text="Paused" />
      default:
        return <Badge status="default" text={status} />
    }
  }

  const taskPopoverContent = () => {
    if (!task) return null

    return (
      <div className="max-w-xs">
        <div className="mb-2">
          <div className="font-medium text-gray-500">Status</div>
          <div>{getTaskStatusBadge(task.status)}</div>
        </div>

        {task.next_run_after && (
          <div className="mb-2">
            <div className="font-medium text-gray-500">Next Run</div>
            <div className="text-sm">
              {task.status === 'paused' ? (
                <Tooltip title={dayjs(task.next_run_after).format('lll')}>
                  <span className="text-orange-600">{dayjs(task.next_run_after).fromNow()}</span>
                </Tooltip>
              ) : task.status === 'pending' ? (
                <Tooltip title={dayjs(task.next_run_after).format('lll')}>
                  <span className="text-blue-600">{dayjs(task.next_run_after).fromNow()}</span>
                </Tooltip>
              ) : (
                <Tooltip title={dayjs(task.next_run_after).format('lll')}>
                  <span>{dayjs(task.next_run_after).fromNow()}</span>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {(task.progress > 0 || task.state?.send_broadcast) && (
          <div className="mb-2">
            <div className="font-medium text-gray-500">Progress</div>
            <Progress
              percent={Math.round(
                task.state?.send_broadcast
                  ? (task.state.send_broadcast.sent_count /
                    task.state.send_broadcast.total_recipients) *
                  100
                  : task.progress * 100
              )}
              size="small"
            />
          </div>
        )}

        {task.state?.message && (
          <div className="mb-2">
            <div className="font-medium text-gray-500">Message</div>
            <div>{task.state.message}</div>
          </div>
        )}

        {task.state?.send_broadcast && (
          <div className="mb-2">
            <div className="font-medium text-gray-500">Broadcast Progress</div>
            <div className="text-sm">
              Sent: {task.state.send_broadcast.sent_count} of{' '}
              {task.state.send_broadcast.total_recipients}
              {task.state.send_broadcast.failed_count > 0 && (
                <div className="text-red-500">Failed: {task.state.send_broadcast.failed_count}</div>
              )}
            </div>
          </div>
        )}

        {task.error_message && (
          <div className="mb-2">
            <div className="font-medium text-gray-500">Error</div>
            <div className="text-red-500 text-sm">{task.error_message}</div>
          </div>
        )}

        {task.type && <div className="text-xs text-gray-500 mt-2">Task type: {task.type}</div>}
      </div>
    )
  }

  // Build audience tags
  const audienceTags = () => {
    if (broadcast.audience.segments && broadcast.audience.segments.length > 0) {
      return broadcast.audience.segments.map((segmentId) => {
        const segment = segments.find((s) => s.id === segmentId)
        if (segment) {
          return (
            <Tag key={segment.id} color={segment.color} bordered={false} className="!m-0">
              {segment.name}
            </Tag>
          )
        }
        return (
          <Tag key={segmentId} bordered={false} className="!m-0">
            Unknown
          </Tag>
        )
      })
    }
    return [
      <Tag key="all" color="blue" bordered={false} className="!m-0">
        All Contacts
      </Tag>
    ]
  }

  // Format date for display
  const formatDate = (date?: string) => {
    if (!date) return '-'
    const d = dayjs(date)
    if (d.isToday()) return 'Today'
    return d.fromNow()
  }

  // Action buttons based on status
  const renderActions = () => {
    const buttons: React.ReactNode[] = []

    if (broadcast.status === 'draft' || broadcast.status === 'scheduled') {
      buttons.push(
        <Tooltip
          key="edit"
          title={
            !permissions?.broadcasts?.write
              ? "You don't have write permission for broadcasts"
              : 'Edit'
          }
        >
          <div>
            <UpsertBroadcastDrawer
              workspace={currentWorkspace!}
              broadcast={broadcast}
              lists={lists}
              segments={segments}
              buttonContent={<FontAwesomeIcon icon={faPenToSquare} style={{ opacity: 0.7 }} />}
              buttonProps={{
                size: 'small',
                type: 'text',
                disabled: !permissions?.broadcasts?.write
              }}
            />
          </div>
        </Tooltip>
      )
    }

    if (broadcast.status === 'sending') {
      buttons.push(
        <Tooltip
          key="pause"
          title={
            !permissions?.broadcasts?.write
              ? "You don't have write permission for broadcasts"
              : 'Pause'
          }
        >
          <Popconfirm
            title="Pause broadcast?"
            description="The broadcast will stop sending and can be resumed later."
            onConfirm={() => onPause(broadcast)}
            okText="Yes, pause"
            cancelText="Cancel"
            disabled={!permissions?.broadcasts?.write}
          >
            <Button type="text" size="small" disabled={!permissions?.broadcasts?.write}>
              <FontAwesomeIcon icon={faCirclePause} style={{ opacity: 0.7 }} />
            </Button>
          </Popconfirm>
        </Tooltip>
      )
    }

    if (broadcast.status === 'paused') {
      buttons.push(
        <Tooltip
          key="resume"
          title={
            !permissions?.broadcasts?.write
              ? "You don't have write permission for broadcasts"
              : 'Resume'
          }
        >
          <Popconfirm
            title="Resume broadcast?"
            description="The broadcast will continue sending from where it was paused."
            onConfirm={() => onResume(broadcast)}
            okText="Yes, resume"
            cancelText="Cancel"
            disabled={!permissions?.broadcasts?.write}
          >
            <Button type="text" size="small" disabled={!permissions?.broadcasts?.write}>
              <FontAwesomeIcon icon={faCirclePlay} style={{ opacity: 0.7 }} />
            </Button>
          </Popconfirm>
        </Tooltip>
      )
    }

    if (broadcast.status === 'scheduled') {
      buttons.push(
        <Tooltip
          key="cancel"
          title={
            !permissions?.broadcasts?.write
              ? "You don't have write permission for broadcasts"
              : 'Cancel'
          }
        >
          <Button
            type="text"
            size="small"
            onClick={() => onCancel(broadcast)}
            disabled={!permissions?.broadcasts?.write}
          >
            <FontAwesomeIcon icon={faBan} style={{ opacity: 0.7 }} />
          </Button>
        </Tooltip>
      )
    }

    if (broadcast.status === 'draft') {
      buttons.push(
        <Tooltip
          key="delete"
          title={
            !permissions?.broadcasts?.write
              ? "You don't have write permission for broadcasts"
              : 'Delete'
          }
        >
          <Button
            type="text"
            size="small"
            onClick={() => onDelete(broadcast)}
            disabled={!permissions?.broadcasts?.write}
          >
            <FontAwesomeIcon icon={faTrashCan} style={{ opacity: 0.7 }} />
          </Button>
        </Tooltip>
      )
      buttons.push(
        <Tooltip
          key="send"
          title={
            !permissions?.broadcasts?.write
              ? "You don't have write permission for broadcasts"
              : undefined
          }
        >
          <Button
            type="primary"
            size="small"
            ghost
            disabled={
              !permissions?.broadcasts?.write ||
              !currentWorkspace?.settings?.marketing_email_provider_id
            }
            onClick={() => onSchedule(broadcast)}
          >
            Send or Schedule
          </Button>
        </Tooltip>
      )
    }

    return buttons
  }

  return (
    <div style={{ borderRadius: isMobile ? 12 : 20, backgroundColor: '#FAFAFA', marginBottom: isMobile ? 12 : 20 }}>
      {/* Header: Name + Status + Actions */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 14px 8px' : '20px 24px 12px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 6 : 0,
      }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: '#111827' }}>{broadcast.name}</span>
          {task ? (
            <Popover
              content={taskPopoverContent}
              title="Task Status"
              placement="bottom"
              trigger={isMobile ? 'click' : 'hover'}
            >
              <span className="cursor-help">
                <StatusTag broadcast={broadcast} remainingTime={remainingTestTime} />
              </span>
            </Popover>
          ) : isTaskLoading ? (
            <span className="flex items-center gap-1.5">
              <StatusTag broadcast={broadcast} remainingTime={remainingTestTime} />
              <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400" style={{ fontSize: '12px' }} />
            </span>
          ) : (
            <StatusTag broadcast={broadcast} remainingTime={remainingTestTime} />
          )}
        </div>
        <div className="flex items-center gap-1" style={{ flexShrink: 0, alignSelf: isMobile ? 'flex-end' : undefined, marginTop: isMobile ? -24 : 0 }}>
          {/* {renderActions()} */}
          <Tooltip title="Refresh">
            <Button
              type="text"
              size="small"
              icon={<FontAwesomeIcon icon={faRefresh} style={{ fontSize: '16px' }} />}
              onClick={() => onRefresh(broadcast)}
              className="!text-[#1C1D1F] hover:!text-gray-600"
            />
          </Tooltip>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: isMobile ? '0 10px 10px' : '0 16px 16px' }}>
        <BroadcastStats workspaceId={workspaceId} broadcastId={broadcast.id} workspace={currentWorkspace} isMobile={isMobile} />
      </div>

      {/* Footer: Audience (left) + Dates (right) */}
      <div style={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '4px 14px 12px' : '4px 24px 20px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 8 : 0,
      }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="text-xs text-gray-400 font-medium">Audience:</span>
          <div className="flex items-center gap-1.5" style={{ flexWrap: 'wrap' }}>
            {audienceTags()}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500" style={{ flexWrap: 'wrap' }}>
          {broadcast.started_at && (
            <span>
              <span className="font-medium">Started:</span>{' '}
              <span className="font-semibold text-gray-700">{formatDate(broadcast.started_at)}</span>
            </span>
          )}
          <span>
            <span className="font-medium">Completed:</span>{' '}
            <span className="font-semibold text-gray-700">{formatDate(broadcast.completed_at)}</span>
          </span>
        </div>
      </div>

    </div>
  )
}

export function BroadcastsPage() {
  const { workspaceId } = useParams({ strict: false }) as { workspaceId: string }
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [broadcastToDelete, setBroadcastToDelete] = useState<Broadcast | null>(null)
  const [confirmationInput, setConfirmationInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false)
  const [broadcastToSchedule, setBroadcastToSchedule] = useState<Broadcast | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()
  const { workspaces } = useAuth()
  const { permissions } = useWorkspacePermissions(workspaceId)
  const { message } = App.useApp()
  const isMobile = useIsMobile()

  const currentWorkspace = workspaces.find((workspace) => workspace.id === workspaceId)

  const { data, isLoading } = useQuery({
    queryKey: ['broadcasts', workspaceId, currentPage, pageSize],
    queryFn: () => {
      return broadcastApi.list({
        workspace_id: workspaceId,
        with_templates: true,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      })
    }
  })

  const { data: listsData } = useQuery({
    queryKey: ['lists', workspaceId],
    queryFn: () => {
      return listsApi.list({ workspace_id: workspaceId, with_templates: true })
    }
  })

  const lists = listsData?.lists || []

  const { data: segmentsData } = useQuery({
    queryKey: ['segments', workspaceId],
    queryFn: () => {
      return listSegments({ workspace_id: workspaceId, with_count: true })
    }
  })

  const segments = segmentsData?.segments || []

  const handleDeleteBroadcast = async () => {
    if (!broadcastToDelete) return

    setIsDeleting(true)
    try {
      await broadcastApi.delete({
        workspace_id: workspaceId,
        id: broadcastToDelete.id
      })

      message.success(`Broadcast "${broadcastToDelete.name}" deleted successfully`)
      queryClient.invalidateQueries({
        queryKey: ['broadcasts', workspaceId, currentPage, pageSize]
      })

      if (currentPage > 1 && data?.broadcasts.length === 1) {
        setCurrentPage(currentPage - 1)
      }
      setDeleteModalVisible(false)
      setBroadcastToDelete(null)
      setConfirmationInput('')
    } catch (error) {
      message.error('Failed to delete broadcast')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePauseBroadcast = async (broadcast: Broadcast) => {
    try {
      await broadcastApi.pause({
        workspace_id: workspaceId,
        id: broadcast.id
      })
      message.success(`Broadcast "${broadcast.name}" paused successfully`)
      queryClient.invalidateQueries({
        queryKey: ['broadcasts', workspaceId, currentPage, pageSize]
      })
    } catch (error) {
      message.error('Failed to pause broadcast')
      console.error(error)
    }
  }

  const handleResumeBroadcast = async (broadcast: Broadcast) => {
    try {
      await broadcastApi.resume({
        workspace_id: workspaceId,
        id: broadcast.id
      })
      message.success(`Broadcast "${broadcast.name}" resumed successfully`)
      queryClient.invalidateQueries({
        queryKey: ['broadcasts', workspaceId, currentPage, pageSize]
      })
    } catch (error) {
      message.error('Failed to resume broadcast')
      console.error(error)
    }
  }

  const handleCancelBroadcast = async (broadcast: Broadcast) => {
    try {
      await broadcastApi.cancel({
        workspace_id: workspaceId,
        id: broadcast.id
      })
      message.success(`Broadcast "${broadcast.name}" cancelled successfully`)
      queryClient.invalidateQueries({
        queryKey: ['broadcasts', workspaceId, currentPage, pageSize]
      })
    } catch (error) {
      message.error('Failed to cancel broadcast')
      console.error(error)
    }
  }

  const openDeleteModal = (broadcast: Broadcast) => {
    setBroadcastToDelete(broadcast)
    setDeleteModalVisible(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalVisible(false)
    setBroadcastToDelete(null)
    setConfirmationInput('')
  }

  const handleScheduleBroadcast = (broadcast: Broadcast) => {
    setBroadcastToSchedule(broadcast)
    setIsScheduleModalVisible(true)
  }

  const closeScheduleModal = () => {
    setIsScheduleModalVisible(false)
    setBroadcastToSchedule(null)
  }

  const handleRefreshBroadcast = (broadcast: Broadcast) => {
    queryClient.invalidateQueries({ queryKey: ['broadcast-stats', workspaceId, broadcast.id] })
    queryClient.invalidateQueries({ queryKey: ['task', workspaceId, broadcast.id] })
    queryClient.invalidateQueries({ queryKey: ['testResults', workspaceId, broadcast.id] })
    queryClient.invalidateQueries({ queryKey: ['broadcasts', workspaceId, currentPage, pageSize] })
    message.success(`Broadcast "${broadcast.name}" refreshed`)
  }

  const hasBroadcasts = !isLoading && data?.broadcasts && data.broadcasts.length > 0
  const isTrulyEmpty = !isLoading && (!data?.broadcasts || data.broadcasts.length === 0)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable content */}
      {isTrulyEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <EmptyState
            icon={<EnvelopeIcon />}
            title="No Campaigns Launched Yet"
            action={
              currentWorkspace ? (
                <Tooltip
                  title={
                    !permissions?.broadcasts?.write
                      ? "You don't have write permission for broadcasts"
                      : undefined
                  }
                >
                  <Link
                    to="/workspace/$workspaceId/create"
                    params={{ workspaceId }}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      disabled={!permissions?.broadcasts?.write}
                      style={{ borderRadius: '10px' }}
                    >
                      Create Campaign
                    </Button>
                  </Link>
                </Tooltip>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto" style={{ padding: isMobile ? '16px 16px 0' : '20px 20px 0' }}>
          {/* Create Campaign button */}
          {/* {currentWorkspace && hasBroadcasts && (
        <div className="flex justify-end mb-4">
          <Tooltip
            title={
              !permissions?.broadcasts?.write
                ? "You don't have write permission for broadcasts"
                : undefined
            }
          >
            <div>
              <UpsertBroadcastDrawer
                workspace={currentWorkspace}
                lists={lists}
                segments={segments}
                buttonContent={<>Create Campaign</>}
                buttonProps={{
                  disabled: !permissions?.broadcasts?.write
                }}
              />
            </div>
          </Tooltip>
        </div>
      )} */}

          {!currentWorkspace?.settings?.marketing_email_provider_id && (
            <Alert
              message="Email Provider Required"
              description="You don't have a marketing email provider configured. Please set up an email provider in your workspace settings to send broadcasts."
              type="warning"
              showIcon
              className="!mb-6"
              action={
                <Button
                  type="primary"
                  size="small"
                  href={`/workspace/${workspaceId}/settings/integrations`}
                >
                  Configure Provider
                </Button>
              }
            />
          )}

          {isLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((key) => (
                <div key={key} className="rounded-xl bg-[#F5F7FA] h-48 animate-pulse" />
              ))}
            </div>
          ) : hasBroadcasts ? (
            <div>
              {data.broadcasts.map((broadcast: Broadcast) => (
                <BroadcastCard
                  key={broadcast.id}
                  broadcast={broadcast}
                  lists={lists}
                  segments={segments}
                  workspaceId={workspaceId}
                  onDelete={openDeleteModal}
                  onPause={handlePauseBroadcast}
                  onResume={handleResumeBroadcast}
                  onCancel={handleCancelBroadcast}
                  onSchedule={handleScheduleBroadcast}
                  onRefresh={handleRefreshBroadcast}
                  currentWorkspace={currentWorkspace}
                  permissions={permissions}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(28, 29, 31, 0.4)' }}>
              No broadcasts found
            </div>
          )}

        </div>
      )}

      {!isTrulyEmpty && (
        <PaginationFooter
          totalItems={data?.total_count || 0}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
          loading={isLoading}
          emptyLabel="No broadcasts"
          isMobile={isMobile}
        />
      )}

      <SendOrScheduleModal
        broadcast={broadcastToSchedule}
        visible={isScheduleModalVisible}
        onClose={closeScheduleModal}
        workspaceId={workspaceId}
        workspace={currentWorkspace}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['broadcasts', workspaceId, currentPage, pageSize]
          })
        }}
      />

      <Modal
        title="Delete Broadcast"
        open={deleteModalVisible}
        onCancel={closeDeleteModal}
        footer={[
          <Button key="cancel" onClick={closeDeleteModal}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeleting}
            disabled={confirmationInput !== (broadcastToDelete?.id || '')}
            onClick={handleDeleteBroadcast}
          >
            Delete
          </Button>
        ]}
      >
        {broadcastToDelete && (
          <>
            <p>Are you sure you want to delete the broadcast "{broadcastToDelete.name}"?</p>
            <p>
              This action cannot be undone. To confirm, please enter the broadcast ID:{' '}
              <Text code>{broadcastToDelete.id}</Text>
              <Tooltip title="Copy to clipboard">
                <Button
                  type="text"
                  icon={<FontAwesomeIcon icon={faCopy} style={{ opacity: 0.7 }} />}
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(broadcastToDelete.id)
                    message.success('Broadcast ID copied to clipboard')
                  }}
                />
              </Tooltip>
            </p>
            <Input
              placeholder="Enter broadcast ID to confirm"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              status={
                confirmationInput && confirmationInput !== broadcastToDelete.id ? 'error' : ''
              }
            />
            {confirmationInput && confirmationInput !== broadcastToDelete.id && (
              <p className="text-red-500 mt-2">ID doesn't match</p>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
