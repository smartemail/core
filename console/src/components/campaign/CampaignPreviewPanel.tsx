import { GeneratingOverlay } from './GeneratingOverlay'

function DesktopIcon({ active }: { active: boolean }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 19H21M6 17H18C19.1046 17 20 16.1046 20 15V8C20 6.89543 19.1046 6 18 6H6C4.89543 6 4 6.89543 4 8V15C4 16.1046 4.89543 17 6 17Z"
        stroke={active ? '#FAFAFA' : '#1C1D1F'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MobileIcon({ active }: { active: boolean }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 18H12.012M6 5L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L18 5C18 3.89543 17.1046 3 16 3L8 3C6.89543 3 6 3.89543 6 5Z"
        stroke={active ? '#FAFAFA' : '#1C1D1F'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path
        d="M9 4H3C1.89543 4 1 4.89543 1 6V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V11M6 14V11.5L14.75 2.75C15.4404 2.05964 16.5596 2.05964 17.25 2.75C17.9404 3.44036 17.9404 4.55964 17.25 5.25L12.5 10L8.5 14H6Z"
        stroke="#1C1D1F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface CampaignPreviewPanelProps {
  compiledHtml: string
  previewMode: 'desktop' | 'mobile'
  onPreviewModeChange: (mode: 'desktop' | 'mobile') => void
  isGenerated: boolean
  isGenerating: boolean
  isMobile?: boolean
  onEdit?: () => void
}

export function CampaignPreviewPanel({
  compiledHtml,
  previewMode,
  onPreviewModeChange,
  isGenerated,
  isGenerating,
  isMobile = false,
  onEdit,
}: CampaignPreviewPanelProps) {
  const iframeWidth = isMobile ? '100%' : previewMode === 'mobile' ? 375 : '100%'

  return (
    <div
      style={{
        flex: 1,
        background: '#F2F2F2',
        backgroundImage: 'radial-gradient(circle, #E4E4E4 1px, transparent 1px)',
        backgroundSize: '15px 15px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Generating overlay */}
      <GeneratingOverlay isGenerating={isGenerating} />

      {/* Email Preview */}
      {isGenerated && compiledHtml ? (
        <div
          style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'auto',
            padding: previewMode === 'mobile' ? isMobile ? 10 : 20 : 0,
          }}
        >
          <iframe
            srcDoc={compiledHtml}
            style={{
              width: iframeWidth,
              height: '100%',
              border: 'none',
              background: '#FFFFFF',
              borderRadius: previewMode === 'mobile' ? 8 : 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
            title="Email Preview"
          />
        </div>
      ) : !isGenerating ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="200" height="152" viewBox="0 0 200 152" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_i_20_7404)">
              <path d="M0.401405 132.359C0.401405 129.911 1.30893 127.909 3.12397 126.353C4.95066 124.784 7.28346 124 10.1224 124C12.9613 124 15.2127 124.749 16.8764 126.246C18.5402 127.743 19.3721 129.769 19.3721 132.323H13.6129C13.6129 131.385 13.2929 130.642 12.653 130.095C12.013 129.537 11.1462 129.258 10.0526 129.258C8.8658 129.258 7.92338 129.519 7.22528 130.042C6.53882 130.553 6.19559 131.254 6.19559 132.145C6.19559 132.953 6.40502 133.577 6.82388 134.017C7.24273 134.444 7.92338 134.765 8.8658 134.979L12.8275 135.817C15.201 136.316 16.9579 137.171 18.0981 138.383C19.2383 139.595 19.8084 141.259 19.8084 143.374C19.8084 145.976 18.8835 148.067 17.0335 149.647C15.1952 151.216 12.7577 152 9.72097 152C6.7657 152 4.40382 151.245 2.63531 149.736C0.878436 148.227 0 146.208 0 143.677H5.75928C5.75928 144.663 6.10251 145.423 6.78897 145.958C7.48707 146.481 8.47604 146.742 9.75588 146.742C11.0706 146.742 12.1061 146.493 12.8624 145.994C13.6303 145.495 14.0143 144.817 14.0143 143.962C14.0143 143.213 13.8281 142.637 13.4558 142.233C13.0835 141.817 12.461 141.52 11.5884 141.342L7.53942 140.504C2.78074 139.518 0.401405 136.803 0.401405 132.359Z" fill="#D9D9D9"/>
              <path d="M26.7482 151.519H21.146V124.499H26.7482L34.6192 144.657L42.5077 124.499H48.1972V151.519H42.5775V145.869C42.5775 142.827 42.5891 140.789 42.6124 139.756C42.6473 138.722 42.7346 137.718 42.8742 136.743L37.2545 151.519H31.9665L26.3992 136.743C26.6319 138.241 26.7482 140.647 26.7482 143.962V151.519Z" fill="#D9D9D9"/>
              <path d="M54.8228 151.519H48.7668L58.2085 124.499H63.8631L73.2525 151.519H67.1093L65.2593 145.833H56.7076L54.8228 151.519ZM60.2854 135.086L58.3831 140.861H63.6013L61.7165 135.086C61.2976 133.743 61.0591 132.87 61.0009 132.466C60.9078 133.013 60.6693 133.886 60.2854 135.086Z" fill="#D9D9D9"/>
              <path d="M79.6163 151.519H73.8396V124.499H84.0492C87.2721 124.499 89.7561 125.265 91.5014 126.798C93.2583 128.319 94.1367 130.476 94.1367 133.268C94.1367 136.749 92.6707 139.257 89.7387 140.789L94.381 151.519H88.0633L84.0841 142.073H79.6163V151.519ZM79.6163 129.757V136.886H84.0143C85.2825 136.886 86.2657 136.571 86.9638 135.941C87.6735 135.312 88.0284 134.421 88.0284 133.268C88.0284 132.139 87.6851 131.272 86.9987 130.666C86.3122 130.06 85.3291 129.757 84.0492 129.757H79.6163Z" fill="#D9D9D9"/>
              <path d="M93.5545 129.989V124.499H114.358V129.989H106.853V151.519H101.059V129.989H93.5545Z" fill="#D9D9D9"/>
              <path d="M127.888 151.519H122.286V124.499H127.888L135.759 144.657L143.648 124.499H149.337V151.519H143.717V145.869C143.717 142.827 143.729 140.789 143.752 139.756C143.787 138.722 143.875 137.718 144.014 136.743L138.395 151.519H133.106L127.539 136.743C127.772 138.241 127.888 140.647 127.888 143.962V151.519Z" fill="#D9D9D9"/>
              <path d="M155.963 151.519H149.907L159.349 124.499H165.003L174.392 151.519H168.249L166.399 145.833H157.848L155.963 151.519ZM161.425 135.086L159.523 140.861H164.741L162.856 135.086C162.438 133.743 162.199 132.87 162.141 132.466C162.048 133.013 161.809 133.886 161.425 135.086Z" fill="#D9D9D9"/>
              <path d="M180.756 124.499V151.519H174.98V124.499H180.756Z" fill="#D9D9D9"/>
              <path d="M189.563 124.499V146.047H200V151.519H183.787V124.499H189.563Z" fill="#D9D9D9"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M110 0C124.001 0 131.002 -0.00022769 136.35 2.72461C141.054 5.12142 144.879 8.94599 147.275 13.6499C150 18.9977 150 25.9987 150 40V60C150 74.0013 150 81.0023 147.275 86.3501C144.879 91.054 141.054 94.8786 136.35 97.2754C131.002 100 124.001 100 110 100H90C75.9987 100 68.9977 100 63.6499 97.2754C58.946 94.8786 55.1214 91.054 52.7246 86.3501C49.9998 81.0023 50 74.0013 50 60V40C50 25.9987 49.9998 18.9977 52.7246 13.6499C55.1214 8.94599 58.946 5.12142 63.6499 2.72461C68.9977 -0.00022769 75.9987 0 90 0H110ZM101.931 22.5C98.2073 22.5 94.9655 23.1717 92.207 24.5166C89.4484 25.8119 87.3107 27.7068 85.7935 30.1978C84.2764 32.6885 83.5181 35.6522 83.5181 39.0894C83.5181 41.7298 83.9307 43.9721 84.7583 45.8154C85.5859 47.6089 86.6672 49.1281 88.0005 50.3735C89.3797 51.5691 90.8738 52.5906 92.4829 53.4375C94.0919 54.2843 95.7006 55.0077 97.3096 55.6055C98.9643 56.2031 100.459 56.7998 101.792 57.3975C103.171 57.9453 104.275 58.5938 105.103 59.3408C105.93 60.0383 106.345 60.9352 106.345 62.0312C106.345 63.1269 105.862 63.9984 104.897 64.646C103.932 65.2438 102.505 65.5444 100.62 65.5444C98.3675 65.5444 96.2517 65.07 94.2749 64.1235C92.2982 63.1272 90.4135 61.7063 88.6206 59.8633L80 69.2041C82.6207 72.0936 85.4718 74.2115 88.5522 75.5566C91.6785 76.8518 95.3331 77.4999 99.5166 77.5C105.999 77.5 111.011 76.0299 114.551 73.0908C118.137 70.1017 119.932 65.8917 119.932 60.4614C119.932 57.7714 119.516 55.4794 118.689 53.5864C117.861 51.6936 116.758 50.1247 115.378 48.8794C114.045 47.5842 112.573 46.5368 110.964 45.7397C109.356 44.8932 107.724 44.1719 106.069 43.5742C104.46 42.9765 102.966 42.4034 101.587 41.8555C100.254 41.3075 99.1723 40.7087 98.3447 40.061C97.5174 39.3637 97.1047 38.4922 97.1045 37.4463C97.1045 36.4499 97.5171 35.7008 98.3447 35.2026C99.218 34.7047 100.367 34.4557 101.792 34.4556C103.585 34.4556 105.241 34.855 106.758 35.6519C108.275 36.3991 109.794 37.5708 111.311 39.165L120 29.8242C117.931 27.4829 115.311 25.6888 112.139 24.4434C109.012 23.1481 105.609 22.5 101.931 22.5ZM130 10C124.477 10 120 14.4772 120 20C120 25.5228 124.477 30 130 30C135.523 30 140 25.5228 140 20C140 14.4772 135.523 10 130 10Z" fill="#D9D9D9"/>
            </g>
            <defs>
              <filter id="filter0_i_20_7404" x="0" y="0" width="200" height="152" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="1"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.623723 0 0 0 0 0.623723 0 0 0 0 0.623723 0 0 0 0.3 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_20_7404"/>
              </filter>
            </defs>
          </svg>
        </div>
      ) : null}

      {/* Bottom controls */}
      {isGenerated && !isMobile && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {/* Desktop / Mobile toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#F4F4F5',
              border: '1px solid #E4E4E4',
              borderRadius: 10,
              padding: 5,
              height: 40,
            }}
          >
            <div
              onClick={() => onPreviewModeChange('desktop')}
              style={{
                width: 30,
                height: 30,
                borderRadius: 5,
                background: previewMode === 'desktop' ? '#2F6DFB' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s, opacity 0.15s',
                opacity: previewMode === 'desktop' ? 1 : 0.3,
              }}
            >
              <DesktopIcon active={previewMode === 'desktop'} />
            </div>
            <div
              onClick={() => onPreviewModeChange('mobile')}
              style={{
                width: 30,
                height: 30,
                borderRadius: 5,
                background: previewMode === 'mobile' ? '#2F6DFB' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s, opacity 0.15s',
                opacity: previewMode === 'mobile' ? 1 : 0.3,
              }}
            >
              <MobileIcon active={previewMode === 'mobile'} />
            </div>
          </div>

          {/* Edit button */}
          <div
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FAFAFA',
              border: '1px solid #1C1D1F',
              borderRadius: 10,
              padding: '0 15px',
              height: 40,
              cursor: 'pointer',
            }}
          >
            <EditIcon />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F' }}>Edit</span>
          </div>
        </div>
      )}
    </div>
  )
}
