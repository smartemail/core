import { useState } from 'react'
import { Button, Upload, App } from 'antd'
import { UploadOutlined, DeleteOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons'
import { userSettingService } from '../../services/api/user_setting'

interface DesignDocUploadProps {
  docUrl: string | null
  onUpload: () => void
  onDelete: () => void
}

export function DesignDocUpload({ docUrl, onUpload, onDelete }: DesignDocUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { message } = App.useApp()

  const getFilename = (url: string) => {
    try {
      const pathname = new URL(url, 'http://x').pathname
      const parts = pathname.split('/')
      return decodeURIComponent(parts[parts.length - 1])
    } catch {
      return 'document'
    }
  }

  const isPdf = (url: string) => url.toLowerCase().endsWith('.pdf')

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      message.error('File size must be under 10 MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('branding', file)
      await userSettingService.updateUserBranding(formData)
      onUpload()
      message.success('Design documentation uploaded')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  if (docUrl) {
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F4F4F5',
          }}
        >
          {isPdf(docUrl) ? (
            <FilePdfOutlined style={{ fontSize: 24, color: '#1C1D1F' }} />
          ) : (
            <FileImageOutlined style={{ fontSize: 24, color: '#1C1D1F' }} />
          )}
        </div>
        <span
          className="flex-1 truncate"
          style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F', minWidth: 0 }}
        >
          {getFilename(docUrl)}
        </span>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={onDelete}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1D1F', opacity: 0.3, textAlign: 'right', lineHeight: 1.4 }}>
        JPEG, PNG, PDF<br />Under 10 MB
      </span>
      <Upload
        accept="image/jpeg,image/png,application/pdf"
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
