import React, { useState, useEffect } from 'react'
import { Button, Table, Tag, Space, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { contactsApi, Contact, ListContactsRequest } from '../../services/api/contacts'
import { listSegments } from '../../services/api/segment'
import { Workspace } from '../../services/api/types'
import dayjs from '../../lib/dayjs'

interface NewContactsTableProps {
  workspace: Workspace
  isMobile?: boolean
}

export const NewContactsTable: React.FC<NewContactsTableProps> = ({ workspace, isMobile = false }) => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch segments for the current workspace
  const { data: segmentsData } = useQuery({
    queryKey: ['segments', workspace.id],
    queryFn: () => listSegments({ workspace_id: workspace.id, with_count: true })
  })

  const buildParams = (): ListContactsRequest => ({
    workspace_id: workspace.id,
    limit: 5,
    with_contact_lists: true
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = buildParams()
      const response = await contactsApi.list(params)
      setContacts(response.contacts)
    } catch (err) {
      console.error('Failed to fetch new contacts data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch new contacts data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewMore = () => {
    navigate({
      to: '/workspace/$workspaceId/contacts',
      params: { workspaceId: workspace.id }
    })
  }

  useEffect(() => {
    fetchData()
  }, [workspace.id])

  const headerCellStyle = () => ({
    style: { backgroundColor: '#FAFAFA', color: 'rgba(28, 29, 31, 0.5)', fontWeight: 500 }
  })

  const cellStyle = (_: unknown, index?: number) => ({
    style: { backgroundColor: index !== undefined && index % 2 === 1 ? '#f2f2f2' : '#fafafa' }
  })

  const columns: ColumnsType<Contact> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      onHeaderCell: headerCellStyle,
      onCell: cellStyle
    },
    {
      title: 'Name',
      key: 'name',
      onHeaderCell: headerCellStyle,
      onCell: cellStyle,
      render: (_: unknown, record: Contact) => {
        const name = [record.first_name, record.last_name].filter(Boolean).join(' ')
        return name || '-'
      }
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      onHeaderCell: headerCellStyle,
      onCell: cellStyle
    },
    {
      title: 'Segments',
      key: 'segments',
      onHeaderCell: headerCellStyle,
      onCell: cellStyle,
      render: (_: unknown, record: Contact) => (
        <Space direction="vertical" size={2}>
          {record.contact_segments?.map(
            (segment: { segment_id: string; version?: number; matched_at?: string; computed_at?: string }) => {
              const segmentData = segmentsData?.segments?.find((s) => s.id === segment.segment_id)
              const segmentName = segmentData?.name || segment.segment_id
              const segmentColor = segmentData?.color || '#1890ff'

              const matchedDate = segment.matched_at
                ? dayjs(segment.matched_at).tz(workspace.settings.timezone).format('LL - HH:mm')
                : 'Unknown date'

              const tooltipTitle = (
                <>
                  <div>
                    <strong>{segmentName}</strong>
                  </div>
                  <div>Matched on: {matchedDate}</div>
                  {segment.version && <div>Version: {segment.version}</div>}
                  <div>
                    <small>Timezone: {workspace.settings.timezone}</small>
                  </div>
                </>
              )

              return (
                <Tooltip key={segment.segment_id} title={tooltipTitle}>
                  <Tag bordered={false} color={segmentColor} style={{ marginBottom: '2px' }}>
                    {segmentName}
                  </Tag>
                </Tooltip>
              )
            }
          ) || []}
        </Space>
      )
    },
    {
      title: 'Since',
      dataIndex: 'created_at',
      key: 'created_at',
      onHeaderCell: headerCellStyle,
      onCell: cellStyle,
      render: (date: string) => (
        <span
          title={dayjs(date).tz(workspace.settings.timezone).format('lll')}
        >
          {dayjs(date).fromNow()}
        </span>
      )
    }
  ]

  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid #EAEAEC',
        background: '#FAFAFA',
        padding: isMobile ? 14 : 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 12 : 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1D1F' }}>Recent New Contacts</div>
        <Button type="link" size="small" onClick={handleViewMore}>
          View more
        </Button>
      </div>
      {error ? (
        <div className="text-red-500 p-4">
          <p>Error: {error}</p>
        </div>
      ) : (
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
            dataSource={contacts}
            columns={columns}
            rowKey="email"
            pagination={false}
            loading={loading}
            scroll={{ x: 'max-content' }}
            rowClassName={(_, index) => (index % 2 === 1 ? 'zebra-row' : '')}
          />
        </div>
      )}
    </div>
  )
}
