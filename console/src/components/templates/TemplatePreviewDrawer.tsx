import React, { useState, useEffect } from 'react'
import { Drawer, Spin, Alert, Tag, Space, Button, ConfigProvider } from 'antd'
import type { Template, MjmlCompileError, Workspace } from '../../services/api/types'
import { templatesApi } from '../../services/api/template'
import type { EmailBlock } from '../email_builder/types'
import { Highlight, themes } from 'prism-react-renderer'
import { Liquid } from 'liquidjs'
import type { MessageHistory } from '../../services/api/messages_history'

interface TemplatePreviewDrawerProps {
  record: Template
  workspace: Workspace
  templateData?: Record<string, any>
  messageHistory?: MessageHistory
  children: React.ReactNode
}

const TemplatePreviewDrawer: React.FC<TemplatePreviewDrawerProps> = ({
  record,
  workspace,
  templateData,
  messageHistory,
  children
}) => {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewMjml, setPreviewMjml] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mjmlError, setMjmlError] = useState<MjmlCompileError | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [processedSubject, setProcessedSubject] = useState<string | null>(null)

  // Removed usePrismjs hook call

  const fetchPreview = async () => {
    if (!workspace.id || !record.email?.visual_editor_tree) {
      setError('Missing workspace ID or template data.')
      setMjmlError(null)
      setPreviewMjml(null)
      setPreviewHtml(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setMjmlError(null)
    setPreviewHtml(null)
    setPreviewMjml(null)

    try {
      let treeObject: EmailBlock | null = null
      if (record.email?.visual_editor_tree && typeof record.email.visual_editor_tree === 'string') {
        try {
          treeObject = JSON.parse(record.email.visual_editor_tree)
        } catch (parseError) {
          console.error('Failed to parse visual_editor_tree:', parseError)
          setError('Invalid template structure data.')
          setMjmlError(null)
          setPreviewMjml(null)
          setIsLoading(false)
          return
        }
      } else if (record.email?.visual_editor_tree) {
        treeObject = record.email.visual_editor_tree as unknown as EmailBlock
      }

      if (!treeObject) {
        setError('Template structure data is missing or invalid.')
        setMjmlError(null)
        setPreviewMjml(null)
        setIsLoading(false)
        return
      }

      const req = {
        workspace_id: workspace.id,
        message_id: 'preview',
        visual_editor_tree: treeObject as any,
        test_data: templateData || record.test_data || {},
        tracking_settings: {
          enable_tracking: workspace.settings?.email_tracking_enabled || false,
          endpoint: workspace.settings?.custom_endpoint_url || undefined,
          workspace_id: workspace.id,
          message_id: 'preview'
        }
      }

      // console.log('Compile Request:', req)
      const response = await templatesApi.compile(req)
      // console.log('Compile Response:', response)

      if (response.error) {
        setMjmlError(response.error)
        setPreviewMjml(response.mjml)
        setError(null)
        setPreviewHtml(null)
      } else {
        setPreviewHtml(response.html)
        setPreviewMjml(response.mjml)
        setError(null)
        setMjmlError(null)
      }
    } catch (err: any) {
      console.error('Compile Error:', err)
      const errorMsg =
        err.response?.data?.error || err.message || 'Failed to compile template preview.'
      setError(errorMsg)
      setMjmlError(null)
      setPreviewMjml(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && workspace.id) {
      fetchPreview()
    } else if (!isOpen) {
      // Reset state when drawer closes to avoid showing stale data briefly on reopen
      setPreviewHtml(null)
      setPreviewMjml(null)
      setError(null)
      setMjmlError(null)
      setIsLoading(false)

      setProcessedSubject(null)
    }
  }, [isOpen, record.id, record.version, workspace.id]) // Keep original dependencies

  // Process subject with Liquid using provided template data
  useEffect(() => {
    if (!isOpen) return

    const subject = record.email?.subject || ''
    const data = templateData || record.test_data || {}

    try {
      if (subject && (subject.includes('{{') || subject.includes('{%'))) {
        const engine = new Liquid()
        const rendered = engine.parseAndRenderSync(subject, data)
        setProcessedSubject(rendered)
      } else {
        setProcessedSubject(subject)
      }
    } catch (_e) {
      // Fallback to raw subject on any rendering error
      setProcessedSubject(subject)
    }
  }, [isOpen, record.email?.subject, templateData, record.test_data])

  const emailProvider = workspace.integrations?.find(
    (i) =>
      i.id ===
      (record.category === 'marketing'
        ? workspace.settings?.marketing_email_provider_id
        : workspace.settings?.transactional_email_provider_id)
  )?.email_provider

  const defaultSender = emailProvider?.senders.find((s) => s.is_default)
  const templateSender = emailProvider?.senders.find((s) => s.id === record.email?.sender_id)

  // Helper to resolve sender display string
  const getSenderDisplay = () => {
    if (messageHistory?.channel_options?.from_name) {
      const email = templateSender?.email || defaultSender?.email || 'no email'
      return `${messageHistory.channel_options.from_name} <${email}>`
    }
    if (templateSender) {
      return `${templateSender.name} <${templateSender.email}>`
    }
    if (defaultSender) {
      return `${defaultSender.name} <${defaultSender.email}>`
    }
    return 'No default sender configured'
  }

  const drawerContent = (
    <div className="flex flex-col h-full">
      {/* Metadata rows */}
      <div className="flex flex-col gap-1.5 pb-4">
        <MetadataRow label="From:" value={getSenderDisplay()} />

        {(record.email?.reply_to || messageHistory?.channel_options?.reply_to) && (
          <MetadataRow
            label="Reply to:"
            value={messageHistory?.channel_options?.reply_to || record.email?.reply_to || 'Not set'}
          />
        )}

        <MetadataRow
          label="Subject:"
          value={processedSubject ?? record.email?.subject ?? ''}
        />

        {record.email?.subject_preview && (
          <MetadataRow label="Subject preview:" value={record.email.subject_preview} />
        )}

        {/* CC / BCC tags */}
        {messageHistory?.channel_options?.cc && messageHistory.channel_options.cc.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-text-secondary min-w-[120px] shrink-0">CC:</span>
            <Space size={[0, 4]} wrap>
              {messageHistory.channel_options.cc.map((email, idx) => (
                <Tag bordered={false} key={idx} color="blue" className="text-xs">{email}</Tag>
              ))}
            </Space>
          </div>
        )}

        {messageHistory?.channel_options?.bcc && messageHistory.channel_options.bcc.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-text-secondary min-w-[120px] shrink-0">BCC:</span>
            <Space size={[0, 4]} wrap>
              {messageHistory.channel_options.bcc.map((email, idx) => (
                <Tag bordered={false} key={idx} color="purple" className="text-xs">{email}</Tag>
              ))}
            </Space>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border-light" />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-0 pt-4">
        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <Spin size="large" />
          </div>
        )}

        {!isLoading && error && !mjmlError && (
          <div className="p-4">
            <Alert message="Error loading preview" description={error} type="error" showIcon />
          </div>
        )}

        {!isLoading && mjmlError && (
          <div className="p-4 overflow-auto">
            <Alert
              message={`MJML Compilation Error: ${mjmlError.message}`}
              type="error"
              showIcon
              description={
                mjmlError.details && mjmlError.details.length > 0 ? (
                  <ul className="list-disc list-inside mt-2 text-xs">
                    {mjmlError.details.map((detail, index) => (
                      <li key={index}>
                        Line {detail.line} ({detail.tagName}): {detail.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'No specific details provided.'
                )
              }
              className="mb-4"
            />
          </div>
        )}

        {/* HTML Email Preview — shown directly */}
        {!isLoading && previewHtml && (
          <iframe
            srcDoc={previewHtml}
            className="w-full border-0 flex-1"
            style={{ minHeight: '500px', borderRadius: '20px' }}
            title={`Preview of ${record.name}`}
            sandbox="allow-same-origin"
          />
        )}

        {!isLoading && !error && !mjmlError && !previewHtml && !previewMjml && (
          <div className="flex items-center justify-center flex-1 text-text-secondary">
            No preview available or template is empty.
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Drawer
        title={<span style={{ fontSize: '20px', fontWeight: 700 }}>{record.name}</span>}
        placement="right"
        width={500}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        destroyOnClose={true}
        maskClosable={true}
        mask={true}
        keyboard={true}
        forceRender={false}
        closable={false}
        extra={
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  controlHeight: 30,
                  contentFontSize: 20,
                  contentLineHeight: 1,
                  onlyIconSize: 20,
                }
              }
            }}
          >
            <Button
              size="middle"
              color="default"
              variant="filled"
              shape="circle"
              icon={<CloseIcon />}
              onClick={() => setIsOpen(false)}
            />
          </ConfigProvider>
        }
        styles={{
          body: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 55px)', overflow: 'auto', padding: '20px' }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}

/** Custom close icon (24x24) matching ContactDetailsDrawer */
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5L15 15M15 5L5 15" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Simple label–value row used in the metadata header */
const MetadataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-4 text-sm leading-relaxed">
    <span className="text-text-secondary min-w-[120px] shrink-0 font-medium">{label}</span>
    <span className="text-text-primary break-all font-medium">{value}</span>
  </div>
)

const JsonDataViewer = ({ data }: { data: any }) => {
  const prettyJson = JSON.stringify(data, null, 2)

  return (
    <div className="rounded" style={{ maxWidth: '100%' }}>
      <Highlight theme={themes.github} code={prettyJson} language="json">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              margin: '0',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '12px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              wordBreak: 'normal'
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '2em',
                    userSelect: 'none',
                    opacity: 0.3
                  }}
                >
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

const MJMLPreview = ({ previewMjml }: { previewMjml: string }) => {
  return (
    <div className="overflow-auto">
      <Highlight theme={themes.github} code={previewMjml} language="xml">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              fontSize: '12px',
              margin: 0,
              padding: '10px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              wordBreak: 'normal'
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '2em',
                    userSelect: 'none',
                    opacity: 0.3
                  }}
                >
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

export default TemplatePreviewDrawer
