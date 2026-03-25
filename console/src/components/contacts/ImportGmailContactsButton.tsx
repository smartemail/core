import React, { useState } from 'react'
import { Button, Tooltip } from 'antd'
import { GoogleOutlined  } from '@ant-design/icons'
import { List } from '../../services/api/types'
import {Modal} from 'antd'
import { api } from '../../services/api/client'
import { ImportGmailContactResponse } from '../../services/api/template'



interface ImportGmailContactsButtonProps {
  className?: string
  style?: React.CSSProperties
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  size?: 'large' | 'middle' | 'small'
  lists?: List[]
  workspaceId: string
  refreshOnClose?: boolean
  disabled?: boolean
  iconOnly?: boolean
}


export function ImportGmailContactsButton({
  className,
  style,
  type = 'primary',
  size = 'middle',
  workspaceId,
  disabled = false,
  iconOnly = false
}: ImportGmailContactsButtonProps) {

    const [loading, setLoading] = useState(false)

  const loadContacts = async function (workspaceId: string) {
    Modal.confirm({
        title: 'Title about import contact',
        content: `Are you sure you want to import contacts from Google?`,
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          setLoading(true)
          api.post<ImportGmailContactResponse>('/api/integration.importGmailContact', { workspace_id: workspaceId}).then(() => {
              document.location.reload()
    })

        },
        onCancel: () => {
          setLoading(false)
        }
      })
  }

  const button = (
    <Button
      type={type}
      icon={<GoogleOutlined />}
      onClick={() => loadContacts(workspaceId)}
      className={className}
      style={style}
      size={size}
      disabled={disabled}
      loading={loading}
    >
      {!iconOnly && 'Import from Google'}
    </Button>
  )

  if (iconOnly) {
    return <Tooltip title="Import from Google">{button}</Tooltip>
  }

  return button
}
