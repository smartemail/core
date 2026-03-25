import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Tag,
  message
} from 'antd'
import React, { useMemo, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { TreeNodeInput, HasLeaf } from './input'
import { useQuery } from '@tanstack/react-query'
import { listsApi } from '../../services/api/list'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark, faCircleCheck } from '@fortawesome/free-regular-svg-icons'
import {
  Segment,
  createSegment,
  updateSegment,
  CreateSegmentRequest,
  UpdateSegmentRequest,
} from '../../services/api/segment'
import { TIMEZONE_OPTIONS } from '../../lib/timezones'
import { TableSchemas } from './table_schemas'
import { useIsMobile } from '../../hooks/useIsMobile'

// Helper function to check if a tree contains relative date filters
const treeHasRelativeDates = (tree: any): boolean => {
  if (!tree) return false

  if (tree.kind === 'branch') {
    // Check all child leaves recursively
    if (tree.branch?.leaves) {
      return tree.branch.leaves.some((leaf: any) => treeHasRelativeDates(leaf))
    }
    return false
  }

  if (tree.kind === 'leaf') {
    // Check contact timeline conditions for relative date operators
    if (tree.leaf?.contact_timeline) {
      if (tree.leaf.contact_timeline.timeframe_operator === 'in_the_last_days') {
        return true
      }
    }
    // Check contact property filters for relative date operators
    if (tree.leaf?.contact?.filters) {
      const hasRelativeDateFilter = tree.leaf.contact.filters.some(
        (filter: any) => filter.operator === 'in_the_last_days'
      )
      if (hasRelativeDateFilter) {
        return true
      }
    }
    return false
  }

  return false
}

const ButtonUpsertSegment = (props: {
  segment?: Segment
  btnType?: 'primary' | 'default' | 'dashed' | 'link' | 'text' | undefined
  btnSize?: 'small' | 'middle' | 'large' | undefined
  totalContacts?: number
  onSuccess?: () => void
  children?: React.ReactNode
}) => {
  const [drawserVisible, setDrawserVisible] = useState(false)

  // but the drawer in a separate component to make sure the
  // form is reset when the drawer is closed
  return (
    <>
      {props.children ? (
        <span onClick={() => setDrawserVisible(!drawserVisible)}>{props.children}</span>
      ) : (
        <Button
          type={props.btnType || 'primary'}
          size={props.btnSize || 'small'}
          ghost
          icon={!props.segment ? <FontAwesomeIcon icon={faPlus} /> : undefined}
          onClick={() => setDrawserVisible(!drawserVisible)}
        >
          {props.segment ? 'Edit segment' : 'New Segment'}
        </Button>
      )}
      {drawserVisible && (
        <DrawerSegment
          segment={props.segment}
          totalContacts={props.totalContacts}
          setDrawserVisible={setDrawserVisible}
          onSuccess={props.onSuccess}
        />
      )}
    </>
  )
}

const COLOR_OPTIONS = [
  { label: <Tag bordered={false} color="magenta">magenta</Tag>, value: 'magenta' },
  { label: <Tag bordered={false} color="red">red</Tag>, value: 'red' },
  { label: <Tag bordered={false} color="volcano">volcano</Tag>, value: 'volcano' },
  { label: <Tag bordered={false} color="orange">orange</Tag>, value: 'orange' },
  { label: <Tag bordered={false} color="gold">gold</Tag>, value: 'gold' },
  { label: <Tag bordered={false} color="lime">lime</Tag>, value: 'lime' },
  { label: <Tag bordered={false} color="green">green</Tag>, value: 'green' },
  { label: <Tag bordered={false} color="cyan">cyan</Tag>, value: 'cyan' },
  { label: <Tag bordered={false} color="blue">blue</Tag>, value: 'blue' },
  { label: <Tag bordered={false} color="geekblue">geekblue</Tag>, value: 'geekblue' },
  { label: <Tag bordered={false} color="purple">purple</Tag>, value: 'purple' },
  { label: <Tag bordered={false} color="grey">grey</Tag>, value: 'grey' },
]

const labelStyle = { color: '#1C1D1F', fontWeight: 700, fontSize: 16, lineHeight: '150%' }

const DrawerSegment = (props: {
  segment?: Segment
  totalContacts?: number
  setDrawserVisible: any
  onSuccess?: () => void
}) => {
  const { workspaceId } = useParams({ from: '/workspace/$workspaceId' })
  const { workspaces } = useAuth()
  const isMobile = useIsMobile()
  const workspace = useMemo(() => {
    if (!workspaceId || workspaces.length === 0) return null
    return workspaces.find((w) => w.id === workspaceId) || null
  }, [workspaceId, workspaces])
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Fetch lists for the current workspace
  const { data: listsData } = useQuery({
    queryKey: ['lists', workspaceId],
    queryFn: () => listsApi.list({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  })

  const lists = listsData?.lists || []

  const initialValues = Object.assign(
    {
      color: 'blue',
      timezone: workspace?.settings.timezone || 'UTC',
      tree: {
        kind: 'branch',
        branch: {
          operator: 'and',
          leaves: []
        }
      }
    },
    props.segment
  )

  const onFinish = async (values: any) => {
    if (loading || !workspaceId) return

    setLoading(true)

    try {
      if (props.segment) {
        const requestData: UpdateSegmentRequest = {
          workspace_id: workspaceId,
          id: props.segment.id,
          name: values.name,
          color: values.color,
          tree: values.tree,
          timezone: values.timezone
        }
        await updateSegment(requestData)
        message.success('The segment has been updated!')
      } else {
        const generatedId = values.name
          .toLowerCase()
          .replace(/[\s-]+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
          .replace(/^_+|_+$/g, '')
          .replace(/_+/g, '_')

        const requestData: CreateSegmentRequest = {
          workspace_id: workspaceId,
          id: generatedId,
          name: values.name,
          color: values.color,
          tree: values.tree,
          timezone: values.timezone
        }
        await createSegment(requestData)
        message.success('The segment has been created!')
      }

      form.resetFields()
      setLoading(false)

      if (props.onSuccess) {
        props.onSuccess()
      }

      props.setDrawserVisible(false)
    } catch (error) {
      console.error('Segment operation error:', error)
      message.error(`Failed to ${props.segment ? 'update' : 'create'} segment`)
      setLoading(false)
    }
  }

  const schemas = useMemo(() => {
    return {
      contacts: TableSchemas.contacts,
      contact_lists: TableSchemas.contact_lists,
      contact_timeline: TableSchemas.contact_timeline
    }
  }, [])

  return (
    <Drawer
      title={<span style={{ fontSize: 20, fontWeight: 700 }}>{props.segment ? 'Update Segment' : 'New Segment'}</span>}
      open={true}
      width={isMobile ? '100%' : 480}
      onClose={() => props.setDrawserVisible(false)}
      styles={{
        header: { borderBottom: '1px solid #EAEAEC' },
        body: { padding: '24px', paddingBottom: 100 },
        footer: { borderTop: '1px solid #EAEAEC', padding: 16 },
      }}
      footer={
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            size="large"
            onClick={() => props.setDrawserVisible(false)}
            style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: 600 }}
          >
            <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: 18, marginRight: 6 }} />
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={() => form.submit()}
            style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: 600 }}
          >
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 18, marginRight: 6 }} />
            Save
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        name="groupForm"
        onFinish={onFinish}
        requiredMark={false}
      >
        {/* Segment Name */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Segment Name<span style={{ color: '#ff4d4f' }}>*</span></div>
          <Form.Item name="name" rules={[{ required: true, type: 'string', message: 'Please enter a segment name' }]} style={{ marginBottom: 0, marginTop: 8 }}>
            <Input
              placeholder="i.e.: Big spenders..."
              style={{ height: 50, borderRadius: 10, fontSize: 16 }}
            />
          </Form.Item>
        </div>

        {/* Segment Tag Color */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Segment Tag Color<span style={{ color: '#ff4d4f' }}>*</span></div>
          <Form.Item name="color" rules={[{ required: true }]} style={{ marginBottom: 0, marginTop: 8 }}>
            <Select
              style={{ width: '100%' }}
              options={COLOR_OPTIONS}
              className="segment-color-select"
            />
          </Form.Item>
        </div>

        {/* Conditions tree */}
        <Form.Item
          name="tree"
          noStyle
          rules={[
            {
              required: true,
              validator: (_rule, value) => {
                return new Promise((resolve, reject) => {
                  if (HasLeaf(value)) {
                    return resolve(undefined)
                  }
                  return reject(new Error('A tree is required'))
                })
              }
            }
          ]}
        >
          <TreeNodeInput
            schemas={schemas}
            lists={lists}
            customFieldLabels={workspace?.settings?.custom_field_labels}
          />
        </Form.Item>

        {/* Alert for segments with relative date filters */}
        <Form.Item noStyle dependencies={['tree', 'timezone']}>
          {() => {
            const values = form.getFieldsValue()
            const hasRelativeDates = treeHasRelativeDates(values.tree)
            const timezone = values.timezone || workspace?.settings.timezone || 'UTC'

            if (hasRelativeDates) {
              return (
                <Alert
                  type="info"
                  showIcon
                  message={`This segment uses relative date filters and will be automatically recomputed daily at 5:00 AM (${timezone})`}
                  style={{ marginTop: 16 }}
                />
              )
            }
            return null
          }}
        </Form.Item>

        {/* Hidden timezone field */}
        <Form.Item name="timezone" hidden rules={[{ required: true, type: 'string' }]}>
          <Select options={TIMEZONE_OPTIONS} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default ButtonUpsertSegment
