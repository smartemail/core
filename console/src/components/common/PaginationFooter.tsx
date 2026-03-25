import React from 'react'
import { Button } from 'antd'

interface PaginationFooterProps {
  totalItems: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  canGoNext?: boolean
  loading?: boolean
  pageSizeOptions?: number[]
  emptyLabel?: string
  isMobile?: boolean
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  canGoNext,
  loading = false,
  pageSizeOptions = [10, 20, 50],
  emptyLabel = 'No items',
  isMobile = false
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startRecord = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endRecord = Math.min(currentPage * pageSize, totalItems)

  const canGoPrev = currentPage > 1
  const computedCanGoNext = canGoNext !== undefined ? canGoNext : currentPage < totalPages

  const isPrevDisabled = !canGoPrev || loading
  const isNextDisabled = !computedCanGoNext || loading

  return (
    <div
      className="flex justify-between items-center shrink-0"
      style={{
        height: isMobile ? 50 : 60,
        borderTop: '1px solid #EAEAEC',
        backgroundColor: '#FAFAFA',
        padding: isMobile ? '0 16px' : '0 20px',
      }}
    >
      <div className="flex items-center gap-3" style={{ color: 'rgba(28, 29, 31, 0.5)', fontSize: isMobile ? '13px' : '14px' }}>
        <span>
          {totalItems > 0 ? `${startRecord}-${endRecord} of ${totalItems}` : emptyLabel}
        </span>
        {!isMobile && (
          <>
            <span style={{ color: '#E4E4E4' }}>|</span>
            <span>Rows per page</span>
          </>
        )}
        <select
          aria-label="Rows per page"
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          style={{
            border: '1px solid #E4E4E4',
            borderRadius: '8px',
            padding: '4px 8px',
            backgroundColor: 'white',
            color: 'rgba(28, 29, 31, 0.7)',
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
            paddingRight: '24px'
          }}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="text"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #E4E4E4',
            borderRadius: '8px',
            opacity: canGoPrev ? 1 : 0.4
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.7">
              <path d="M15 20L7 12L15 4" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </svg>
        </Button>
        <span
          style={{
            fontSize: isMobile ? '13px' : '14px',
            color: 'rgba(28, 29, 31, 0.5)',
            padding: '0 8px',
            minWidth: '40px',
            textAlign: 'center'
          }}
        >
          {currentPage}/{totalPages}
        </span>
        <Button
          type="text"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #E4E4E4',
            borderRadius: '8px',
            opacity: computedCanGoNext ? 1 : 0.4
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.7">
              <path d="M9 20L17 12L9 4" stroke="#1C1D1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          </svg>
        </Button>
      </div>
    </div>
  )
}
