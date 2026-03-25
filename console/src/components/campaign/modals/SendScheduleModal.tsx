import { Modal, Button, Switch, DatePicker, Select, Typography, ConfigProvider } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { DiamondIcon } from '../../settings/SettingsIcons'

const { Text } = Typography

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  const hourStr = hour.toString().padStart(2, '0')
  const minuteStr = minute.toString().padStart(2, '0')
  return { value: `${hourStr}:${minuteStr}`, label: `${hourStr}:${minuteStr}` }
})

interface SendScheduleModalProps {
  open: boolean
  onClose: () => void
  onSend: () => void
  campaignName: string
  isSaving: boolean
  scheduleForLater: boolean
  onScheduleForLaterChange: (v: boolean) => void
  scheduledDate: string | null
  onScheduledDateChange: (v: string | null) => void
  scheduledTime: string | null
  onScheduledTimeChange: (v: string | null) => void
  creditCost: number
  creditsLeft: number
}

export function SendScheduleModal({
  open,
  onClose,
  onSend,
  campaignName,
  isSaving,
  scheduleForLater,
  onScheduleForLaterChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange,
  creditCost,
  creditsLeft,
}: SendScheduleModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      closable={false}
      styles={{
        header: { display: 'none' },
        content: {
          background: '#FAFAFA',
          borderRadius: 20,
          boxShadow: '0 16px 36px rgba(28, 29, 31, 0.1)',
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 700, fontSize: 24, color: '#2A2B3B' }}>
            Send or Schedule
          </Text>
          <div
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(28, 29, 31, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M0 0L10 10M10 0L0 10" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <Text style={{ fontSize: 14, fontWeight: 400, color: '#2A2B3B', lineHeight: 1.6 }}>
          Do you want to send &ldquo;{campaignName}&rdquo; immediately or schedule it for later?
        </Text>

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
            onChange={onScheduleForLaterChange}
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
                onChange={(date) => onScheduledDateChange(date ? date.format('YYYY-MM-DD') : null)}
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
                  onChange={onScheduledTimeChange}
                  style={{ width: '100%', height: 49 }}
                  placeholder="Select time"
                  options={TIME_OPTIONS}
                />
              </ConfigProvider>
            </div>
          </div>
        )}

        {/* Send button */}
        <Button
          type="primary"
          block
          size="large"
          onClick={onSend}
          loading={isSaving}
          style={{
            height: 48,
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <SendOutlined />
          <span>{scheduleForLater ? 'Schedule' : 'Send Now'}</span>
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
            <span>{creditCost} / {creditsLeft.toLocaleString()}</span>
          </span>
        </Button>
      </div>
    </Modal>
  )
}
