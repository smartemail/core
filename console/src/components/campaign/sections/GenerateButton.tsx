import { DiamondIcon } from '../../settings/SettingsIcons'

interface GenerateButtonProps {
  isGenerated: boolean
  isGenerating: boolean
  disabled: boolean
  creditCost: number
  creditsTotal: number | null
  onClick?: () => void
  isGuestMode?: boolean
}

function SparkleIcon({ size = 24, color = '#FAFAFA' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4C10 7.31371 7.31371 10 4 10C7.31371 10 10 12.6863 10 16C10 12.6863 12.6863 10 16 10C12.6863 10 10 7.31371 10 4Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 15C17.5 16.3807 16.3807 17.5 15 17.5C16.3807 17.5 17.5 18.6193 17.5 20C17.5 18.6193 18.6193 17.5 20 17.5C18.6193 17.5 17.5 16.3807 17.5 15Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GenerateButton({
  isGenerated,
  isGenerating,
  disabled,
  creditCost,
  creditsTotal,
  onClick,
  isGuestMode = false,
}: GenerateButtonProps) {
  const isDisabled = disabled || isGenerating
  const isActive = !isDisabled

  return (
    <div>
      <div
        onClick={isDisabled ? undefined : onClick}
        style={{
          height: 50,
          borderRadius: 10,
          background: isActive ? '#2F6DFB' : 'rgba(28,29,31,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 20,
          paddingRight: 5,
          paddingTop: 5,
          paddingBottom: 5,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left: sparkle icon + text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          <SparkleIcon size={24} color={isActive ? '#FAFAFA' : '#1C1D1F'} />
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: isActive ? '#FAFAFA' : '#1C1D1F',
            }}
          >
            {isGenerating ? 'Generating...' : isGenerated ? 'Re-generate email' : 'Generate email'}
          </span>
        </div>

        {/* Right: credit badge */}
        {!isGuestMode && (
          <div
            style={{
              background: '#FAFAFA',
              borderRadius: 5,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '0 15px',
            }}
          >
            <DiamondIcon size={20} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', letterSpacing: 0.28, textTransform: 'uppercase' }}>
              {creditCost}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', opacity: 0.3, letterSpacing: 0.28 }}>
              /
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', opacity: 0.3, letterSpacing: 0.28, textTransform: 'uppercase' }}>
              {creditsTotal ?? 0}
            </span>
          </div>
        )}

        {/* Decorative gradient ellipse */}
        <div
          style={{
            position: 'absolute',
            left: -210,
            top: -83,
            width: 210,
            height: 210,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(47,109,251,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
