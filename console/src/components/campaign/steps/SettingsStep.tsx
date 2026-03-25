import { useEffect } from 'react'
import { Input, Spin, Space, Typography, Button } from 'antd'
import { ArrowLeftOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../contexts/AuthContext'
import { useSubjectEvaluation } from '../hooks/useSubjectEvaluation'
import { SendScheduleButton } from '../sections/SendScheduleButton'
import { AudienceMultiSelect } from '../sections/AudienceMultiSelect'
import { ImportContactsButton } from '../../contacts/ImportContactsButton'
import { ImportGmailContactsButton } from '../../contacts/ImportGmailContactsButton'
import { ContactUpsertDrawer } from '../../contacts/ContactUpsertDrawer'
import type { CampaignWizardReturn } from '../hooks/useCampaignWizard'
import type { Workspace } from '../../../services/api/types'

const { Text } = Typography

interface SettingsStepProps {
  wizard: CampaignWizardReturn
  workspace: Workspace
  isMobile?: boolean
  onBack?: () => void
  onSaveDraft?: () => void
  isSaving?: boolean
  saveDraftDisabled?: boolean
  isEditMode?: boolean
}

// Hidden for now
// function RegenerateLink({ onClick }: { onClick: () => void }) {
//   return (
//     <div
//       onClick={onClick}
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: 5,
//         cursor: 'pointer',
//         userSelect: 'none',
//       }}
//     >
//       <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path
//           d="M13.333 6.667A5.333 5.333 0 0 0 3.053 4.72M2.667 2.667v2.054h2.053M2.667 9.333a5.333 5.333 0 0 0 10.28 1.947m.386 2.053V11.28h-2.054"
//           stroke="#2F6DFB"
//           strokeWidth="1.2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//       <span style={{ fontSize: 13, fontWeight: 500, color: '#2F6DFB' }}>Re-generate</span>
//     </div>
//   )
// }

export function SettingsStep({ wizard, workspace, isMobile, onBack, onSaveDraft, isSaving, saveDraftDisabled, isEditMode }: SettingsStepProps) {
  const inputFontSize = isMobile ? 16 : 14
  const { score, isEvaluating, evaluate } = useSubjectEvaluation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Re-fetch wizard contacts when React Query cache for contacts/total-contacts is invalidated
  // (e.g. after ImportContactsButton or ImportGmailContactsButton finish importing)
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.action.type === 'invalidate' &&
        Array.isArray(event.query.queryKey) &&
        (event.query.queryKey[0] === 'contacts' || event.query.queryKey[0] === 'total-contacts')
      ) {
        wizard.refreshContacts()
      }
    })
    return unsubscribe
  }, [queryClient, wizard])

  const hasNoContacts = !wizard.contactsLoading && !wizard.segmentsLoading && (wizard.totalContacts ?? 0) === 0

  const creditsLeft = wizard.subscription?.credits_left ?? 0
  const audienceCount = wizard.audience.length === 0
    ? wizard.totalContacts
    : wizard.segments
        .filter((s) => wizard.audience.includes(s.id))
        .reduce((sum, s) => sum + (s.users_count ?? 0), 0)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Campaign Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F', padding: '0 10px' }}>
              Campaign Name<span style={{ color: '#FB2F4A' }}>*</span>
            </Text>
            <Text style={{ fontSize: 14, color: '#1C1D1F', opacity: 0.3, lineHeight: 1.3, padding: '0 10px' }}>
              This name is for internal use only and won't be displayed within the sent email
            </Text>
            <Input
              value={wizard.campaignName}
              onChange={(e) => wizard.setCampaignName(e.target.value)}
              placeholder="My New Campaign"
              style={{
                height: 50,
                borderRadius: 10,
                background: '#F4F4F5',
                border: '1px solid #E7E7E7',
                padding: '0 20px',
                fontSize: inputFontSize,
              }}
            />
          </div>

          {/* Subject Line */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                Subject Line<span style={{ color: '#FB2F4A' }}>*</span>
              </Text>
              {/* <RegenerateLink onClick={wizard.regenerateSubject} /> */}
            </div>
            <div style={{ position: 'relative' }}>
              <Input.TextArea
                value={wizard.subjectLine}
                onChange={(e) => wizard.setSubjectLine(e.target.value)}
                onBlur={() => {
                  if (score && wizard.subjectLine.trim()) {
                    evaluate(wizard.subjectLine)
                  }
                }}
                placeholder="Enter subject line"
                maxLength={140}
                rows={3}
                style={{
                  borderRadius: 10,
                  resize: 'none',
                  background: '#F4F4F5',
                  border: '1px solid #E7E7E7',
                  padding: 20,
                  fontSize: inputFontSize,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 13,
                  right: 12,
                  fontSize: 12,
                  color: '#1C1D1F',
                  opacity: 0.3,
                }}
              >
                {wizard.subjectLine.length}/140
              </span>
            </div>
          </div>

          {/* Subject Evaluation */}
          <div>
            {score && (
              <div
                style={{
                  background: '#FAFAFA',
                  border: '1px solid #E4E4E4',
                  borderRadius: 10,
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* Grade circle — 3-layer ring */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: score.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: '#FAFAFA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        border: `3px solid ${score.color}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 22, color: score.color }}>{score.grade}</span>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 600, fontSize: 15, color: '#1C1D1F' }}>{score.points} Points</Text>
                  {/* Progress bar — 5px track, 3px fill */}
                  <div
                    style={{
                      marginTop: 6,
                      height: 5,
                      borderRadius: 2.5,
                      background: '#E4E4E4',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 1,
                        left: 1,
                        height: 3,
                        width: `calc(${score.progressPercent}% - 2px)`,
                        borderRadius: 1.5,
                        background: score.color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <Text style={{ fontSize: 13, color: '#1C1D1F', opacity: 0.3, marginTop: 4, display: 'block' }}>
                    {score.message}
                  </Text>
                </div>
              </div>
            )}
            <div
              style={{
                background: '#F4F4F5',
                borderRadius: 15,
                padding: '10px 10px 10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: score ? 10 : 0,
              }}
            >
              <Text style={{ fontSize: 13, color: '#1C1D1F', opacity: 0.3 }}>
                {score ? 'Re-evaluate your subject line.' : 'Finish editing the subject line to get a score.'}
              </Text>
              <Button
                type="primary"
                size="small"
                onClick={() => evaluate(wizard.subjectLine)}
                loading={isEvaluating}
                disabled={!wizard.subjectLine.trim()}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  height: 32,
                  padding: '0 16px',
                }}
              >
                Evaluate
              </Button>
            </div>
          </div>

          {/* Subject Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>
                Subject Preview<span style={{ color: '#FB2F4A' }}>*</span>
              </Text>
              {/* <RegenerateLink onClick={wizard.regeneratePreview} /> */}
            </div>
            <div style={{ position: 'relative' }}>
              <Input.TextArea
                value={wizard.subjectPreview}
                onChange={(e) => wizard.setSubjectPreview(e.target.value)}
                placeholder="Enter subject preview"
                maxLength={140}
                rows={3}
                style={{
                  borderRadius: 10,
                  resize: 'none',
                  background: '#F4F4F5',
                  border: '1px solid #E7E7E7',
                  padding: 20,
                  fontSize: inputFontSize,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 13,
                  right: 12,
                  fontSize: 12,
                  color: '#1C1D1F',
                  opacity: 0.3,
                }}
              >
                {wizard.subjectPreview.length}/140
              </span>
            </div>
          </div>

          {/* Audience */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F', padding: '0 10px' }}>
              Audience<span style={{ color: '#FB2F4A' }}>*</span>
            </Text>
            {(wizard.contactsLoading || wizard.segmentsLoading) ? (
              <div style={{ padding: 12, textAlign: 'center' }}>
                <Spin size="small" />
              </div>
            ) : hasNoContacts ? (
              <div
                style={{
                  background: '#F4F4F5',
                  borderRadius: 10,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: 13, color: '#1C1D1F', opacity: 0.4 }}>
                  No contacts yet. Add contacts to send your campaign.
                </Text>
                <Space size={8}>
                  <ImportContactsButton
                    workspaceId={wizard.workspaceId}
                    // size="small"
                    iconOnly
                  />
                  {user?.registration_type === 'gmail' && (
                    <ImportGmailContactsButton
                      workspaceId={wizard.workspaceId}
                      // size="small"
                      iconOnly
                    />
                  )}
                  <ContactUpsertDrawer
                    workspace={workspace}
                    onSuccess={() => {
                      wizard.refreshContacts()
                    }}
                    buttonProps={{
                      // size: 'small',
                      buttonContent: <><PlusOutlined /> Add</>,
                      type: 'primary',
                      style: { borderRadius: 8 },
                    }}
                  />
                </Space>
              </div>
            ) : (
              <AudienceMultiSelect
                segments={wizard.segments}
                selectedSegmentIds={wizard.audience}
                onChange={wizard.setAudience}
                totalContacts={wizard.totalContacts}
                fontSize={inputFontSize}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom: Send or Schedule button */}
      <div style={{ padding: 10 }}>
        <SendScheduleButton
          onClick={() => wizard.setShowSendModal(true)}
          audienceCount={audienceCount}
          creditsLeft={creditsLeft}
          disabled={!wizard.isGenerated}
        />

        {/* Mobile: Back + Save row */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
            }}
          >
            {onBack && (
              <div
                onClick={onBack}
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
            )}
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
            <Button
              icon={<SaveOutlined />}
              onClick={onSaveDraft}
              loading={isSaving}
              disabled={saveDraftDisabled}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {isEditMode ? 'Save' : 'Save Draft'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
