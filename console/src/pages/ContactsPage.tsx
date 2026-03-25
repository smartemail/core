import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Table, Tag, Button, Space, Tooltip, message, Dropdown, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { contactsApi, type Contact, type ListContactsRequest } from '../services/api/contacts'
import { listsApi } from '../services/api/list'
import { listSegments } from '../services/api/segment'
import React from 'react'
import { workspaceContactsRoute } from '../router'
import { Filter } from '../components/filters/Filter'
import { ContactUpsertDrawer } from '../components/contacts/ContactUpsertDrawer'
import { ImportContactsButton } from '../components/contacts/ImportContactsButton'
import { ImportGmailContactsButton } from '../components/contacts/ImportGmailContactsButton'
import { BulkUpdateDrawer } from '../components/contacts/BulkUpdateDrawer'
import { PaginationFooter, EmptyState, ContactsIcon } from '../components/common'
import { CountriesFormOptions } from '../lib/countries_timezones'
import { Languages } from '../lib/languages'
import { FilterField } from '../components/filters/types'
import { ContactColumnsSelector, JsonViewer } from '../components/contacts/ContactColumnsSelector'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faHourglass } from '@fortawesome/free-regular-svg-icons'
import { faCircleCheck, faFaceFrown } from '@fortawesome/free-regular-svg-icons'
import {
  faBan,
  faTriangleExclamation,
  faRefresh,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons'
import { ContactDetailsDrawer } from '../components/contacts/ContactDetailsDrawer'
import { DeleteContactModal } from '../components/contacts/DeleteContactModal'
import { SegmentsFilter } from '../components/contacts/SegmentsFilter'
import dayjs from '../lib/dayjs'
import { useAuth, useWorkspacePermissions } from '../contexts/AuthContext'
import numbro from 'numbro'
import { PlusOutlined } from '@ant-design/icons'
import { getCustomFieldLabel } from '../hooks/useCustomFieldLabel'
import { useIsMobile } from '../hooks/useIsMobile'

const STORAGE_KEY = 'contact_columns_visibility'

const FILTER_FIELDS: FilterField[] = [
  { key: 'email', label: 'Email', type: 'string' as const },
  /*{ key: 'external_id', label: 'External ID', type: 'string' as const },*/
  { key: 'first_name', label: 'First Name', type: 'string' as const },
  { key: 'last_name', label: 'Last Name', type: 'string' as const },
  { key: 'phone', label: 'Phone', type: 'string' as const },
]

const DEFAULT_VISIBLE_COLUMNS = {
  name: true,
  language: false,
  timezone: false,
  country: false,
  lists: false,
  segments: true,
  phone: true,
  city: true,
  address: true,
  job_title: true,
  lifetime_value: false,
  orders_count: false,
  last_order_at: false,
  created_at: false,
  custom_string_1: false,
  custom_string_2: false,
  custom_string_3: false,
  custom_string_4: false,
  custom_string_5: false,
  custom_number_1: false,
  custom_number_2: false,
  custom_number_3: false,
  custom_number_4: false,
  custom_number_5: false,
  custom_datetime_1: false,
  custom_datetime_2: false,
  custom_datetime_3: false,
  custom_datetime_4: false,
  custom_datetime_5: false,
  custom_json_1: false,
  custom_json_2: false,
  custom_json_3: false,
  custom_json_4: false,
  custom_json_5: false
}

export function ContactsPage() {
  const { workspaceId } = useParams({ from: '/workspace/$workspaceId/contacts' })
  const search = useSearch({ from: workspaceContactsRoute.id })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { workspaces, user } = useAuth()
  const { permissions } = useWorkspacePermissions(workspaceId)
  const isMobile = useIsMobile()

  // Get the current workspace timezone
  const currentWorkspace = workspaces.find((workspace) => workspace.id === workspaceId)
  const workspaceTimezone = currentWorkspace?.settings.timezone || 'UTC'

  const [visibleColumns, setVisibleColumns] =
    React.useState<Record<string, boolean>>(DEFAULT_VISIBLE_COLUMNS)

  // Current page contacts (not accumulated)
  const [currentContacts, setCurrentContacts] = React.useState<Contact[]>([])
  // Track current page number
  const [currentPage, setCurrentPage] = React.useState(1)
  // Store cursors for each page (page 1 = undefined, page 2 = cursor from page 1, etc.)
  const [pageCursors, setPageCursors] = React.useState<Map<number, string | undefined>>(
    new Map([[1, undefined]])
  )
  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false)
  const [contactToDelete, setContactToDelete] = React.useState<string | null>(null)
  // Edit drawer state
  const [editDrawerVisible, setEditDrawerVisible] = React.useState(false)
  const [contactToEdit, setContactToEdit] = React.useState<Contact | null>(null)

  // Fetch lists for the current workspace
  const { data: listsData } = useQuery({
    queryKey: ['lists', workspaceId],
    queryFn: () => listsApi.list({ workspace_id: workspaceId })
  })

  // Fetch segments for the current workspace with contact counts
  const { data: segmentsData } = useQuery({
    queryKey: ['segments', workspaceId],
    queryFn: () => listSegments({ workspace_id: workspaceId, with_count: true }),
    refetchInterval: (query) => {
      // Check if any segment is building
      const hasBuilding = query.state.data?.segments?.some(
        (segment: { status?: string }) => segment.status === 'building'
      )
      return hasBuilding ? 15000 : false // 15 seconds if building, otherwise no interval
    }
  })

  // Fetch total contacts count
  const { data: totalContactsData } = useQuery({
    queryKey: ['total-contacts', workspaceId],
    queryFn: () => contactsApi.getTotalContacts({ workspace_id: workspaceId })
  })

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (email: string) =>
      contactsApi.delete({
        workspace_id: workspaceId,
        email: email
      }),
    onSuccess: (_, deletedEmail) => {
      message.success('Contact deleted successfully')
      // Remove the deleted contact from the local state
      setCurrentContacts((prev) => prev.filter((contact) => contact.email !== deletedEmail))
      // Invalidate and refetch the contacts query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] })
      // Invalidate total contacts count
      queryClient.invalidateQueries({ queryKey: ['total-contacts', workspaceId] })
      // Close modal and reset state
      setDeleteModalVisible(false)
      setContactToDelete(null)
    },
    onError: (error: any) => {
      message.error(error?.message || 'Failed to delete contact')
    }
  })

  // Delete modal handlers
  const handleDeleteClick = (email: string) => {
    setContactToDelete(email)
    setDeleteModalVisible(true)
  }

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false)
    setContactToDelete(null)
  }

  const handleDeleteConfirm = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete)
    }
  }

  // Edit drawer handlers
  const handleEditClick = (contact: Contact) => {
    setContactToEdit(contact)
    setEditDrawerVisible(true)
  }

  const handleEditClose = () => {
    setEditDrawerVisible(false)
    setContactToEdit(null)
  }

  const handleContactUpdate = (updatedContact: Contact) => {
    // Update the contact in the currentContacts array
    setCurrentContacts((prev) =>
      prev.map((contact) => (contact.email === updatedContact.email ? updatedContact : contact))
    )
    handleEditClose()
  }

  // Load saved state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      // Merge with defaults to ensure all fields exist
      setVisibleColumns({
        ...DEFAULT_VISIBLE_COLUMNS,
        ...parsedState
      })
    }
  }, [])

  const handleColumnVisibilityChange = (key: string, visible: boolean) => {
    setVisibleColumns((prev) => {
      const newState = { ...prev, [key]: visible }
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      return newState
    })
  }

  const allColumns: { key: string; title: string }[] = [
    { key: 'segments', title: 'Segments' },
    { key: 'name', title: 'Name' },
    { key: 'phone', title: 'Phone' },
    // { key: 'country', title: 'Country' },
    { key: 'city', title: 'City' },
    // { key: 'language', title: 'Language' },
    // { key: 'timezone', title: 'Timezone' },
    { key: 'address', title: 'Address' },
    { key: 'job_title', title: 'Job Title' },
    // { key: 'lifetime_value', title: 'Lifetime Value' },
    // { key: 'orders_count', title: 'Orders Count' },
    // { key: 'last_order_at', title: 'Last Order' },
    // { key: 'created_at', title: 'Created At' },
    /* { key: 'custom_string_1', title: getCustomFieldLabel('custom_string_1', currentWorkspace) },
     { key: 'custom_string_2', title: getCustomFieldLabel('custom_string_2', currentWorkspace) },
     { key: 'custom_string_3', title: getCustomFieldLabel('custom_string_3', currentWorkspace) },
     { key: 'custom_string_4', title: getCustomFieldLabel('custom_string_4', currentWorkspace) },
     { key: 'custom_string_5', title: getCustomFieldLabel('custom_string_5', currentWorkspace) },
     { key: 'custom_number_1', title: getCustomFieldLabel('custom_number_1', currentWorkspace) },
     { key: 'custom_number_2', title: getCustomFieldLabel('custom_number_2', currentWorkspace) },
     { key: 'custom_number_3', title: getCustomFieldLabel('custom_number_3', currentWorkspace) },
     { key: 'custom_number_4', title: getCustomFieldLabel('custom_number_4', currentWorkspace) },
     { key: 'custom_number_5', title: getCustomFieldLabel('custom_number_5', currentWorkspace) },
     { key: 'custom_datetime_1', title: getCustomFieldLabel('custom_datetime_1', currentWorkspace) },
     { key: 'custom_datetime_2', title: getCustomFieldLabel('custom_datetime_2', currentWorkspace) },
     { key: 'custom_datetime_3', title: getCustomFieldLabel('custom_datetime_3', currentWorkspace) },
     { key: 'custom_datetime_4', title: getCustomFieldLabel('custom_datetime_4', currentWorkspace) },
     { key: 'custom_datetime_5', title: getCustomFieldLabel('custom_datetime_5', currentWorkspace) },
     { key: 'custom_json_1', title: getCustomFieldLabel('custom_json_1', currentWorkspace) },
     { key: 'custom_json_2', title: getCustomFieldLabel('custom_json_2', currentWorkspace) },
     { key: 'custom_json_3', title: getCustomFieldLabel('custom_json_3', currentWorkspace) },
     { key: 'custom_json_4', title: getCustomFieldLabel('custom_json_4', currentWorkspace) },
     { key: 'custom_json_5', title: getCustomFieldLabel('custom_json_5', currentWorkspace) }*/
  ]

  const activeFilters = React.useMemo(() => {
    return Object.entries(search)
      .filter(
        ([key, value]) =>
          key !== 'segments' && // Exclude segments as they are shown separately
          key !== 'limit' && // Exclude limit as it's a pagination param
          key !== 'cursor' && // Exclude cursor as it's a pagination param
          FILTER_FIELDS.some((field) => field.key === key) &&
          value !== undefined &&
          value !== ''
      )
      .map(([key, value]) => {
        const field = FILTER_FIELDS.find((f) => f.key === key)
        return {
          field: key,
          value: value as string | number | boolean | Date,
          label: field?.label || key
        }
      })
  }, [search])

  // Force data refresh on mount
  React.useEffect(() => {
    // Reset the query on mount to force a refetch
    queryClient.resetQueries({ queryKey: ['contacts', workspaceId] })

    // Cleanup function to reset state when component unmounts
    return () => {
      setCurrentContacts([])
      setCurrentPage(1)
      setPageCursors(new Map([[1, undefined]]))
    }
  }, [workspaceId, queryClient])

  // Get cursor for current page
  const currentCursor = pageCursors.get(currentPage)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['contacts', workspaceId, { ...search, cursor: currentCursor, page: currentPage }],
    queryFn: async () => {
      const request: ListContactsRequest = {
        workspace_id: workspaceId,
        cursor: currentCursor,
        limit: search.limit || 10,
        email: search.email,
        external_id: search.external_id,
        first_name: search.first_name,
        last_name: search.last_name,
        phone: search.phone,
        country: search.country,
        language: search.language,
        list_id: search.list_id,
        contact_list_status: search.contact_list_status,
        segments: search.segments,
        with_contact_lists: true
      }
      return contactsApi.list(request)
    },
    // Reduce staleTime to make filter changes more responsive
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })

  // Update currentContacts when data changes
  React.useEffect(() => {
    if (isLoading || !data) return

    if (data.contacts) {
      setCurrentContacts(data.contacts)
      // Store the next cursor for the next page
      if (data.next_cursor) {
        setPageCursors((prev) => {
          const newMap = new Map(prev)
          newMap.set(currentPage + 1, data.next_cursor)
          return newMap
        })
      }
    }
  }, [data, currentPage, isLoading])

  // Reset pagination when filters change
  React.useEffect(() => {
    // Reset to first page when search params change
    setCurrentContacts([])
    setCurrentPage(1)
    setPageCursors(new Map([[1, undefined]]))

    // Reset the entire query to force a fresh fetch
    queryClient.resetQueries({ queryKey: ['contacts', workspaceId] })

    // Schedule a refetch (give time for the UI to update first)
    setTimeout(() => {
      refetch()
    }, 0)
  }, [
    search.email,
    search.external_id,
    search.first_name,
    search.last_name,
    search.phone,
    // search.country,
    // search.language,
    // search.list_id,
    // search.contact_list_status,
    search.segments,
    search.limit,
    refetch,
    queryClient,
    workspaceId
  ])

  const handleRefresh = () => {
    // Reset pagination
    setCurrentContacts([])
    setCurrentPage(1)
    setPageCursors(new Map([[1, undefined]]))
    // Reset and refetch the query
    queryClient.resetQueries({ queryKey: ['contacts', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['lists', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['total-contacts', workspaceId] })
    refetch()
  }

  if (!currentWorkspace) {
    return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="small" /></div>
  }

  const columns: ColumnsType<Contact> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      fixed: 'left' as const,
      onHeaderCell: () => ({
        style: { backgroundColor: '#FAFAFA', color: 'rgba(28, 29, 31, 0.5)', fontWeight: 500 }
      }),
      onCell: (_: unknown, index?: number) => ({
        style: { backgroundColor: index !== undefined && index % 2 === 1 ? '#f2f2f2' : '#fafafa' }
      })
    },
    {
      title: 'Lists',
      key: 'lists',
      render: (_: unknown, record: Contact) => (
        <Space direction="vertical" size={2}>
          {record.contact_lists.map(
            (list: { list_id: string; status?: string; created_at?: string }) => {
              let color = 'blue'
              let icon = null
              let statusText = ''

              // Match status to color and icon
              switch (list.status) {
                case 'active':
                  color = 'green'
                  icon = <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: '4px' }} />
                  statusText = 'Active subscriber'
                  break
                case 'pending':
                  color = 'blue'
                  icon = <FontAwesomeIcon icon={faHourglass} style={{ marginRight: '4px' }} />
                  statusText = 'Pending confirmation'
                  break
                case 'unsubscribed':
                  color = 'gray'
                  icon = <FontAwesomeIcon icon={faBan} style={{ marginRight: '4px' }} />
                  statusText = 'Unsubscribed from list'
                  break
                case 'bounced':
                  color = 'orange'
                  icon = (
                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ marginRight: '4px' }} />
                  )
                  statusText = 'Email bounced'
                  break
                case 'complained':
                  color = 'red'
                  icon = <FontAwesomeIcon icon={faFaceFrown} style={{ marginRight: '4px' }} />
                  statusText = 'Marked as spam'
                  break
                default:
                  color = 'blue'
                  statusText = 'Status unknown'
                  break
              }

              // Find list name from listsData
              const listData = listsData?.lists?.find((l) => l.id === list.list_id)
              const listName = listData?.name || list.list_id

              // Format creation date if available using workspace timezone
              const creationDate = list.created_at
                ? dayjs(list.created_at).tz(workspaceTimezone).format('LL - HH:mm')
                : 'Unknown date'

              const tooltipTitle = (
                <>
                  <div>
                    <strong>{statusText}</strong>
                  </div>
                  <div>Subscribed on: {creationDate}</div>
                  <div>
                    <small>Timezone: {workspaceTimezone}</small>
                  </div>
                </>
              )

              return (
                <Tooltip key={list.list_id} title={tooltipTitle}>
                  <Tag bordered={false} color={color} style={{ marginBottom: '2px' }}>
                    {icon}
                    {listName}
                  </Tag>
                </Tooltip>
              )
            }
          )}
        </Space>
      ),
      hidden: !visibleColumns.lists
    },
    {
      title: 'Segments',
      key: 'segments',
      render: (_: unknown, record: Contact) => (
        <Space direction="vertical" size={2}>
          {record.contact_segments?.map(
            (segment: {
              segment_id: string
              version?: number
              matched_at?: string
              computed_at?: string
            }) => {
              // Find segment data from segmentsData to get the name and color
              const segmentData = segmentsData?.segments?.find((s) => s.id === segment.segment_id)
              const segmentName = segmentData?.name || segment.segment_id
              const segmentColor = segmentData?.color || '#1890ff'

              // Format matched date if available using workspace timezone
              const matchedDate = segment.matched_at
                ? dayjs(segment.matched_at).tz(workspaceTimezone).format('LL - HH:mm')
                : 'Unknown date'

              const tooltipTitle = (
                <>
                  <div>
                    <strong>{segmentName}</strong>
                  </div>
                  <div>Matched on: {matchedDate}</div>
                  {segment.version && <div>Version: {segment.version}</div>}
                  <div>
                    <small>Timezone: {workspaceTimezone}</small>
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
      ),
      hidden: !visibleColumns.segments
    },
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, record: Contact) =>
        `${record.first_name || ''} ${record.last_name || ''}`,
      hidden: !visibleColumns.name
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      hidden: !visibleColumns.phone
    },
    /* {
       title: 'Country',
       dataIndex: 'country',
       key: 'country',
       hidden: !visibleColumns.country
     },
     {
       title: 'Language',
       dataIndex: 'language',
       key: 'language',
       hidden: !visibleColumns.language
     },*/
    {/*
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
      hidden: !visibleColumns.timezone
    },*/},
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      hidden: !visibleColumns.city
    },
    {
      title: 'Address',
      key: 'address',
      render: (_: unknown, record: Contact) => {
        const parts = [
          record.address_line_1,
          record.address_line_2,
          record.city,
          record.state,
          record.postcode
        ].filter(Boolean)
        return parts.join(', ')
      },
      hidden: !visibleColumns.address
    },
    {
      title: 'Job Title',
      dataIndex: 'job_title',
      key: 'job_title',
      hidden: !visibleColumns.job_title
    },
    {
      title: 'Lifetime Value',
      dataIndex: 'lifetime_value',
      key: 'lifetime_value',
      render: (_: unknown, record: Contact) =>
        record.lifetime_value ? `$${record.lifetime_value.toFixed(2)}` : '-',
      hidden: !visibleColumns.lifetime_value
    },
    {
      title: 'Orders Count',
      dataIndex: 'orders_count',
      key: 'orders_count',
      hidden: !visibleColumns.orders_count
    },
    {
      title: 'Last Order',
      dataIndex: 'last_order_at',
      key: 'last_order_at',
      render: (_: unknown, record: Contact) =>
        record.last_order_at ? new Date(record.last_order_at).toLocaleDateString() : '-',
      hidden: !visibleColumns.last_order_at
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (_: unknown, record: Contact) =>
        record.created_at
          ? dayjs(record.created_at).tz(workspaceTimezone).format('LL - HH:mm')
          : '-',
      hidden: !visibleColumns.created_at
    },
    {
      title: getCustomFieldLabel('custom_string_1', currentWorkspace),
      dataIndex: 'custom_string_1',
      key: 'custom_string_1',
      hidden: !visibleColumns.custom_string_1
    },
    {
      title: getCustomFieldLabel('custom_string_2', currentWorkspace),
      dataIndex: 'custom_string_2',
      key: 'custom_string_2',
      hidden: !visibleColumns.custom_string_2
    },
    {
      title: getCustomFieldLabel('custom_string_3', currentWorkspace),
      dataIndex: 'custom_string_3',
      key: 'custom_string_3',
      hidden: !visibleColumns.custom_string_3
    },
    {
      title: getCustomFieldLabel('custom_string_4', currentWorkspace),
      dataIndex: 'custom_string_4',
      key: 'custom_string_4',
      hidden: !visibleColumns.custom_string_4
    },
    {
      title: getCustomFieldLabel('custom_string_5', currentWorkspace),
      dataIndex: 'custom_string_5',
      key: 'custom_string_5',
      hidden: !visibleColumns.custom_string_5
    },
    {
      title: getCustomFieldLabel('custom_number_1', currentWorkspace),
      dataIndex: 'custom_number_1',
      key: 'custom_number_1',
      hidden: !visibleColumns.custom_number_1
    },
    {
      title: getCustomFieldLabel('custom_number_2', currentWorkspace),
      dataIndex: 'custom_number_2',
      key: 'custom_number_2',
      hidden: !visibleColumns.custom_number_2
    },
    {
      title: getCustomFieldLabel('custom_number_3', currentWorkspace),
      dataIndex: 'custom_number_3',
      key: 'custom_number_3',
      hidden: !visibleColumns.custom_number_3
    },
    {
      title: getCustomFieldLabel('custom_number_4', currentWorkspace),
      dataIndex: 'custom_number_4',
      key: 'custom_number_4',
      hidden: !visibleColumns.custom_number_4
    },
    {
      title: getCustomFieldLabel('custom_number_5', currentWorkspace),
      dataIndex: 'custom_number_5',
      key: 'custom_number_5',
      hidden: !visibleColumns.custom_number_5
    },
    {
      title: getCustomFieldLabel('custom_datetime_1', currentWorkspace),
      dataIndex: 'custom_datetime_1',
      key: 'custom_datetime_1',
      render: (_: unknown, record: Contact) =>
        record.custom_datetime_1 ? new Date(record.custom_datetime_1).toLocaleDateString() : '-',
      hidden: !visibleColumns.custom_datetime_1
    },
    {
      title: getCustomFieldLabel('custom_datetime_2', currentWorkspace),
      dataIndex: 'custom_datetime_2',
      key: 'custom_datetime_2',
      render: (_: unknown, record: Contact) =>
        record.custom_datetime_2 ? new Date(record.custom_datetime_2).toLocaleDateString() : '-',
      hidden: !visibleColumns.custom_datetime_2
    },
    {
      title: getCustomFieldLabel('custom_datetime_3', currentWorkspace),
      dataIndex: 'custom_datetime_3',
      key: 'custom_datetime_3',
      render: (_: unknown, record: Contact) =>
        record.custom_datetime_3 ? new Date(record.custom_datetime_3).toLocaleDateString() : '-',
      hidden: !visibleColumns.custom_datetime_3
    },
    {
      title: getCustomFieldLabel('custom_datetime_4', currentWorkspace),
      dataIndex: 'custom_datetime_4',
      key: 'custom_datetime_4',
      render: (_: unknown, record: Contact) =>
        record.custom_datetime_4 ? new Date(record.custom_datetime_4).toLocaleDateString() : '-',
      hidden: !visibleColumns.custom_datetime_4
    },
    {
      title: getCustomFieldLabel('custom_datetime_5', currentWorkspace),
      dataIndex: 'custom_datetime_5',
      key: 'custom_datetime_5',
      render: (_: unknown, record: Contact) =>
        record.custom_datetime_5 ? new Date(record.custom_datetime_5).toLocaleDateString() : '-',
      hidden: !visibleColumns.custom_datetime_5
    },
    {
      title: getCustomFieldLabel('custom_json_1', currentWorkspace),
      dataIndex: 'custom_json_1',
      key: 'custom_json_1',
      render: (_: unknown, record: Contact) => (
        <JsonViewer
          json={record.custom_json_1}
          title={getCustomFieldLabel('custom_json_1', currentWorkspace)}
        />
      ),
      hidden: !visibleColumns.custom_json_1
    },
    {
      title: getCustomFieldLabel('custom_json_2', currentWorkspace),
      dataIndex: 'custom_json_2',
      key: 'custom_json_2',
      render: (_: unknown, record: Contact) => (
        <JsonViewer
          json={record.custom_json_2}
          title={getCustomFieldLabel('custom_json_2', currentWorkspace)}
        />
      ),
      hidden: !visibleColumns.custom_json_2
    },
    {
      title: getCustomFieldLabel('custom_json_3', currentWorkspace),
      dataIndex: 'custom_json_3',
      key: 'custom_json_3',
      render: (_: unknown, record: Contact) => (
        <JsonViewer
          json={record.custom_json_3}
          title={getCustomFieldLabel('custom_json_3', currentWorkspace)}
        />
      ),
      hidden: !visibleColumns.custom_json_3
    },
    {
      title: getCustomFieldLabel('custom_json_4', currentWorkspace),
      dataIndex: 'custom_json_4',
      key: 'custom_json_4',
      render: (_: unknown, record: Contact) => (
        <JsonViewer
          json={record.custom_json_4}
          title={getCustomFieldLabel('custom_json_4', currentWorkspace)}
        />
      ),
      hidden: !visibleColumns.custom_json_4
    },
    {
      title: getCustomFieldLabel('custom_json_5', currentWorkspace),
      dataIndex: 'custom_json_5',
      key: 'custom_json_5',
      render: (_: unknown, record: Contact) => (
        <JsonViewer
          json={record.custom_json_5}
          title={getCustomFieldLabel('custom_json_5', currentWorkspace)}
        />
      ),
      hidden: !visibleColumns.custom_json_5
    },
    {
      title: (
        <Space size="small">
          <Tooltip title="Refresh">
            <Button
              type="text"
              size="small"
              icon={<FontAwesomeIcon icon={faRefresh} />}
              onClick={handleRefresh}
              className="opacity-70 hover:opacity-100"
            />
          </Tooltip>
          <ContactColumnsSelector
            columns={allColumns.map((col) => ({
              ...col,
              visible: visibleColumns[col.key]
            }))}
            onColumnVisibilityChange={handleColumnVisibilityChange}
          />
        </Space>
      ),
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      align: 'right' as const,
      onHeaderCell: () => ({
        style: { backgroundColor: '#FAFAFA', color: 'rgba(28, 29, 31, 0.5)', fontWeight: 500 }
      }),
      onCell: (_: unknown, index?: number) => ({
        style: { backgroundColor: index !== undefined && index % 2 === 1 ? '#f2f2f2' : '#fafafa' }
      }),
      render: (_: unknown, record: Contact) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Edit',
            disabled: !permissions?.contacts?.write,
            onClick: () => handleEditClick(record)
          },
          {
            key: 'delete',
            label: 'Delete',
            disabled: !permissions?.contacts?.write,
            onClick: () => handleDeleteClick(record.email)
          }
        ]

        return (
          <Space size="small">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" icon={<FontAwesomeIcon icon={faEllipsisV} />} />
            </Dropdown>
            <ContactDetailsDrawer
              workspace={currentWorkspace}
              contactEmail={record.email}
              lists={listsData?.lists || []}
              segments={segmentsData?.segments || []}
              key={record.email}
              onContactUpdate={(updatedContact) => {
                // Update the contact in the currentContacts array
                setCurrentContacts((prev) =>
                  prev.map((contact) =>
                    contact.email === updatedContact.email ? updatedContact : contact
                  )
                )
              }}
              buttonProps={{
                icon: <FontAwesomeIcon icon={faEye} />,
                type: 'text'
              }}
            />
          </Space>
        )
      }
    }
  ].filter((col) => !col.hidden)


  // Show empty state when there's no data and no loading
  const showEmptyState =
    !isLoading &&
    !isFetching &&
    (!data?.contacts || data.contacts.length === 0) &&
    currentContacts.length === 0

  // Pagination calculations
  const pageSize = search.limit || 10
  const totalContacts = totalContactsData?.total_contacts || 0

  // Check if we can go to next page (cursor exists for next page or we have next_cursor from current data)
  const canGoNext = pageCursors.has(currentPage + 1) || !!data?.next_cursor

  const isTrulyEmpty = !isLoading && totalContactsData?.total_contacts === 0

  return (
    <div className="flex flex-col" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
      {/* Header with title and actions */}
      {!isMobile && (
        <div
          className="flex justify-between items-center px-5 shrink-0"
          style={{
            height: '60px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #EAEAEC',
          }}
        >
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl font-semibold"
              style={{
                color: '#1C1D1F',
                marginBottom: '0'
              }}
            >
              Contacts
            </h1>
            {totalContactsData?.total_contacts !== undefined && (
              <Tag
                bordered={false}
                style={{
                  backgroundColor: 'rgba(207, 216, 246, 0.5)',
                  padding: '5px 10px',
                  color: '#2F6DFB',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: '1'
                }}
              >
                {numbro(totalContactsData.total_contacts).format({
                  thousandSeparated: true,
                  mantissa: 0
                })}
              </Tag>
            )}
          </div>
          <Space>
            {/*
            <Tooltip
              title={
                !permissions?.contacts?.write
                  ? "You don't have write permission for contacts"
                  : undefined
              }
            >
              <span>
                <BulkUpdateDrawer
                  workspaceId={workspaceId}
                  lists={listsData?.lists || []}
                  buttonProps={{
                    type: 'primary',
                    ghost: true,
                    children: 'Bulk Update',
                    disabled: !permissions?.contacts?.write
                  }}
                />
              </span>
            </Tooltip>
            */}
            <Tooltip
              title={
                !permissions?.contacts?.write
                  ? "You don't have write permission for contacts"
                  : undefined
              }
            >
              <span>
                <ImportContactsButton
                  lists={listsData?.lists || []}
                  workspaceId={workspaceId}
                  disabled={!permissions?.contacts?.write}
                />
              </span>
            </Tooltip>
            {user?.registration_type == "gmail" && (
              <Tooltip
                title={
                  !permissions?.contacts?.write
                    ? "You don't have write permission for contacts"
                    : undefined
                }
              >
                <span>
                  <ImportGmailContactsButton
                    lists={listsData?.lists || []}
                    workspaceId={workspaceId}
                    disabled={!permissions?.contacts?.write}
                  />
                </span>
              </Tooltip>
            )}
            <Tooltip
              title={
                !permissions?.contacts?.write
                  ? "You don't have write permission for contacts"
                  : undefined
              }
            >
              <div>
                <ContactUpsertDrawer
                  workspace={currentWorkspace}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] })
                    queryClient.invalidateQueries({ queryKey: ['total-contacts', workspaceId] })
                  }}
                  buttonProps={{
                    buttonContent: (
                      <>
                        <PlusOutlined /> Add
                      </>
                    ),
                    disabled: !permissions?.contacts?.write
                  }}
                />
              </div>
            </Tooltip>
          </Space>
        </div>
      )}

      {/* Mobile header: count + action buttons */}
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
          <div className="flex items-center gap-2">
            {totalContactsData?.total_contacts !== undefined && (
              <Tag
                bordered={false}
                style={{
                  backgroundColor: 'rgba(207, 216, 246, 0.5)',
                  padding: '4px 8px',
                  color: '#2F6DFB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '1',
                  margin: 0,
                }}
              >
                {numbro(totalContactsData.total_contacts).format({
                  thousandSeparated: true,
                  mantissa: 0
                })} contacts
              </Tag>
            )}
          </div>
          <Space size={8}>
            <ImportContactsButton
              lists={listsData?.lists || []}
              workspaceId={workspaceId}
              disabled={!permissions?.contacts?.write}
              iconOnly
            />
            {user?.registration_type == "gmail" && (
              <ImportGmailContactsButton
                lists={listsData?.lists || []}
                workspaceId={workspaceId}
                disabled={!permissions?.contacts?.write}
                iconOnly
              />
            )}
            <ContactUpsertDrawer
              workspace={currentWorkspace}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] })
                queryClient.invalidateQueries({ queryKey: ['total-contacts', workspaceId] })
              }}
              buttonProps={{
                buttonContent: <PlusOutlined />,
                disabled: !permissions?.contacts?.write
              }}
            />
          </Space>
        </div>
      )}

      {/* Filters */}
      {!isTrulyEmpty && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 8 : 12,
              marginBottom: isMobile ? 4 : 10,
              padding: isMobile ? '12px 16px 0' : '20px 20px 0',
              overflowX: isMobile ? 'auto' : undefined,
            }}
          >
            <span style={{ color: 'rgba(28, 29, 31, 0.5)', fontSize: '14px', fontWeight: 500, flexShrink: 0 }}>Filters:</span>
            <Filter fields={FILTER_FIELDS} activeFilters={activeFilters} />
          </div>

          {/* Segments */}
          <SegmentsFilter
            workspaceId={workspaceId}
            segments={segmentsData?.segments || []}
            selectedSegmentIds={search.segments}
            totalContacts={totalContactsData?.total_contacts}
            onSelectAll={() => {
              navigate({
                to: workspaceContactsRoute.to,
                params: { workspaceId },
                search: {
                  ...search,
                  segments: undefined
                }
              })
            }}
            onSegmentToggle={(segmentId: string) => {
              const currentSegments = search.segments || []
              const newSegments = currentSegments.includes(segmentId)
                ? currentSegments.filter((id) => id !== segmentId)
                : [...currentSegments, segmentId]

              navigate({
                to: workspaceContactsRoute.to,
                params: { workspaceId },
                search: {
                  ...search,
                  segments: newSegments.length > 0 ? newSegments : undefined
                }
              })
            }}
          />
        </>
      )}

      {/* Contacts Table (desktop) / Card list (mobile) */}
      {isTrulyEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <EmptyState
            icon={<ContactsIcon />}
            title="No Contacts Added Yet"
            action={
              <ContactUpsertDrawer
                workspace={currentWorkspace}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] })
                  queryClient.invalidateQueries({ queryKey: ['total-contacts', workspaceId] })
                }}
                buttonProps={{
                  type: 'primary',
                  buttonContent: <><PlusOutlined /> Add</>,
                  disabled: !permissions?.contacts?.write,
                  style: { borderRadius: '10px' },
                }}
              />
            }
          />
        </div>
      ) : isMobile ? (
        <div className="flex-1 overflow-auto" style={{ padding: '12px 16px' }}>
          {(isLoading || isFetching) && currentContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="small" />
            </div>
          ) : showEmptyState ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(28, 29, 31, 0.4)' }}>
              No contacts found matching your filters
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentContacts.map((contact) => {
                const menuItems: MenuProps['items'] = [
                  {
                    key: 'edit',
                    label: 'Edit',
                    disabled: !permissions?.contacts?.write,
                    onClick: () => handleEditClick(contact)
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    disabled: !permissions?.contacts?.write,
                    onClick: () => handleDeleteClick(contact.email)
                  }
                ]

                const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')

                return (
                  <div
                    key={contact.email}
                    style={{
                      backgroundColor: '#FAFAFA',
                      borderRadius: 12,
                      padding: '12px 14px',
                      border: '1px solid #F0F0F0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {fullName && (
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1D1F', marginBottom: 2 }}>
                            {fullName}
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.6)', wordBreak: 'break-all' }}>
                          {contact.email}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <ContactDetailsDrawer
                          workspace={currentWorkspace}
                          contactEmail={contact.email}
                          lists={listsData?.lists || []}
                          segments={segmentsData?.segments || []}
                          onContactUpdate={(updatedContact) => {
                            setCurrentContacts((prev) =>
                              prev.map((c) => c.email === updatedContact.email ? updatedContact : c)
                            )
                          }}
                          buttonProps={{
                            icon: <FontAwesomeIcon icon={faEye} />,
                            type: 'text',
                            size: 'small',
                          }}
                        />
                        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                          <Button type="text" size="small" icon={<FontAwesomeIcon icon={faEllipsisV} />} />
                        </Dropdown>
                      </div>
                    </div>
                    {contact.phone && (
                      <div style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.5)', marginBottom: 4 }}>
                        {contact.phone}
                      </div>
                    )}
                    {contact.contact_lists.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {contact.contact_lists.map((list) => {
                          const listData = listsData?.lists?.find((l) => l.id === list.list_id)
                          const listName = listData?.name || list.list_id
                          const color = list.status === 'active' ? 'green' : list.status === 'unsubscribed' ? 'gray' : 'blue'
                          return (
                            <Tag key={list.list_id} bordered={false} color={color} style={{ margin: 0, fontSize: 11 }}>
                              {listName}
                            </Tag>
                          )
                        })}
                      </div>
                    )}
                    {contact.contact_segments && contact.contact_segments.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {contact.contact_segments.map((segment) => {
                          const segmentData = segmentsData?.segments?.find((s) => s.id === segment.segment_id)
                          const segmentName = segmentData?.name || segment.segment_id
                          const segmentColor = segmentData?.color || '#1890ff'
                          return (
                            <Tag key={segment.segment_id} bordered={false} color={segmentColor} style={{ margin: 0, fontSize: 11 }}>
                              {segmentName}
                            </Tag>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-5 py-6">
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
              dataSource={currentContacts}
              rowKey={(record) => record.email}
              loading={isLoading || isFetching}
              pagination={false}
              scroll={{ x: 'max-content' }}
              style={{ minWidth: 800 }}
              locale={{
                emptyText: showEmptyState
                  ? 'No contacts found matching your filters'
                  : 'Loading...'
              }}
              rowClassName={(_, index) => (index % 2 === 1 ? 'zebra-row' : '')}
            />
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!isTrulyEmpty && (
        <PaginationFooter
          totalItems={totalContacts}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            navigate({
              to: workspaceContactsRoute.to,
              params: { workspaceId },
              search: {
                ...search,
                limit: newSize
              }
            })
          }}
          canGoNext={canGoNext}
          loading={isLoading || isFetching}
          emptyLabel="No contacts"
          isMobile={isMobile}
        />
      )}

      <DeleteContactModal
        visible={deleteModalVisible}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        contactEmail={contactToDelete || ''}
        loading={deleteContactMutation.isPending}
        disabled={!permissions?.contacts?.write}
      />

      {contactToEdit && (
        <ContactUpsertDrawer
          workspace={currentWorkspace}
          contact={contactToEdit}
          open={editDrawerVisible}
          onClose={handleEditClose}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['contacts', workspaceId] })
            queryClient.invalidateQueries({ queryKey: ['total-contacts', workspaceId] })
          }}
          onContactUpdate={handleContactUpdate}
        />
      )}
    </div>
  )
}
