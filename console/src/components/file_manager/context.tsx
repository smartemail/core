import React, { createContext, useContext, useState } from 'react'
import { Modal, App, Button, Upload, Spin, Empty } from 'antd'
import { CloudUploadOutlined, CheckCircleFilled } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fileManagerApi, ListFileResponse } from '../../services/api/file_manager'
import { filesize } from 'filesize'

interface FileManagerContextValue {
  SelectFileButton: React.FC<SelectFileButtonProps>
}

interface SelectFileButtonProps {
  onSelect: (url: string) => void
  acceptFileType?: string
  acceptItem?: (item: any) => boolean
  buttonText?: string
  disabled?: boolean
  size?: 'small' | 'middle' | 'large'
  block?: boolean
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  ghost?: boolean
  style?: React.CSSProperties
}

interface FileManagerProviderProps {
  children: React.ReactNode
  readOnly?: boolean
}

const FileManagerContext = createContext<FileManagerContextValue | undefined>(undefined)

// Inner modal content component (uses hooks properly)
const FilePickerContent: React.FC<{
  onSelect: (url: string) => void
  onClose: () => void
  readOnly: boolean
}> = ({ onSelect, onClose, readOnly }) => {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<ListFileResponse | null>(null)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileManagerApi.listFiles()
  })

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('files', file)
      await fileManagerApi.uploadFiles(formData)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      message.success(`${file.name} uploaded`)
    } catch (err) {
      console.error(err)
      message.error(`Failed to upload ${file.name}`)
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedFile) {
      onSelect(selectedFile.url)
      onClose()
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Upload button */}
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Upload
            accept="image/jpeg,image/png,image/bmp,image/gif,image/webp"
            showUploadList={false}
            disabled={uploading}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/')
              if (!isImage) {
                message.error('Only image files are allowed')
                return Upload.LIST_IGNORE
              }
              const isUnder5MB = file.size / 1024 / 1024 < 5
              if (!isUnder5MB) {
                message.error('File must be under 5MB')
                return Upload.LIST_IGNORE
              }
              return true
            }}
            customRequest={async ({ file }) => {
              await handleUpload(file as File)
            }}
          >
            <Button
              icon={<CloudUploadOutlined />}
              loading={uploading}
              type="primary"
              ghost
            >
              Upload Image
            </Button>
          </Upload>
        </div>
      )}

      {/* Image grid */}
      {files.length === 0 ? (
        <Empty
          description="No files uploaded yet"
          style={{ padding: '60px 0' }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
            maxHeight: 460,
            overflowY: 'auto',
            paddingRight: 4
          }}
        >
          {files.map((file) => {
            const isSelected = selectedFile?.id === file.id
            return (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #2F6DFB' : '2px solid transparent',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#fafafa',
                  transition: 'border-color 0.2s',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <CheckCircleFilled
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      fontSize: 18,
                      color: '#2F6DFB',
                      zIndex: 1,
                      background: '#fff',
                      borderRadius: '50%'
                    }}
                  />
                )}
                <img
                  src={file.url}
                  alt={file.name}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <div style={{ padding: '6px 8px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {filesize(file.size, { round: 0 })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm button */}
      {selectedFile && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button type="primary" onClick={handleConfirm}>
            Select Image
          </Button>
        </div>
      )}
    </div>
  )
}

export const FileManagerProvider: React.FC<FileManagerProviderProps> = ({
  children,
  readOnly = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentOnSelect, setCurrentOnSelect] = useState<((url: string) => void) | null>(null)

  const closeModal = () => {
    setIsModalVisible(false)
    setCurrentOnSelect(null)
  }

  const handleSelect = (url: string) => {
    if (currentOnSelect) {
      currentOnSelect(url)
    }
    closeModal()
  }

  // SelectFileButton component
  const SelectFileButton: React.FC<SelectFileButtonProps> = ({
    onSelect,
    buttonText = 'Browse Files',
    disabled = false,
    size = 'small',
    block = false,
    type = 'primary',
    ghost = false,
    style
  }) => {
    const handleOpenFileManager = () => {
      setCurrentOnSelect(() => onSelect)
      setIsModalVisible(true)
    }

    return (
      <Button
        block={block}
        size={size}
        type={type}
        ghost={ghost}
        disabled={disabled}
        onClick={handleOpenFileManager}
        style={style}
      >
        {buttonText}
      </Button>
    )
  }

  const contextValue: FileManagerContextValue = {
    SelectFileButton
  }

  return (
    <FileManagerContext.Provider value={contextValue}>
      {children}

      {/* File Manager Modal */}
      <Modal
        title="File Manager"
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={900}
        style={{ top: 20 }}
        styles={{ body: { padding: 0 } }}
        zIndex={1300}
      >
        {isModalVisible && (
          <FilePickerContent
            onSelect={handleSelect}
            onClose={closeModal}
            readOnly={readOnly}
          />
        )}
      </Modal>
    </FileManagerContext.Provider>
  )
}

export const useFileManager = (): FileManagerContextValue => {
  const context = useContext(FileManagerContext)
  if (context === undefined) {
    throw new Error('useFileManager must be used within a FileManagerProvider')
  }
  return context
}

export default FileManagerProvider
