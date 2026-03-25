import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { Modal, Checkbox, Spin, Typography } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'
import { fileManagerApi, type ListFileResponse } from '../../../services/api/file_manager'
import type { UploadedImage } from '../hooks/useCampaignWizard'
import { filesize } from 'filesize'

const { Text } = Typography

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/bmp']
const MAX_SIZE_MB = 10

interface ImageAddModalProps {
  open: boolean
  onClose: () => void
  onAdd: (images: UploadedImage[]) => void
  existingImageUrls: string[]
  uploadPrefix: string
}

function listFileToUploadedImage(f: ListFileResponse): UploadedImage {
  return {
    uid: f.id,
    name: f.name,
    size: f.size,
    url: f.url,
    thumbUrl: f.url,
  }
}

export function ImageAddModal({
  open,
  onClose,
  onAdd,
  existingImageUrls,
  uploadPrefix,
}: ImageAddModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'filemanager'>('upload')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [serverFiles, setServerFiles] = useState<ListFileResponse[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())

  const [showError, setShowError] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('upload')
      setSelectedFileIds(new Set())
      setShowError(false)
      setServerFiles([])
      setIsUploading(false)
    }
  }, [open])

  // Load files when File Manager tab is activated
  useEffect(() => {
    if (open && activeTab === 'filemanager') {
      loadServerFiles()
    }
  }, [open, activeTab])

  const loadServerFiles = async () => {
    setIsLoadingFiles(true)
    try {
      const files = await fileManagerApi.listFiles()
      setServerFiles(files)
    } catch {
      setShowError(true)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleUploadFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(
      (file) => ACCEPTED_TYPES.includes(file.type) && file.size / 1024 / 1024 < MAX_SIZE_MB
    )
    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      validFiles.forEach((file) => formData.append('files', file))
      formData.append('prefix', uploadPrefix)

      await fileManagerApi.uploadFiles(formData)

      const updatedFiles = await fileManagerApi.listFiles(uploadPrefix)
      const newImages = updatedFiles
        .filter((f) => !existingImageUrls.includes(f.url))
        .map(listFileToUploadedImage)

      if (newImages.length > 0) {
        onAdd(newImages)
      }
      onClose()
    } catch {
      setShowError(true)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files)
      e.target.value = ''
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const selectableFiles = serverFiles.filter((f) => !existingImageUrls.includes(f.url))

  const toggleSelectAll = () => {
    if (selectedFileIds.size === selectableFiles.length) {
      setSelectedFileIds(new Set())
    } else {
      setSelectedFileIds(new Set(selectableFiles.map((f) => f.id)))
    }
  }

  const handleAddSelected = () => {
    const selectedFiles = serverFiles.filter((f) => selectedFileIds.has(f.id))
    const newImages = selectedFiles
      .filter((f) => !existingImageUrls.includes(f.url))
      .map(listFileToUploadedImage)
    onAdd(newImages)
    onClose()
  }

  // Error overlay
  const renderError = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: 12,
        textAlign: 'center',
      }}
    >
      {/* Warning triangle */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#FFF2F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="#FF4D4F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <Text style={{ fontWeight: 700, fontSize: 22, color: '#1C1D1F' }}>
        Something Went Wrong...
      </Text>
      <Text style={{ fontSize: 14, color: '#1C1D1F', opacity: 0.5, lineHeight: 1.6 }}>
        We couldn't complete the request.
        <br />
        Please refresh the page or try again later.
      </Text>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          onClick={onClose}
          style={{
            height: 44,
            padding: '0 28px',
            borderRadius: 12,
            border: '1px solid #E4E4E4',
            background: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            color: '#1C1D1F',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            height: 44,
            padding: '0 28px',
            borderRadius: 12,
            border: 'none',
            background: '#2F6DFB',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6M1 20v-6h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  )

  // Upload tab content
  const renderUploadTab = () => (
    <div style={{ padding: 20 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/bmp"
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        aria-label="Upload images"
      />
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          height: 280,
          width: '100%',
          background: isDragOver ? '#EFEFEF' : '#F4F4F4',
          border: '1px dashed rgba(28,29,31,0.2)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isUploading ? 'default' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {isUploading ? (
          <Spin size="large" />
        ) : (
          <>
            <CloudUploadOutlined style={{ fontSize: 24, color: '#2F6DFB', marginBottom: 10 }} />
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: '#1C1D1F',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Click or drag file(s) to this area to upload
            </span>
            <span
              style={{
                fontSize: 14,
                color: '#1C1D1F',
                opacity: 0.5,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              JPEG, PNG, BMP, under 10MB
            </span>
          </>
        )}
      </div>
    </div>
  )

  // File Manager tab content
  const renderFileManagerTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {isLoadingFiles ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : serverFiles.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Text style={{ fontSize: 14, color: '#1C1D1F', opacity: 0.4 }}>No files found</Text>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderBottom: '1px solid #F0F0F0',
              gap: 12,
            }}
          >
            <Checkbox
              checked={selectableFiles.length > 0 && selectedFileIds.size === selectableFiles.length}
              indeterminate={selectedFileIds.size > 0 && selectedFileIds.size < selectableFiles.length}
              onChange={toggleSelectAll}
              style={{ flexShrink: 0 }}
            />
            <span style={{ width: 64, flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#1C1D1F', opacity: 0.5 }}>
              Preview
            </span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1C1D1F', opacity: 0.5 }}>
              Name
            </span>
            <span style={{ width: 80, flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#1C1D1F', opacity: 0.5 }}>
              Size
            </span>
          </div>

          {/* Table rows */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {serverFiles.map((file) => {
              const isAlreadyAdded = existingImageUrls.includes(file.url)
              const isSelected = selectedFileIds.has(file.id)
              return (
                <div
                  key={file.id}
                  onClick={() => !isAlreadyAdded && toggleFileSelection(file.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 20px',
                    gap: 12,
                    cursor: isAlreadyAdded ? 'default' : 'pointer',
                    opacity: isAlreadyAdded ? 0.4 : 1,
                    background: isSelected ? 'rgba(47,109,251,0.05)' : 'transparent',
                    borderBottom: '1px solid #F8F8F8',
                    transition: 'background 0.1s',
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isAlreadyAdded}
                    onChange={() => toggleFileSelection(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ flexShrink: 0 }}
                  />
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{
                      width: 64,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 6,
                      flexShrink: 0,
                      background: '#F0F0F0',
                    }}
                  />
                  <Text
                    ellipsis
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#1C1D1F',
                    }}
                  >
                    {file.name}
                  </Text>
                  <span
                    style={{
                      width: 80,
                      flexShrink: 0,
                      fontSize: 14,
                      color: '#1C1D1F',
                      opacity: 0.6,
                    }}
                  >
                    {filesize(file.size, { round: 0 })}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          padding: '14px 20px',
          borderTop: '1px solid #F0F0F0',
        }}
      >
        <button
          onClick={onClose}
          style={{
            height: 44,
            padding: '0 28px',
            borderRadius: 12,
            border: '1px solid #E4E4E4',
            background: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            color: '#1C1D1F',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAddSelected}
          disabled={selectedFileIds.size === 0}
          style={{
            height: 44,
            padding: '0 28px',
            borderRadius: 12,
            border: 'none',
            background: selectedFileIds.size === 0 ? '#A0C0FF' : '#2F6DFB',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: selectedFileIds.size === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          Add Selected
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" strokeWidth="2" />
            <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
        content: { borderRadius: 20, padding: 0 },
      }}
      closable={false}
      destroyOnHidden
    >
      {showError ? (
        renderError()
      ) : (
        <>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px 0 20px',
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0 }}>
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  padding: '8px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: activeTab === 'upload' ? '#1C1D1F' : '#1C1D1F80',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'upload' ? '2px solid #2F6DFB' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('filemanager')}
                style={{
                  padding: '8px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: activeTab === 'filemanager' ? '#1C1D1F' : '#1C1D1F80',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'filemanager' ? '2px solid #2F6DFB' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                File Manager
              </button>
            </div>

            {/* Close button */}
            <div
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(28,29,31,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke="#1C1D1F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Divider under tabs */}
          <div style={{ height: 1, background: '#F0F0F0', margin: '0 20px' }} />

          {/* Tab content */}
          {activeTab === 'upload' ? renderUploadTab() : renderFileManagerTab()}
        </>
      )}
    </Modal>
  )
}
