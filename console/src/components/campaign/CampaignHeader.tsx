import { Button, Tooltip } from 'antd'
import { ArrowRightOutlined, SaveOutlined } from '@ant-design/icons'
import { CAMPAIGN_STEPS, type CampaignStep } from './constants'

const STEP_COUNT = CAMPAIGN_STEPS.length

interface CampaignHeaderProps {
  currentStep: CampaignStep
  onStepChange: (step: CampaignStep) => void
  onContinue: () => void
  onSaveDraft: () => void
  isSaving: boolean
  isMobile?: boolean
  continueDisabled?: boolean
  saveDraftDisabled?: boolean
  isEditMode?: boolean
  isGuestMode?: boolean
}

export function CampaignHeader({
  currentStep,
  onStepChange,
  onContinue,
  onSaveDraft,
  isSaving,
  isMobile = false,
  continueDisabled = false,
  saveDraftDisabled = false,
  isEditMode = false,
  isGuestMode = false,
}: CampaignHeaderProps) {
  const isSettingsStep = currentStep === 'settings'
  const activeIndex = CAMPAIGN_STEPS.findIndex((s) => s.key === currentStep)
  const title = isEditMode ? 'Edit Campaign' : 'New Campaign'
  const saveLabel = isEditMode ? 'Save' : 'Save Draft'

  if (isMobile) {
    return (
      <div
        style={{
          background: '#FAFAFA',
          borderBottom: '1px solid #EAEAEC',
          padding: '10px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Top row */}
        <div style={{ marginBottom: isEditMode ? 0 : 10 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1D1F' }}>
            {title}
          </div>
        </div>
        {/* Step pills — hidden in edit mode */}
        {!isEditMode && (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: 5,
              gap: 11,
              background: '#F4F4F5',
              border: '1px solid #E4E4E4',
              borderRadius: 10,
            }}
          >
            {/* Sliding indicator */}
            <div
              style={{
                position: 'absolute',
                top: 5,
                bottom: 5,
                left: activeIndex === 0
                  ? 5
                  : `calc(${(activeIndex / STEP_COUNT) * 100}% + ${5 + activeIndex * 5.5}px)`,
                width: `calc(${100 / STEP_COUNT}% - ${5 + 11 * (STEP_COUNT - 1) / STEP_COUNT}px)`,
                background: '#2F6DFB',
                borderRadius: 5,
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
              }}
            />
            {CAMPAIGN_STEPS.map((step) => {
              const isActive = currentStep === step.key
              const isDisabledStep = isGuestMode && step.key !== 'content'
              const pill = (
                <div
                  key={step.key}
                  onClick={isDisabledStep ? undefined : () => onStepChange(step.key)}
                  style={{
                    position: 'relative',
                    flex: 1,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 5,
                    color: isActive ? '#FAFAFA' : '#1C1D1F',
                    opacity: isDisabledStep ? 0.3 : isActive ? 1 : 0.5,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: isDisabledStep ? 'not-allowed' : 'pointer',
                    transition: 'color 0.3s, opacity 0.3s',
                    userSelect: 'none',
                    zIndex: 1,
                  }}
                >
                  {step.label}
                </div>
              )
              return isDisabledStep ? (
                <Tooltip key={step.key} title="Sign up to access campaign settings">
                  {pill}
                </Tooltip>
              ) : pill
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        height: 60,
        background: '#FAFAFA',
        borderBottom: '1px solid #EAEAEC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: Title */}
      <div style={{ fontWeight: 700, fontSize: 20, color: '#1C1D1F', minWidth: 180 }}>
        {title}
      </div>

      {/* Center: Step pills — hidden in edit mode */}
      {isEditMode ? (
        <div style={{ width: 350 }} />
      ) : (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            gap: 11,
            width: 350,
            height: 40,
            background: '#F4F4F5',
            border: '1px solid #E4E4E4',
            borderRadius: 10,
          }}
        >
          {/* Sliding indicator */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: activeIndex === 0
                ? 4
                : `calc(${(activeIndex / STEP_COUNT) * 100}% + ${4 + activeIndex * 5.5}px)`,
              width: `calc(${100 / STEP_COUNT}% - ${4 + 11 * (STEP_COUNT - 1) / STEP_COUNT}px)`,
              background: '#2F6DFB',
              borderRadius: 5,
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
            }}
          />
          {CAMPAIGN_STEPS.map((step) => {
            const isActive = currentStep === step.key
            const isDisabledStep = isGuestMode && step.key !== 'content'
            const pill = (
              <div
                key={step.key}
                onClick={isDisabledStep ? undefined : () => onStepChange(step.key)}
                style={{
                  position: 'relative',
                  flex: 1,
                  alignSelf: 'stretch',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                  color: isActive ? '#FAFAFA' : '#1C1D1F',
                  opacity: isDisabledStep ? 0.3 : isActive ? 1 : 0.5,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isDisabledStep ? 'not-allowed' : 'pointer',
                  transition: 'color 0.3s, opacity 0.3s',
                  userSelect: 'none',
                  zIndex: 1,
                }}
              >
                {step.label}
              </div>
            )
            return isDisabledStep ? (
              <Tooltip key={step.key} title="Sign up to access campaign settings">
                {pill}
              </Tooltip>
            ) : pill
          })}
        </div>
      )}

      {/* Right: Action button */}
      <div style={{ minWidth: 180, display: 'flex', justifyContent: 'flex-end' }}>
        {(!isGuestMode && (isSettingsStep || isEditMode)) ? (
          <Button
            icon={<SaveOutlined />}
            onClick={onSaveDraft}
            loading={isSaving}
            disabled={saveDraftDisabled}
            style={{
              height: 40,
              borderRadius: 10,
              fontWeight: 600,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            {saveLabel}
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={onContinue}
            disabled={continueDisabled}
            style={{
              height: 40,
              borderRadius: 10,
              fontWeight: 600,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            Continue <ArrowRightOutlined />
          </Button>
        )}
      </div>
    </div>
  )
}
