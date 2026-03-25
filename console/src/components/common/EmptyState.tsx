import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        gap: '20px',
        height: '100%',
      }}
    >
      <div>{icon}</div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#1C1D1F',
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(28, 29, 31, 0.5)',
            maxWidth: '400px',
          }}
        >
          {description}
        </div>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export const ContactsIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M49.347 50.6663H53.3334C56.2789 50.6663 58.8451 48.2023 57.9093 45.4093C56.4833 41.153 52.9748 38.579 46.8072 37.6874M38.667 28.9716C39.4429 29.2169 40.3317 29.333 41.3334 29.333C45.7778 29.333 48 27.0473 48 21.333C48 15.6187 45.7778 13.333 41.3334 13.333C40.3317 13.333 39.4429 13.4491 38.667 13.6944M25.3333 37.333C36.7479 37.333 41.8483 41.1107 42.575 48.6662C42.6807 49.7657 41.7712 50.6663 40.6667 50.6663H10C8.89543 50.6663 7.98594 49.7657 8.09169 48.6662C8.81833 41.1107 13.9187 37.333 25.3333 37.333ZM25.3333 29.333C29.7778 29.333 32 27.0473 32 21.333C32 15.6187 29.7778 13.333 25.3333 13.333C20.8889 13.333 18.6667 15.6187 18.6667 21.333C18.6667 27.0473 20.8889 29.333 25.3333 29.333Z" stroke="#2F6DFB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const EnvelopeIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 21.333L30.8906 36.5934C31.5624 37.0413 32.4376 37.0413 33.1094 36.5934L56 21.333M10 50.6663H54C55.1046 50.6663 56 49.7709 56 48.6663V15.333C56 14.2284 55.1046 13.333 54 13.333H10C8.89543 13.333 8 14.2284 8 15.333V48.6663C8 49.7709 8.89543 50.6663 10 50.6663Z" stroke="#2F6DFB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const ImageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.667 45.3337L20.2392 36.7186C22.3477 34.8211 25.5725 34.9059 27.5783 36.9116L30.667 40.0003L40.2291 30.4382C42.3119 28.3554 45.6888 28.3554 47.7716 30.4382L53.3337 36.0003M29.3337 24.0003C29.3337 25.4731 28.1398 26.667 26.667 26.667C25.1942 26.667 24.0003 25.4731 24.0003 24.0003C24.0003 22.5276 25.1942 21.3337 26.667 21.3337C28.1398 21.3337 29.3337 22.5276 29.3337 24.0003ZM16.0003 53.3337H48.0003C50.9458 53.3337 53.3337 50.9458 53.3337 48.0003V16.0003C53.3337 13.0548 50.9458 10.667 48.0003 10.667H16.0003C13.0548 10.667 10.667 13.0548 10.667 16.0003V48.0003C10.667 50.9458 13.0548 53.3337 16.0003 53.3337Z" stroke="#2F6DFB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
