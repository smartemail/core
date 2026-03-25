import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, Input, Select, Typography, App, Tabs, Spin, Switch, DatePicker, ConfigProvider } from 'antd'
import { SendOutlined, ArrowRightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Workspace, Template } from '../../services/api/types'
import {
  transactionalNotificationsApi,
} from '../../services/api/transactional_notifications'
import { broadcastApi } from '../../services/api/broadcast'
import { listsApi } from '../../services/api/list'
import { contactsApi } from '../../services/api/contacts'
import { listSegments, type Segment } from '../../services/api/segment'
import { pricingApi } from '../../services/api/pricing'
import { useQuery } from '@tanstack/react-query'
import { useIsMobile } from '../../hooks/useIsMobile'
import { DiamondIcon } from '../settings/SettingsIcons'

const { Text } = Typography

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  const hourStr = hour.toString().padStart(2, '0')
  const minuteStr = minute.toString().padStart(2, '0')
  return { value: `${hourStr}:${minuteStr}`, label: `${hourStr}:${minuteStr}` }
})

interface SendTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: Template | null
  workspace: Workspace | null
  loading?: boolean
}

export default function SendTemplateModal({
  isOpen,
  onClose,
  template,
  workspace,
  loading = false
}: SendTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<string>('send')
  const [email, setEmail] = useState('')
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('')
  const [selectedSenderId, setSelectedSenderId] = useState<string>('')
  const [sendLoading, setSendLoading] = useState(false)
  const [fromName, setFromName] = useState<string>('')
  const [ccEmails, setCcEmails] = useState<string[]>([])
  const [bccEmails, setBccEmails] = useState<string[]>([])
  const [replyTo, setReplyTo] = useState<string>('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState<string>('')
  const [scheduleForLater, setScheduleForLater] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string | null>(null)
  const [scheduledTime, setScheduledTime] = useState<string | null>(null)
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null)
  const { message } = App.useApp()
  const isMobile = useIsMobile()

  // Filter to only email integrations
  const emailIntegrations = useMemo(
    () =>
      workspace?.integrations?.filter(
        (integration) => integration.type === 'email' && integration.email_provider?.kind
      ) || [],
    [workspace?.integrations]
  )

  // Fetch total contacts count
  const { data: totalContactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts-count', workspace?.id],
    queryFn: () => contactsApi.getTotalContacts({ workspace_id: workspace!.id }),
    enabled: isOpen && !!workspace?.id
  })
  const totalContacts = totalContactsData?.total_contacts

  // Fetch segments with counts
  const { data: segmentsData, isLoading: segmentsLoading } = useQuery({
    queryKey: ['segments', workspace?.id],
    queryFn: () => listSegments({ workspace_id: workspace!.id, with_count: true }),
    enabled: isOpen && !!workspace?.id
  })
  const segments: Segment[] = segmentsData?.segments || []

  // Fetch default list ID (first list)
  const { data: listsData } = useQuery({
    queryKey: ['lists', workspace?.id],
    queryFn: () => listsApi.list({ workspace_id: workspace!.id }),
    enabled: isOpen && !!workspace?.id
  })
  const defaultListId = listsData?.lists?.[0]?.id || ''

  // Set default integration when modal opens or template changes
  useEffect(() => {
    if (isOpen && workspace && emailIntegrations.length > 0 && !selectedIntegrationId) {
      const defaultId =
        template?.category === 'marketing'
          ? workspace.settings?.marketing_email_provider_id
          : workspace.settings?.transactional_email_provider_id

      const integrationId =
        defaultId && emailIntegrations.some((i) => i.id === defaultId)
          ? defaultId
          : emailIntegrations[0]?.id || ''

      setSelectedIntegrationId(integrationId)

      const integration = emailIntegrations.find((i) => i.id === integrationId)
      setSelectedSenderId(integration?.email_provider?.senders[0]?.id || '')
    }
  }, [isOpen, template, workspace, emailIntegrations, selectedIntegrationId])

  // Fetch credits when modal opens
  useEffect(() => {
    if (isOpen) {
      pricingApi.subscription().then((res) => setCreditsLeft(res.credits_left)).catch(() => {})
    }
  }, [isOpen])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setFromName('')
      setCcEmails([])
      setBccEmails([])
      setReplyTo('')
      setShowAdvancedOptions(false)
      setSelectedAudience('')
      setActiveTab('send')
      setScheduleForLater(false)
      setScheduledDate(null)
      setScheduledTime(null)
    }
  }, [isOpen])

  const handleSendEmail = async () => {
    if (!template || !workspace || !selectedAudience || !selectedIntegrationId || !defaultListId) return

    setSendLoading(true)
    try {
      // Create a broadcast with the selected audience and template
      const audience = selectedAudience === 'all'
        ? { list: defaultListId, exclude_unsubscribed: true }
        : { list: defaultListId, segments: [selectedAudience], exclude_unsubscribed: true }

      const createResponse = await broadcastApi.create({
        workspace_id: workspace.id,
        name: `Send: ${template.name}`,
        audience,
        schedule: {
          is_scheduled: false,
          use_recipient_timezone: false
        },
        test_settings: {
          enabled: false,
          sample_percentage: 0,
          auto_send_winner: false,
          variations: [
            {
              variation_name: 'default',
              template_id: template.id
            }
          ]
        }
      })

      // Send immediately or schedule
      await broadcastApi.schedule({
        workspace_id: workspace.id,
        id: createResponse.broadcast.id,
        send_now: !scheduleForLater,
        scheduled_date: scheduleForLater ? scheduledDate || undefined : undefined,
        scheduled_time: scheduleForLater ? scheduledTime || undefined : undefined,
      })

      message.success(scheduleForLater ? 'Email scheduled successfully' : 'Email sent successfully')
      onClose()
    } catch (error: any) {
      const errorMessage =
        error?.response?.status === 400 && error?.response?.data?.message
          ? error.response.data.message
          : error?.message || 'Something went wrong'
      message.error(`Error: ${errorMessage}`)
    } finally {
      setSendLoading(false)
    }
  }

  const handleTestSend = async () => {
    if (!template || !workspace || !selectedIntegrationId) return

    setSendLoading(true)
    try {
      const response = await transactionalNotificationsApi.testTemplate(
        workspace.id,
        template.id,
        selectedIntegrationId,
        selectedSenderId,
        email,
        {
          from_name: fromName || undefined,
          cc: ccEmails,
          bcc: bccEmails,
          reply_to: replyTo
        }
      )

      if (response.success) {
        message.success('Test email sent successfully')
        onClose()
      } else {
        message.error(`Failed to send test email: ${response.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.status === 400 && error?.response?.data?.message
          ? error.response.data.message
          : error?.message || 'Something went wrong'
      message.error(`Error: ${errorMessage}`)
    } finally {
      setSendLoading(false)
    }
  }

  const selectedIntegration = emailIntegrations.find(
    (integration) => integration.id === selectedIntegrationId
  )
  const selectedSender = selectedIntegration?.email_provider?.senders.find(
    (s) => s.id === selectedSenderId
  )
  const senderDisplay = selectedSender
    ? `${selectedSender.name} <${selectedSender.email}>`
    : 'No sender configured'

  const labelStyle = { fontWeight: 500, fontSize: 14, color: '#1C1D1F', display: 'block', marginBottom: 8 } as const
  const inputFontSize = isMobile ? 16 : 14
  const inputStyle = { height: 50, borderRadius: 10, background: '#F4F4F5', border: '1px solid #E7E7E7', padding: '0 20px', fontSize: inputFontSize } as const
  const descStyle = { fontSize: 14, color: '#1C1D1F', opacity: 0.3, lineHeight: 1.3 } as const

  const sendEmailTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Text style={descStyle}>Re-sent the email with it's surrent contents and subject line.</Text>

      <div>
        <Text style={labelStyle}>Sender</Text>
        <Input value={senderDisplay} disabled style={inputStyle} />
      </div>

      <div>
        <Text style={labelStyle}>
          Audience<span style={{ color: '#FB2F4A' }}>*</span>
        </Text>
        {(contactsLoading || segmentsLoading) ? (
          <div style={{ padding: 12, textAlign: 'center' }}>
            <Spin size="small" />
          </div>
        ) : (
          <Select
            style={{ width: '100%', height: 50, borderRadius: 10, fontSize: inputFontSize }}
            variant="filled"
            value={selectedAudience || undefined}
            onChange={setSelectedAudience}
            placeholder="Select audience"
          >
            <Select.Option key="all" value="all">
              All Contacts
              <span style={{ color: '#1C1D1F', opacity: 0.3 }}>
                {' '}({(totalContacts ?? 0).toLocaleString()})
              </span>
            </Select.Option>
            {segments.map((segment) => (
              <Select.Option key={segment.id} value={segment.id}>
                {segment.name}
                {segment.users_count !== undefined && (
                  <span style={{ color: '#1C1D1F', opacity: 0.3 }}>
                    {' '}({segment.users_count.toLocaleString()})
                  </span>
                )}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>

      {/* Schedule toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          borderTop: '1px solid #F0F0F0',
          borderBottom: scheduleForLater ? 'none' : '1px solid #F0F0F0',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F' }}>
          Schedule for later delivery
        </Text>
        <Switch
          checked={scheduleForLater}
          onChange={setScheduleForLater}
        />
      </div>

      {/* Schedule fields */}
      {scheduleForLater && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          <div>
            <Text style={{ fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Select date<span style={{ color: '#FB2F4A' }}>*</span>
            </Text>
            <DatePicker
              format="YYYY-MM-DD"
              value={scheduledDate ? dayjs(scheduledDate) : null}
              onChange={(date) => setScheduledDate(date ? date.format('YYYY-MM-DD') : null)}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              style={{
                width: '100%',
                borderRadius: 16,
                height: 49,
                background: '#F4F4F5',
                borderColor: '#E7E7E7',
              }}
              placeholder="Select Date"
            />
          </div>
          <div>
            <Text style={{ fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Time<span style={{ color: '#FB2F4A' }}>*</span>
            </Text>
            <ConfigProvider
              theme={{
                components: {
                  Select: {
                    selectorBg: '#F4F4F5',
                    colorBorder: '#E7E7E7',
                    borderRadius: 16,
                  },
                },
              }}
            >
              <Select
                value={scheduledTime}
                onChange={setScheduledTime}
                style={{ width: '100%', height: 49 }}
                placeholder="Select time"
                options={TIME_OPTIONS}
              />
            </ConfigProvider>
          </div>
        </div>
      )}
    </div>
  )

  const testSendTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Text style={descStyle}>Sent a test email using this template to verify how it will look.</Text>

      <div>
        <Text style={labelStyle}>Sender</Text>
        <Input value={senderDisplay} disabled style={inputStyle} />
      </div>

      <div>
        <Text style={labelStyle}>
          Recipient Email<span style={{ color: '#FB2F4A' }}>*</span>
        </Text>
        <Input
          placeholder="recipient@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          style={inputStyle}
        />
      </div>

      {!showAdvancedOptions && (
        <div
          onClick={() => setShowAdvancedOptions(true)}
          style={{ fontSize: 13, fontWeight: 500, color: '#2F6DFB', cursor: 'pointer', userSelect: 'none' }}
        >
          + add form name, CC, BCC, reply to, etc.
        </div>
      )}

      {showAdvancedOptions && (
        <>
          <div>
            <Text style={labelStyle}>From Narrative (override)</Text>
            <Input
              placeholder="Custom Sender Name (optional)"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              allowClear
              style={inputStyle}
            />
            <Text style={{ ...descStyle, fontSize: 12, marginTop: 4, display: 'block' }}>
              Override the default sender name for this test email
            </Text>
          </div>

          <div>
            <Text style={labelStyle}>CC Recipients</Text>
            <Select
              mode="tags"
              placeholder="Enter CC email addresses"
              value={ccEmails}
              onChange={setCcEmails}
              tokenSeparators={[',', ' ']}
              allowClear
              style={{ width: '100%', minHeight: 50, borderRadius: 10, fontSize: inputFontSize }}
              variant="filled"
            />
          </div>

          <div>
            <Text style={labelStyle}>BCC Recipients</Text>
            <Select
              mode="tags"
              placeholder="Enter BCC email addresses"
              value={bccEmails}
              onChange={setBccEmails}
              tokenSeparators={[',', ' ']}
              allowClear
              style={{ width: '100%', minHeight: 50, borderRadius: 10, fontSize: inputFontSize }}
              variant="filled"
            />
          </div>

          <div>
            <Text style={labelStyle}>Reply-To</Text>
            <Input
              placeholder="Enter reply-to email address"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              allowClear
              style={inputStyle}
            />
          </div>
        </>
      )}
    </div>
  )

  const sendDisabled = !selectedAudience || !selectedIntegrationId || sendLoading ||
    (scheduleForLater && (!scheduledDate || !scheduledTime))

  const footer =
    activeTab === 'send'
      ? [
          <Button key="cancel" onClick={onClose} className="flex-1" size="large">
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendEmail}
            disabled={sendDisabled}
            loading={sendLoading}
            size="large"
            className="flex-1"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <SendOutlined />
            <span>{scheduleForLater ? 'Schedule' : 'Send Now'}</span>
            {creditsLeft != null && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 8,
                  opacity: 0.8,
                }}
              >
                <DiamondIcon size={14} />
                <span>{creditsLeft.toLocaleString()}</span>
              </span>
            )}
          </Button>
        ]
      : [
          <Button key="cancel" onClick={onClose} className="flex-1" size="large">
            Cancel
          </Button>,
          <Button
            key="test"
            type="primary"
            onClick={handleTestSend}
            disabled={!email || !selectedIntegrationId || loading || sendLoading}
            loading={loading || sendLoading}
            size="large"
            className="flex-1"
          >
            Send Test Email <ArrowRightOutlined />
          </Button>
        ]

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={footer}
      width={520}
      closable={true}
      styles={{ footer: { display: 'flex', gap: 12 } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'send',
            label: <span style={{ fontSize: 15, fontWeight: 600 }}>Send Email</span>,
            children: sendEmailTab
          },
          {
            key: 'test',
            label: <span style={{ fontSize: 15, fontWeight: 600 }}>Test Send</span>,
            children: testSendTab
          }
        ]}
      />
    </Modal>
  )
}
