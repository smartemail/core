import { useState, useRef, useEffect } from 'react'
import { DownOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons'
import type { Segment } from '../../../services/api/segment'

interface AudienceMultiSelectProps {
  segments: Segment[]
  selectedSegmentIds: string[]
  onChange: (ids: string[]) => void
  totalContacts: number | undefined
  fontSize?: number
}

const COLOR_MAP: Record<string, string> = {
  magenta: '#EB2F96',
  red: '#F5222D',
  volcano: '#FA541C',
  orange: '#FA8C16',
  gold: '#FAAD14',
  lime: '#A0D911',
  green: '#52C41A',
  cyan: '#13C2C2',
  blue: '#1677FF',
  geekblue: '#2F54EB',
  purple: '#722ED1',
  grey: '#8C8C8C',
}

/** Resolve Ant Design color name to hex, pass through hex values as-is */
const resolveColor = (color: string | undefined): string => {
  if (!color) return '#D9D9D9'
  return COLOR_MAP[color] ?? color
}

const chipStyle = (color: string): React.CSSProperties => {
  const hex = resolveColor(color)
  return {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    borderRadius: 5,
    border: `1px solid ${hex}`,
    background: `${hex}0D`,
    padding: '5px 5px 5px 10px',
    gap: 4,
    fontSize: 14,
    fontWeight: 500,
    color: '#1C1D1F',
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer',
  }
}

export function AudienceMultiSelect({
  segments,
  selectedSegmentIds,
  onChange,
  totalContacts,
}: AudienceMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSegment = (id: string) => {
    if (selectedSegmentIds.includes(id)) {
      onChange(selectedSegmentIds.filter((sid) => sid !== id))
    } else {
      onChange([...selectedSegmentIds, id])
    }
  }

  const removeSegment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onChange(selectedSegmentIds.filter((sid) => sid !== id))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const hasSelection = selectedSegmentIds.length > 0

  // Selected chips with × button
  const selectedChips = selectedSegmentIds.map((id) => {
    const segment = segments.find((s) => s.id === id)
    if (!segment) return null
    return (
      <span key={id} style={chipStyle(segment.color || '#D9D9D9')}>
        <span style={{ opacity: 0.76 }}>
          {segment.name}
          <span style={{ color: '#1C1D1F4D' }}>
            {' '}({(segment.users_count ?? 0).toLocaleString()})
          </span>
        </span>
        <span
          onClick={(e) => removeSegment(e, id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#1C1D1F0D',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <CloseOutlined style={{ fontSize: 8, color: '#1C1D1F', opacity: 0.4 }} />
        </span>
      </span>
    )
  })

  // Divider line
  const divider = (
    <div style={{ width: '100%', height: 0, borderTop: '1px solid #E7E7E7' }} />
  )

  // Clear row
  const clearRow = (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
      <span
        onClick={clearAll}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#2F6DFB',
          border: '1px solid #2F6DFB',
          borderRadius: 5,
          padding: '2px 5px 4px 5px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        Clear
      </span>
    </div>
  )

  if (isOpen) {
    return (
      <div ref={wrapperRef} style={{ position: 'relative' }}>
        <div
          style={{
            background: '#F4F4F5',
            border: '1px solid #E7E7E7',
            borderRadius: 10,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          {hasSelection ? (
            <>
              {/* Selected chips row + chevron */}
              <div
                onClick={() => setIsOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selectedChips}
                </div>
                <UpOutlined style={{ fontSize: 12, color: '#1C1D1F', opacity: 0.3, flexShrink: 0 }} />
              </div>
              {divider}
              {/* Unselected segment chips for additional selection */}
              {segments.filter((s) => !selectedSegmentIds.includes(s.id)).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {segments
                    .filter((s) => !selectedSegmentIds.includes(s.id))
                    .map((segment) => (
                      <span
                        key={segment.id}
                        onClick={() => toggleSegment(segment.id)}
                        style={chipStyle(segment.color || '#D9D9D9')}
                      >
                        <span style={{ opacity: 0.76 }}>
                          {segment.name}
                          <span style={{ color: '#1C1D1F4D' }}>
                            {' '}({(segment.users_count ?? 0).toLocaleString()})
                          </span>
                        </span>
                      </span>
                    ))}
                </div>
              )}
              {clearRow}
            </>
          ) : (
            <>
              {/* All Contacts header + chevron */}
              <div
                onClick={() => setIsOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1D1F' }}>
                  All Contacts
                  <span style={{ opacity: 0.3 }}>
                    {' '}({(totalContacts ?? 0).toLocaleString()})
                  </span>
                </span>
                <UpOutlined style={{ fontSize: 12, color: '#1C1D1F', opacity: 0.3 }} />
              </div>
              {divider}
              {/* Segment chips for selection */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {segments.map((segment) => (
                  <span
                    key={segment.id}
                    onClick={() => toggleSegment(segment.id)}
                    style={chipStyle(segment.color || '#D9D9D9')}
                  >
                    <span style={{ opacity: 0.76 }}>
                      {segment.name}
                      <span style={{ color: '#1C1D1F4D' }}>
                        {' '}({(segment.users_count ?? 0).toLocaleString()})
                      </span>
                    </span>
                  </span>
                ))}
              </div>
              {clearRow}
            </>
          )}
        </div>
      </div>
    )
  }

  // Closed state
  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(true)}
        style={{
          background: '#F4F4F5',
          border: '1px solid #E7E7E7',
          borderRadius: 10,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 5,
          cursor: 'pointer',
        }}
      >
        {!hasSelection ? (
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1C1D1F' }}>
            All Contacts
            <span style={{ opacity: 0.3 }}>
              {' '}({(totalContacts ?? 0).toLocaleString()})
            </span>
          </span>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {selectedChips}
          </div>
        )}
        <DownOutlined style={{ fontSize: 12, color: '#1C1D1F', opacity: 0.3, flexShrink: 0 }} />
      </div>
    </div>
  )
}
