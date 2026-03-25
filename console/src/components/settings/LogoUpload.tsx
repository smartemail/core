import { useState } from 'react'
import { Button, Upload, App } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { userSettingService } from '../../services/api/user_setting'

interface LogoUploadProps {
  logoUrl: string | null
  onUpload: () => void
  onDelete: () => void | Promise<void>
}

export function LogoUpload({ logoUrl, onUpload, onDelete }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { message } = App.useApp()

  const getFilename = (url: string) => {
    try {
      const pathname = new URL(url, 'http://x').pathname
      const parts = pathname.split('/')
      return decodeURIComponent(parts[parts.length - 1])
    } catch {
      return 'logo'
    }
  }

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be under 5 MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      await userSettingService.updateUserLogo(formData)
      onUpload()
      message.success('Logo uploaded')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  if (logoUrl) {
    return (
      <div
        className="flex items-center gap-3"
        style={{
          border: '1px solid #E4E4E4',
          borderRadius: 10,
          padding: '10px 16px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 6,
            overflow: 'hidden',
            flexShrink: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'8\' height=\'8\' fill=\'%23e5e7eb\'/%3E%3Crect x=\'8\' y=\'8\' width=\'8\' height=\'8\' fill=\'%23e5e7eb\'/%3E%3Crect x=\'8\' width=\'8\' height=\'8\' fill=\'%23f3f4f6\'/%3E%3Crect y=\'8\' width=\'8\' height=\'8\' fill=\'%23f3f4f6\'/%3E%3C/svg%3E")',
            backgroundSize: '16px 16px',
          }}
        > 
          {/* if logo is svg else */}
          {logoUrl.toLowerCase().indexOf('.svg') !== -1? (
            <object
              data={logoUrl}
              type="image/svg+xml"
              style={{ width: 48, height: 48, display: 'block' }}
            />
          ) : (
            <img
              src={logoUrl}
              alt="Brand logo"
              style={{ width: 48, height: 48, objectFit: 'contain', display: 'block' }}
            />
          )}
        </div>
        <span
          className="flex-1 truncate"
          style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F', minWidth: 0 }}
        >
          {getFilename(logoUrl)}
        </span>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          loading={deleting}
          onClick={async () => {
            setDeleting(true)
            try {
              await onDelete()
            } finally {
              setDeleting(false)
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1D1F', opacity: 0.3, textAlign: 'right', lineHeight: 1.4 }}>
        JPEG, PNG, SVG<br />Under 5 MB
      </span>
      <Upload
        accept="image/jpeg,image/png,image/svg+xml"
        showUploadList={false}
        customRequest={({ file }) => handleUpload(file as File)}
      >
        <Button
          type="primary"
          icon={<UploadOutlined />}
          loading={uploading}
          style={{ height: 50, borderRadius: 10 }}
        >
          Upload File
        </Button>
      </Upload>
    </div>
  )
}
