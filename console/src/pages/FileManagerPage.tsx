import { fileManagerApi, ListFileResponse } from '../services/api/file_manager'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Upload, Table, Modal, Drawer, message } from 'antd'
import { CloudUploadOutlined, DeleteOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { filesize } from 'filesize'
import { PaginationFooter, EmptyState, ImageIcon } from '../components/common'
import { useIsMobile } from '../hooks/useIsMobile'

const { Dragger } = Upload

export function FileManagerPage() {
  const isMobile = useIsMobile()
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; file: any | null }>({
    open: false,
    file: null
  })
  const [deleting, setDeleting] = useState(false)
  const queryClient = useQueryClient()
  const { data: filesData } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileManagerApi.listFiles()
  })

  const allFiles = filesData || []
  const totalFiles = allFiles.length
  const paginatedFiles = allFiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // Reset to last valid page when items are deleted
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalFiles / pageSize))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [totalFiles, pageSize, currentPage])

  const handleDeleteConfirm = async () => {
    if (!deleteModal.file) return
    try {
      setDeleting(true)
      await fileManagerApi.deleteFile([deleteModal.file.id])
      queryClient.invalidateQueries({ queryKey: ['files'] })
      setDeleteModal({ open: false, file: null })
    } catch (err) {
      console.error(err)
      message.error('Failed to delete file')
    } finally {
      setDeleting(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('files', file)
      await fileManagerApi.uploadFiles(formData)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      setUploadDrawerOpen(false)
      message.success(`${file.name} uploaded successfully`)
    } catch (err) {
      console.error(err)
      message.error(`Failed to upload ${file.name}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteSelected = async (ids: React.Key[]) => {
    try {
      setDeleting(true)
      await fileManagerApi.deleteFile(ids as string[])
      queryClient.invalidateQueries({ queryKey: ['files'] })
      setSelectedRowKeys([])
      message.success(`Deleted ${ids.length} file(s) successfully`)
    } catch (err) {
      console.error(err)
      message.error('Failed to delete selected files')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: isMobile ? 'calc(100vh - 56px)' : '100vh' }}>
      {/* Header */}
      <div
        className="flex justify-between items-center px-5 shrink-0"
        style={{
          height: '60px',
          backgroundColor: '#FAFAFA',
          borderBottom: '1px solid #EAEAEC'
        }}
      >
        <h1
          className="text-2xl font-semibold"
          style={{ color: '#1C1D1F', marginBottom: 0 }}
        >
          File Manager
        </h1>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => setUploadDrawerOpen(true)}
          style={{
            backgroundColor: '#2F6DFB',
            borderRadius: '10px',
            fontWeight: 700
          }}
        >
          Upload Files
        </Button>
      </div>

      {/* Table or Empty State */}
      {totalFiles === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <EmptyState
            icon={<ImageIcon />}
            title="No Files Uploaded Yet"
            action={
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => setUploadDrawerOpen(true)}
                style={{
                  backgroundColor: '#2F6DFB',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                Upload Files
              </Button>
            }
          />
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
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                onClick={() => handleDeleteSelected(selectedRowKeys)}
                loading={deleting}
              >
                Delete selected ({selectedRowKeys.length})
              </Button>
            )}
            <Table
              className="table-no-cell-border"
              dataSource={paginatedFiles}
              rowKey="id"
              rowClassName={(_, index) => (index % 2 === 1 ? 'zebra-row' : '')}
              pagination={false}
              rowSelection={rowSelection}
              columns={[
                {
                  title: 'Image',
                  key: 'image',
                  width: isMobile ? 120 : 300,
                  render: (_, record) => (
                    <img
                      src={record.url}
                      alt={record.name}
                      style={{ height: 64, borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )
                },
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                  ellipsis: true
                },
                {
                  title: 'Size',
                  dataIndex: 'size',
                  key: 'size',
                  width: isMobile ? 80 : 100,
                  render: (size: number) => filesize(size, { round: 0, separator: ',' })
                },
                {
                  key: 'actions',
                  width: 60,
                  align: 'right' as const,
                  render: (_, record) => (
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteModal({ open: true, file: record })}
                    />
                  )
                }
              ]}
            />
          </div>
        </div>
      )}
      {/* Pagination Footer */}
      {totalFiles > 0 && (
        <PaginationFooter
          totalItems={totalFiles}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
        />
      )}

      {/* Upload Drawer */}
      <Drawer
        title="Upload File(s)"
        open={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
        width={isMobile ? '100%' : 420}
      >
        <Dragger
          multiple
          accept="image/jpeg,image/png,image/bmp"
          showUploadList={false}
          disabled={uploading}
          beforeUpload={(file) => {
            const isAllowed = ['image/jpeg', 'image/png', 'image/bmp'].includes(file.type)
            if (!isAllowed) {
              message.error('Only JPEG, PNG, BMP files are allowed')
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
          style={{
            borderRadius: '12px',
            padding: '40px 20px',
            border: '1.5px dashed #d9d9d9',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CloudUploadOutlined style={{ fontSize: 40, color: '#2F6DFB' }} />
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1C1D1F' }}>
              Click or drag file(s) to this area to upload
            </div>
            <div style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.5)' }}>
              JPEG, PNG, BMP, under 5MB
            </div>
          </div>
        </Dragger>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, file: null })}
        footer={null}
        centered
        width={480}
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
            Are you sure you want to delete this file?
          </h3>
          {deleteModal.file && (
            <img
              src={deleteModal.file.url}
              alt={deleteModal.file.name}
              style={{
                width: '100%',
                maxHeight: 240,
                objectFit: 'cover',
                borderRadius: '12px',
                marginBottom: 16,
              }}
            />
          )}
          <p style={{ color: 'rgba(28, 29, 31, 0.6)', fontSize: 14, marginBottom: 24 }}>
            The file will be removed from the server. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              size="large"
              onClick={() => setDeleteModal({ open: false, file: null })}
              style={{ borderRadius: '10px', minWidth: 120, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              size="large"
              danger
              type="primary"
              icon={<DeleteOutlined />}
              loading={deleting}
              onClick={handleDeleteConfirm}
              style={{ borderRadius: '10px', minWidth: 120, fontWeight: 600 }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
