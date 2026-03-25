import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { App } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, EditOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { CampaignHeader } from '../components/campaign/CampaignHeader'
import { CampaignPreviewPanel } from '../components/campaign/CampaignPreviewPanel'
import { CampaignEmailEditor } from '../components/campaign/CampaignEmailEditor'
import { GeneratingOverlay } from '../components/campaign/GeneratingOverlay'
import { ContentStep } from '../components/campaign/steps/ContentStep'
import { SettingsStep } from '../components/campaign/steps/SettingsStep'
import { SendScheduleModal } from '../components/campaign/modals/SendScheduleModal'
import { AuthGateModal } from '../components/campaign/modals/AuthGateModal'
import { useCampaignWizard } from '../components/campaign/hooks/useCampaignWizard'
import { useEmailPreview } from '../components/campaign/hooks/useEmailPreview'
import { useIsMobile } from '../hooks/useIsMobile'
import { useWindowHeight } from '../hooks/useWindowHeight'
import type { Template, Workspace } from '../services/api/types'

export function CreateCampaignPage() {
  const { workspaceId } = useParams({ from: '/workspace/$workspaceId/create' })
  const { workspaces } = useAuth()
  const workspace = workspaces.find((w) => w.id === workspaceId)

  if (!workspace) {
    return null
  }

  return (
    <App>
      <CampaignPageContent workspace={workspace} />
    </App>
  )
}

export function CampaignPageContent({
  workspace,
  existingTemplate,
  isGuestMode = false,
}: {
  workspace: Workspace
  existingTemplate?: Template
  isGuestMode?: boolean
}) {
  const wizard = useCampaignWizard(workspace, existingTemplate, isGuestMode)
  const isMobile = useIsMobile()
  const windowHeight = useWindowHeight()
  const [mobileShowForm, setMobileShowForm] = useState(false)
  const isEditMode = !!existingTemplate

  // Auto-compile preview when tree changes
  useEmailPreview({
    visualEditorTree: wizard.visualEditorTree,
    workspaceId: workspace.id,
    onCompiledHtml: wizard.setCompiledHtml,
    onIsCompiling: wizard.setIsCompiling,
  })

  const handleContinue = () => {
    if (isGuestMode) {
      wizard.setShowAuthModal(true)
      return
    }
    if (wizard.validateStep()) {
      setMobileShowForm(false)
      wizard.goNext()
    }
  }

  const handleStepChange = (step: Parameters<typeof wizard.goToStep>[0]) => {
    setMobileShowForm(false)
    wizard.goToStep(step)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? windowHeight - 56 : '100vh',
        background: '#FFFFFF',
      }}
    >
      <CampaignHeader
        currentStep={wizard.currentStep}
        onStepChange={handleStepChange}
        onContinue={handleContinue}
        onSaveDraft={wizard.saveDraft}
        isSaving={wizard.isSaving}
        isMobile={isMobile}
        continueDisabled={!wizard.prompt.trim()}
        saveDraftDisabled={!wizard.isGenerated || !wizard.campaignName.trim() || !wizard.subjectLine.trim()}
        isEditMode={isEditMode}
        isGuestMode={isGuestMode}
      />

      {isMobile ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {!isEditMode && wizard.currentStep === 'content' && (
            wizard.isGenerated && !mobileShowForm ? (
              <>
                {/* Full-width email preview */}
                <CampaignPreviewPanel
                  compiledHtml={wizard.compiledHtml}
                  previewMode="mobile"
                  onPreviewModeChange={wizard.setPreviewMode}
                  isGenerated={wizard.isGenerated}
                  isGenerating={wizard.isGenerating}
                  isMobile={true}
                  onEdit={() => wizard.setIsEditing(true)}
                />
                {/* Sticky bottom bar: Back + Edit + Continue */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    borderTop: '1px solid #E4E4E4',
                    background: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  <div
                    onClick={() => setMobileShowForm(true)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: '1px solid #E4E4E4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowLeftOutlined style={{ fontSize: 16, color: '#1C1D1F' }} />
                  </div>
                  <div
                    onClick={() => wizard.setIsEditing(true)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: '1px solid #E4E4E4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <EditOutlined style={{ fontSize: 16, color: '#1C1D1F' }} />
                  </div>
                  <div
                    onClick={handleContinue}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 10,
                      background: '#2F6DFB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA' }}>Continue</span>
                    <ArrowRightOutlined style={{ fontSize: 14, color: '#FAFAFA' }} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <ContentStep wizard={wizard} />
                {wizard.isGenerating && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                    <GeneratingOverlay isGenerating={wizard.isGenerating} />
                  </div>
                )}
              </div>
            )
          )}
          {(isEditMode || wizard.currentStep === 'settings') && (
            <SettingsStep
              wizard={wizard}
              workspace={workspace}
              isMobile={true}
              onBack={isEditMode ? undefined : () => { setMobileShowForm(false); wizard.goPrevious() }}
              onSaveDraft={wizard.saveDraft}
              isSaving={wizard.isSaving}
              saveDraftDisabled={!wizard.isGenerated || !wizard.campaignName.trim() || !wizard.subjectLine.trim()}
              isEditMode={isEditMode}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left panel - 400px */}
          <div
            style={{
              width: 440,
              minWidth: 440,
              borderRight: '1px solid #E4E4E4',
              background: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!isEditMode && wizard.currentStep === 'content' && <ContentStep wizard={wizard} />}
            {(isEditMode || wizard.currentStep === 'settings') && <SettingsStep wizard={wizard} workspace={workspace} isEditMode={isEditMode} />}
          </div>

          {/* Right panel - Preview */}
          <CampaignPreviewPanel
            compiledHtml={wizard.compiledHtml}
            previewMode={wizard.previewMode}
            onPreviewModeChange={wizard.setPreviewMode}
            isGenerated={wizard.isGenerated}
            isGenerating={wizard.isGenerating}
            onEdit={() => wizard.setIsEditing(true)}
          />
        </div>
      )}

      {/* Email Editor (full-screen overlay) */}
      {wizard.isEditing && wizard.visualEditorTree && (
        <CampaignEmailEditor
          tree={wizard.visualEditorTree}
          onTreeChange={wizard.setVisualEditorTree}
          workspaceId={workspace.id}
          onClose={() => wizard.setIsEditing(false)}
        />
      )}

      {/* Modals */}
      {isGuestMode ? (
        <AuthGateModal
          open={wizard.showAuthModal}
          onClose={() => wizard.setShowAuthModal(false)}
          prompt={wizard.prompt}
        />
      ) : (
        <>
          <SendScheduleModal
            open={wizard.showSendModal}
            onClose={() => wizard.setShowSendModal(false)}
            onSend={wizard.launch}
            campaignName={wizard.campaignName}
            isSaving={wizard.isSaving}
            scheduleForLater={wizard.scheduleForLater}
            onScheduleForLaterChange={wizard.setScheduleForLater}
            scheduledDate={wizard.scheduledDate}
            onScheduledDateChange={wizard.setScheduledDate}
            scheduledTime={wizard.scheduledTime}
            onScheduledTimeChange={wizard.setScheduledTime}
            creditCost={wizard.creditEstimate.total}
            creditsLeft={wizard.subscription?.credits_left ?? 0}
          />
        </>
      )}
    </div>
  )
}
