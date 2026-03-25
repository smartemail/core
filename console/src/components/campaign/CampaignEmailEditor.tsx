import { useCallback } from 'react'
import EmailBuilder from '../email_builder/EmailBuilder'
import type { EmailBlock } from '../email_builder/types'
import { templatesApi } from '../../services/api/template'

interface CampaignEmailEditorProps {
  tree: EmailBlock
  onTreeChange: (tree: EmailBlock) => void
  workspaceId: string
  onClose: () => void
}

export function CampaignEmailEditor({
  tree,
  onTreeChange,
  workspaceId,
  onClose,
}: CampaignEmailEditorProps) {
  const handleCompile = useCallback(
    async (compileTree: EmailBlock, testData?: any) => {
      try {
        const response = await templatesApi.compile({
          workspace_id: workspaceId,
          message_id: 'preview',
          visual_editor_tree: compileTree as any,
          test_data: testData || {},
          channel: 'email',
          tracking_settings: {
            enable_tracking: false,
            workspace_id: workspaceId,
            message_id: 'preview',
          },
        })

        if (response.error) {
           console.error('Compilation error:', response.error)
          return {
            html: '',
            mjml: response.mjml || '',
            errors: [response.error],
          }
        }

        return {
          html: response.html || '',
          mjml: response.mjml || '',
          errors: [],
        }
      } catch (error: any) {
        console.error('Compilation error:', error)
        return {
          html: '',
          mjml: '',
          errors: [{ message: error.message || 'Compilation failed' }],
        }
      }
    },
    [workspaceId]
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#FFFFFF' }}>
      <EmailBuilder
        tree={tree}
        onTreeChange={onTreeChange}
        onCompile={handleCompile}
        testData={{
          contact: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
          },
        }}
        onTestDataChange={() => {}}
        onSaveBlock={() => {}}
        toolbarActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              onClick={onClose}
              style={{
                height: 36,
                borderRadius: 8,
                border: '1px solid #E4E4E4',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: '#1C1D1F',
              }}
            >
              Cancel
            </div>
            <div
              onClick={onClose}
              style={{
                height: 36,
                borderRadius: 8,
                background: '#2F6DFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: '#FFFFFF',
              }}
            >
              Save
            </div>
          </div>
        }
        height="100vh"
      />
    </div>
  )
}
