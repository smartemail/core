import { Modal, Typography } from 'antd'
import { DiamondIcon } from '../../settings/SettingsIcons'
import { GenerateButton } from '../sections/GenerateButton'
import type { CreditBreakdown } from '../hooks/useCampaignWizard'

const { Text } = Typography

interface CreditConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isGenerating: boolean
  breakdown: CreditBreakdown[]
  totalCost: number
  creditsAvailable: number
}

export function CreditConfirmationModal({
  open,
  onClose,
  onConfirm,
  isGenerating,
  breakdown,
  totalCost,
  creditsAvailable,
}: CreditConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={472}
      centered
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
        content: { borderRadius: 20, padding: 0 },
      }}
      closable={false}
    >
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header: Title + Close button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 700, fontSize: 24, color: '#2A2B3B' }}>
            Ready to Generate
          </Text>
          <div
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(28,29,31,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Credit summary */}
        <Text style={{ fontSize: 15, fontWeight: 500, color: '#1C1D1F', lineHeight: 1.6 }}>
          This generation will use{' '}
          <span style={{ color: '#2F6DFB'}}>{totalCost} credits</span>
          <br />
          out of your{' '}
          <span style={{ color: '#2F6DFB' }}>{creditsAvailable.toLocaleString()} available.</span>
        </Text>

        {/* Breakdown rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {breakdown.map((item, i) => (
            <div
              key={i}
              style={{
                height: 44,
                borderRadius: 10,
                background: i % 2 === 0 ? 'rgba(28,29,31,0.03)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 500, color: '#1C1D1F' }}>{item.label}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DiamondIcon size={20} />
                <Text style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F' }}>
                  {item.cost} credits
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* Footer text */}
        <Text style={{ fontSize: 14, color: '#1C1D1F', opacity: 0.3, lineHeight: 1.3 }}>
          Credits will be used once generation starts.
          <br />
          This may take a minute or two.
        </Text>

        {/* Generate button */}
        <GenerateButton
          isGenerated={false}
          isGenerating={isGenerating}
          disabled={false}
          creditCost={totalCost}
          creditsTotal={creditsAvailable}
          onClick={onConfirm}
        />
      </div>
    </Modal>
  )
}
