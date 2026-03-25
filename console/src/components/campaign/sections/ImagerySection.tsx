import { useState } from 'react'
import { Switch, Typography } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { ImageryIcon } from '../CampaignIcons'
import type { UploadedImage } from '../hooks/useCampaignWizard'
import { ImageAddModal } from '../modals/ImageAddModal'
import { filesize } from 'filesize'

const { Text } = Typography

interface ImagerySectionProps {
  generateImages: boolean
  onGenerateImagesChange: (v: boolean) => void
  uploadCustomImages: boolean
  onUploadCustomImagesChange: (v: boolean) => void
  uploadedImages: UploadedImage[]
  onUploadedImagesChange: (v: UploadedImage[]) => void
}

function Divider() {
  return <div style={{ height: 1, background: '#F0F0F0', margin: '0 10px' }} />
}

export function ImagerySection({
  generateImages,
  onGenerateImagesChange,
  uploadCustomImages,
  onUploadCustomImagesChange,
  uploadedImages,
  onUploadedImagesChange,
}: ImagerySectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleRemoveImage = (uid: string) => {
    onUploadedImagesChange(uploadedImages.filter((img) => img.uid !== uid))
  }

  const handleAddImages = (newImages: UploadedImage[]) => {
    const existingUrls = new Set(uploadedImages.map((img) => img.url))
    const uniqueNew = newImages.filter((img) => !existingUrls.has(img.url))
    if (uniqueNew.length > 0) {
      onUploadedImagesChange([...uploadedImages, ...uniqueNew])
    }
  }

  return (
    <div style={{ borderBottom: expanded ? '1px solid #E4E4E4' : 'none' }}>
      {/* Section header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #E4E4E4',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ImageryIcon />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1C1D1F' }}>Imagery</span>
        </div>
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          style={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M3.33332 6.66675L9.99999 13.3334L16.6667 6.66675" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Section content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
          {/* Generate images toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
            <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>Generate image(s)</Text>
            <Switch
              checked={generateImages}
              onChange={onGenerateImagesChange}
            />
          </div>

          <Divider />

          {/* Use custom images toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
            <Text style={{ fontWeight: 500, fontSize: 14, color: '#1C1D1F' }}>Use custom image(s)</Text>
            <Switch
              checked={uploadCustomImages}
              onChange={onUploadCustomImagesChange}
            />
          </div>

          {/* Custom images area */}
          {uploadCustomImages && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Uploaded files list */}
              {uploadedImages.map((img) => (
                <div
                  key={img.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 84,
                    padding: '20px 20px 20px 10px',
                    background: '#FAFAFA',
                    borderRadius: 15,
                    border: '1px solid #E4E4E4',
                  }}
                >
                  <img
                    src={img.thumbUrl || img.url}
                    alt={img.name}
                    style={{
                      height: 64,
                      width: 84,
                      objectFit: 'cover',
                      borderRadius: 10,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <Text ellipsis style={{ display: 'block', fontWeight: 500, fontSize: 16, lineHeight: 1.5 }}>
                      {img.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#1C1D1F', opacity: 0.3, lineHeight: 1.3 }}>
                      {filesize(img.size)}
                    </Text>
                  </div>
                  <DeleteOutlined
                    onClick={() => handleRemoveImage(img.uid)}
                    style={{ fontSize: 18, color: '#1C1D1F', cursor: 'pointer', flexShrink: 0 }}
                  />
                </div>
              ))}

              {/* Add Image(s) button */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                style={{
                  height: 44,
                  width: '100%',
                  borderRadius: 12,
                  border: 'none',
                  background: '#2F6DFB',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                }}
              >
                Add Image(s)
                <svg width={16} height={16} viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="3" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="7.5" cy="7.5" r="1.5" stroke="#fff" strokeWidth="1.5" />
                  <path d="M2 14l4-4 3 3 3-4 6 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Image add modal */}
      <ImageAddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddImages}
        existingImageUrls={uploadedImages.map((img) => img.url)}
        uploadPrefix="campaign"
      />
    </div>
  )
}
