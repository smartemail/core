import React, { useState, useEffect } from 'react'
import { Input, Drawer, List, Empty, Spin, Button } from 'antd'
import { EyeOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { templatesApi } from '../../services/api/template'
import type { Template, Workspace } from '../../services/api/types'
import TemplatePreviewPopover from './TemplatePreviewDrawer'
import { useAuth } from '../../contexts/AuthContext'

interface TemplateSelectorInputProps {
  value?: string | null
  onChange?: (value: string | null) => void
  workspaceId: string
  category?:
    | 'marketing'
    | 'transactional'
    | 'welcome'
    | 'opt_in'
    | 'unsubscribe'
    | 'bounce'
    | 'blocklist'
    | 'other'
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
}

const TemplateSelectorInput: React.FC<TemplateSelectorInputProps> = ({
  value,
  onChange,
  workspaceId,
  category,
  placeholder = 'Select a template',
  clearable = true,
  disabled = false
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { workspaces } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Find the current workspace from the workspaces array
  const currentWorkspace = workspaces.find((workspace) => workspace.id === workspaceId)

  // Fetch templates with optional category filter
  const {
    data: templatesResponse,
    isLoading,
  } = useQuery({
    queryKey: ['templates', workspaceId, category],
    queryFn: async () => {
      const response = await templatesApi.list({
        workspace_id: workspaceId,
        category: category,
        channel: 'email'
      })
      return response
    },
    enabled: !!workspaceId
  })

  // Fetch selected template details if we only have the ID
  useEffect(() => {
    if (value && workspaceId && !selectedTemplate) {
      templatesApi
        .get({ workspace_id: workspaceId, id: value })
        .then((response) => {
          if (response.template) {
            setSelectedTemplate(response.template)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch template details:', error)
        })
    }
  }, [value, workspaceId, selectedTemplate])

  // Get templates array from response
  const templates = templatesResponse?.templates || []

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template)
    onChange?.(template.id)
    setOpen(false)
  }

  const showDrawer = () => {
    if (!disabled) {
      setOpen(true)
    }
  }

  const onClose = () => {
    setOpen(false)
    setSearchQuery('')
  }

  const handleCreate = () => {
    navigate({
      to: '/workspace/$workspaceId/create',
      params: { workspaceId }
    })
  }

  const handleCloneTemplate = async (templateId: string) => {
    try {
      await templatesApi.clone({ workspace_id: workspaceId, id: templateId })
      queryClient.invalidateQueries({ queryKey: ['templates', workspaceId, category] })
    } catch (error) {
      console.error('Failed to clone template:', error)
    }
  }

  if (!currentWorkspace) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="small" /></div>
  }

  return (
    <>
      <Input
        value={selectedTemplate?.name || ''}
        placeholder={placeholder}
        readOnly={!clearable}
        disabled={disabled}
        onClick={showDrawer}
        onClear={() => {
          setSelectedTemplate(null)
          onChange?.(null)
        }}
        addonAfter={
          selectedTemplate &&
          currentWorkspace && (
            <TemplatePreviewPopover record={selectedTemplate} workspace={currentWorkspace}>
              <EyeOutlined style={{ cursor: 'pointer' }} />
            </TemplatePreviewPopover>
          )
        }
        allowClear={clearable}
      />

      <Drawer
        title="Select Template"
        width={600}
        onClose={onClose}
        open={open}
        styles={{
          body: { paddingBottom: 80 }
        }}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Input
            placeholder="Search templates..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <List
            itemLayout="horizontal"
            bordered
            dataSource={filteredTemplates}
            size="small"
            renderItem={(template) => (
              <List.Item
                actions={[
                  <TemplatePreviewPopover
                    key="preview"
                    record={template}
                    workspace={currentWorkspace as Workspace}
                  >
                    <Button type="text" icon={<EyeOutlined />} />
                  </TemplatePreviewPopover>,
                  <Button
                    key="clone"
                    type="link"
                    onClick={() => handleCloneTemplate(template.id)}
                  >
                    Clone
                  </Button>,
                  <Button key="select" type="link" onClick={() => handleSelect(template)}>
                    Select
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <a onClick={() => handleSelect(template)} style={{ cursor: 'pointer' }}>
                      {template.name}
                    </a>
                  }
                  description={template.category || 'No category'}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={
              category
                ? `No templates found for ${category.replace('_', ' ')} category`
                : 'No templates found'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              {category
                ? `Create New ${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Template`
                : 'Create New Template'}
            </Button>
          </Empty>
        )}
      </Drawer>
    </>
  )
}

export default TemplateSelectorInput
