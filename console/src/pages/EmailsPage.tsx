import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Typography,
  Button,
  Table,
  Tooltip,
  Space,
  Modal,
  message,
  Select,
  TableColumnType,
  Spin
} from 'antd'
import { useParams, useNavigate } from '@tanstack/react-router'
import { templatesApi } from '../services/api/template'
import type { Template, Workspace } from '../services/api/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPenToSquare,
  faEye,
  faTrashCan,
  faPaperPlane,
  faCopy
} from '@fortawesome/free-regular-svg-icons'
import { EmptyState, EnvelopeIcon, PaginationFooter } from '../components/common'
import { PlusOutlined } from '@ant-design/icons'
import { useAuth, useWorkspacePermissions } from '../contexts/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import dayjs from '../lib/dayjs'
import TemplatePreviewDrawer from '../components/templates/TemplatePreviewDrawer'
import SendTemplateModal from '../components/templates/SendTemplateModal'

const { Text } = Typography

type SortOrder = 'newest' | 'oldest'

export function EmailsPage() {
  const { workspaceId } = useParams({ from: '/workspace/$workspaceId/templates' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { workspaces } = useAuth()
  const { permissions } = useWorkspacePermissions(workspaceId)
  const workspace = useMemo<Workspace | null>(
    () => workspaces.find((w) => w.id === workspaceId) ?? null,
    [workspaces, workspaceId]
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [templateToTest, setTemplateToTest] = useState<Template | null>(null)
  const isMobile = useIsMobile()

  const { data, isLoading } = useQuery({
    queryKey: ['templates', workspaceId],
    queryFn: () =>
      templatesApi.list({
        workspace_id: workspaceId,
        channel: 'email'
      })
  })

  const deleteMutation = useMutation({
    mutationFn: templatesApi.delete,
    onSuccess: () => {
      message.success('Template deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['templates', workspaceId] })
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error.message
      message.error(`Failed to delete template: ${errorMsg}`)
    }
  })

  const handleDelete = (templateId: string) => {
    deleteMutation.mutate({ workspace_id: workspaceId!, id: templateId })
  }

  const handleCloneTemplate = async (templateId: string) => {
    try {
      await templatesApi.clone({ workspace_id: workspaceId, id: templateId })
      queryClient.invalidateQueries({ queryKey: ['templates', workspaceId] })
    } catch (error) {
      console.error('Failed to clone template:', error)
    }
  }

  const handleTestTemplate = (template: Template) => {
    setTemplateToTest(template)
    setTestModalOpen(true)
  }

  const handleEdit = (templateId: string) => {
    navigate({
      to: '/workspace/$workspaceId/campaign/$templateId/edit',
      params: { workspaceId, templateId }
    })
  }

  const handleCreate = () => {
    navigate({
      to: '/workspace/$workspaceId/create',
      params: { workspaceId }
    })
  }

  // Sort and paginate templates client-side
  const templates = data?.templates
  const sortedTemplates = useMemo(() => {
    if (!templates) return []
    return [...templates].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [templates, sortOrder])

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedTemplates.slice(start, start + pageSize)
  }, [sortedTemplates, currentPage, pageSize])

  const hasTemplates = !isLoading && sortedTemplates.length > 0
  const isTrulyEmpty = !isLoading && (!data?.templates || data.templates.length === 0)

  if (!workspace) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="small" /></div>
  }

  const columns: TableColumnType<Template>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Subject line',
      dataIndex: ['email', 'subject'],
      key: 'subject',
      render: (subject: string, record: Template) => (
        <div>
          <Text strong>{subject}</Text>
          {record.email?.subject_preview && (
            <div>
              <Text type="secondary" className="text-xs">
                {record.email.subject_preview}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Tooltip
          title={
            dayjs(date).tz(workspace?.settings.timezone).format('llll') +
            ' in ' +
            workspace?.settings.timezone
          }
        >
          <span>{dayjs(date).format('ll')}</span>
        </Tooltip>
      )
    },
    {
      title: '',
      key: 'actions',
      align: 'right' as const,
      width: 180,
      render: (_: any, record: Template) => (
        <Space>
          {workspace && (
            <Tooltip
              title={
                !permissions?.templates?.write
                  ? "You don't have write permission for emails"
                  : 'Edit Email'
              }
            >
              <Button
                type="text"
                size="small"
                icon={<FontAwesomeIcon icon={faPenToSquare} style={{ opacity: 0.7 }} />}
                disabled={!permissions?.templates?.write}
                onClick={() => handleEdit(record.id)}
              />
            </Tooltip>
          )}
          {workspace && (
            <Tooltip
              title={
                !permissions?.templates?.write
                  ? "You don't have write permission for emails"
                  : 'Clone Email'
              }
            >
              <div>
                <Button
                  type="text"
                  icon={<FontAwesomeIcon icon={faCopy} style={{ opacity: 0.7 }} />}
                  disabled={!permissions?.templates?.write || !!record.integration_id}
                  onClick={() => {
                    handleCloneTemplate(record.id)
                  }}
                />
              </div>
            </Tooltip>
          )}
          <Tooltip
            title={
              record.integration_id
                ? `This email is managed by an integration and cannot be deleted`
                : !permissions?.templates?.write
                  ? "You don't have write permission for emails"
                  : 'Delete Email'
            }
          >
            <Button
              type="text"
              icon={<FontAwesomeIcon icon={faTrashCan} style={{ opacity: 0.7 }} />}
              loading={deleteMutation.isPending}
              disabled={!permissions?.templates?.write || !!record.integration_id}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete email?',
                  content: (
                    <div>
                      <p>Are you sure you want to delete this email?</p>
                      <p className="mt-2 text-gray-600">
                        Note: The email will be hidden from your workspace but preserved to
                        maintain the ability to preview previously sent broadcasts and messages that
                        used this email.
                      </p>
                    </div>
                  ),
                  okText: 'Yes, Delete',
                  okType: 'danger',
                  cancelText: 'Cancel',
                  onOk: () => handleDelete(record.id)
                })
              }}
            />
          </Tooltip>
          <Tooltip
            title={
              !(permissions?.templates?.read && permissions?.contacts?.write)
                ? 'You need read template and write contact permissions to send test emails'
                : 'Send Email'
            }
          >
            <Button
              type="text"
              icon={<FontAwesomeIcon icon={faPaperPlane} style={{ opacity: 0.7 }} />}
              onClick={() => handleTestTemplate(record)}
              disabled={!(permissions?.templates?.read && permissions?.contacts?.write)}
            />
          </Tooltip>
          <Tooltip title="Preview Email">
            <>
              <TemplatePreviewDrawer record={record} workspace={workspace}>
                <Button
                  type="text"
                  icon={<FontAwesomeIcon icon={faEye} style={{ opacity: 0.7 }} />}
                />
              </TemplatePreviewDrawer>
            </>
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div className="flex flex-col" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
      {/* Desktop Header */}
      {!isMobile && (
        <div
          className="flex justify-between items-center px-5 shrink-0"
          style={{
            height: '60px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #EAEAEC'
          }}
        >
          <h1
            className="text-2xl font-semibold"
            style={{ color: '#1C1D1F', marginBottom: 0 }}
          >
            My Emails
          </h1>
          <Select
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value)
              setCurrentPage(1)
            }}
            style={{ width: 170 }}
            options={[
              { label: 'Newest on top', value: 'newest' },
              { label: 'Oldest on top', value: 'oldest' }
            ]}
          />
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #EAEAEC',
          }}
        >
          <Select
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value)
              setCurrentPage(1)
            }}
            style={{ width: 150 }}
            size="small"
            options={[
              { label: 'Newest on top', value: 'newest' },
              { label: 'Oldest on top', value: 'oldest' }
            ]}
          />
        </div>
      )}

      {/* Content */}
      {isTrulyEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <EmptyState
            icon={<EnvelopeIcon />}
            title="No Emails Created Yet"
            action={
              <Tooltip
                title={
                  !permissions?.templates?.write
                    ? "You don't have write permission for emails"
                    : undefined
                }
              >
                <div>
                  <Button
                    type="primary"
                    size="large"
                    disabled={!permissions?.templates?.write}
                    style={{ borderRadius: '10px' }}
                    onClick={handleCreate}
                  >
                    <PlusOutlined /> Create Email
                  </Button>
                </div>
              </Tooltip>
            }
          />
        </div>
      ) : isMobile ? (
        <div className="flex-1 overflow-auto" style={{ padding: '12px 16px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="small" /></div>
          ) : hasTemplates ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paginatedTemplates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    backgroundColor: '#FAFAFA',
                    borderRadius: 12,
                    padding: '12px 14px',
                    border: '1px solid #F0F0F0',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1D1F' }}>
                    {template.name}
                  </div>
                  {template.email?.subject && (
                    <div style={{ fontSize: 13, color: 'rgba(28,29,31,0.6)', marginTop: 2 }}>
                      {template.email.subject}
                    </div>
                  )}
                  {template.email?.subject_preview && (
                    <div style={{ fontSize: 12, color: 'rgba(28,29,31,0.4)', marginTop: 1 }}>
                      {template.email.subject_preview}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, borderTop: '1px solid #F0F0F0', paddingTop: 8 }}>
                    <div style={{ fontSize: 12, color: 'rgba(28,29,31,0.4)' }}>
                      {dayjs(template.created_at).format('ll')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<FontAwesomeIcon icon={faPenToSquare} style={{ opacity: 0.7 }} />}
                        disabled={!permissions?.templates?.write}
                        onClick={() => handleEdit(template.id)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<FontAwesomeIcon icon={faCopy} style={{ opacity: 0.7 }} />}
                        disabled={!permissions?.templates?.write}
                        onClick={() => handleCloneTemplate(template.id)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<FontAwesomeIcon icon={faTrashCan} style={{ opacity: 0.7 }} />}
                        loading={deleteMutation.isPending}
                        disabled={!permissions?.templates?.write || !!template.integration_id}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Delete template?',
                            content: (
                              <div>
                                <p>Are you sure you want to delete this email?</p>
                                <p className="mt-2 text-gray-600">
                                  Note: The email will be hidden from your workspace but preserved to
                                  maintain the ability to preview previously sent broadcasts and messages that
                                  used this email.
                                </p>
                              </div>
                            ),
                            okText: 'Yes, Delete',
                            okType: 'danger',
                            cancelText: 'Cancel',
                            onOk: () => handleDelete(template.id)
                          })
                        }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<FontAwesomeIcon icon={faPaperPlane} style={{ opacity: 0.7 }} />}
                        onClick={() => handleTestTemplate(template)}
                        disabled={!(permissions?.templates?.read && permissions?.contacts?.write)}
                      />
                      <TemplatePreviewDrawer record={template} workspace={workspace}>
                        <Button
                          type="text"
                          size="small"
                          icon={<FontAwesomeIcon icon={faEye} style={{ opacity: 0.7 }} />}
                        />
                      </TemplatePreviewDrawer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(28, 29, 31, 0.4)' }}>
              No emails found
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-5 py-6">
          {isLoading ? (
            <Table columns={columns} dataSource={[]} loading={true} rowKey="id" />
          ) : hasTemplates ? (
            <div
              style={{
                backgroundColor: '#FAFAFA',
                borderRadius: '20px',
                padding: '10px',
                overflow: 'hidden',
              }}
            >
              <Table
                className="table-no-cell-border"
                columns={columns}
                dataSource={paginatedTemplates}
                rowKey="id"
                pagination={false}
                rowClassName={(_, index) => (index % 2 === 1 ? 'zebra-row' : '')}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(28, 29, 31, 0.4)' }}>
              No emails found
            </div>
          )}
        </div>
      )}

      {!isTrulyEmpty && (
        <PaginationFooter
          totalItems={sortedTemplates.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
          loading={isLoading}
          emptyLabel="No campaigns"
          isMobile={isMobile}
        />
      )}

      <SendTemplateModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        template={templateToTest}
        workspace={workspace}
      />
    </div>
  )
}
