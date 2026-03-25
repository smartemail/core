import { DiamondIcon } from '../../settings/SettingsIcons'

interface SendScheduleButtonProps {
  onClick: () => void
  audienceCount: number | undefined
  creditsLeft: number
  disabled?: boolean
}

function SendIcon({ color = '#FAFAFA' }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 14L14 21L21 3M10 14L3 10L21 3M10 14L21 3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SendScheduleButton({ onClick, audienceCount, creditsLeft, disabled }: SendScheduleButtonProps) {
  const isActive = !disabled

  return (
    <div
      onClick={disabled ? undefined : onClick}
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
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left: icon + text */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <SendIcon color={isActive ? '#FAFAFA' : '#1C1D1F'} />
        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: isActive ? '#FAFAFA' : '#1C1D1F',
          }}
        >
          Send or Schedule
        </span>
      </div>

      {/* Right: credit badge */}
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
        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', letterSpacing: 0.28 }}>
          {audienceCount ?? 0}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', opacity: 0.3, letterSpacing: 0.28 }}>
          /
        </span>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F', opacity: 0.3, letterSpacing: 0.28 }}>
          {creditsLeft}
        </span>
      </div>

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
  )
}
