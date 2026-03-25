import { useEffect, useState } from 'react'
import smLogo from '../../assets/sm_logo.gif'

const overlayKeyframes = `
@keyframes progress-fill {
  0% { width: 0%; }
  100% { width: 100%; }
}
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
`

interface GeneratingOverlayProps {
  isGenerating: boolean
}

const statusMessages = [
  'Crafting your email layout…',
  'Writing engaging copy…',
  'Optimizing structure for readability…',
  'Designing a clean email layout…',
  'Polishing your message…',
  'Making your email mobile-friendly…',
  'Adding smart content sections…',
  'Fine-tuning the email design…',
  'Preparing a high-quality email…',
  'Almost ready — final touches…',
]

export function GeneratingOverlay({ isGenerating }: GeneratingOverlayProps) {
  const [visible, setVisible] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (isGenerating) {
      setVisible(true)
      setMessageIndex(0)
    } else {
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isGenerating])

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, statusMessages.length - 1))
    }, 4500)
    return () => clearInterval(interval)
  }, [isGenerating])

  if (!visible) return null

  return (
    <>
      <style>{overlayKeyframes}</style>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          opacity: isGenerating ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            background: '#FAFAFA',
            borderRadius: 16,
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Logo animation */}
          <img src={smLogo} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />

          {/* Progress bar */}
          <div
            style={{
              width: 200,
              height: 6,
              background: '#E8EAED',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #2F6DFB 0%, #60A5FA 50%, #2F6DFB 100%)',
                backgroundSize: '200% 100%',
                animation: 'progress-fill 20s ease-in-out forwards',
              }}
            />
          </div>

          {/* Text */}
          <div style={{ position: 'relative', height: 20, width: 260 }}>
            <span
              key={messageIndex}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 14,
                color: '#1C1D1F',
                fontWeight: 500,
                animation: 'fade-in-up 0.4s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {statusMessages[messageIndex]}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
