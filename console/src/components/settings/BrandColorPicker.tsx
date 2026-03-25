import { useState } from 'react'
import { ColorPicker, Button, Input } from 'antd'
import type { ColorPickerProps } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

interface BrandColorPickerProps {
  colors: string[]
  onChange: (colors: string[]) => void
}

/** Normalise any hex from ColorPicker (may include alpha) to 7-char #RRGGBB */
function normalizeHex(hex: string): string {
  const h = hex.toLowerCase()
  if (h.length === 9) return h.slice(0, 7) // strip alpha
  return h
}

export function BrandColorPicker({ colors, onChange }: BrandColorPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#4F46E5')
  const [hexInput, setHexInput] = useState('#4F46E5')

  const handleAddColor = () => {
    const norm = normalizeHex(selectedColor)
    if (norm && !colors.includes(norm)) {
      onChange([...colors, norm])
    }
    setPickerOpen(false)
  }

  const handleRemoveColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index))
  }

  const handleColorChange = (color: { toHexString: () => string }) => {
    const hex = normalizeHex(color.toHexString())
    setSelectedColor(hex)
    setHexInput(hex)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setSelectedColor(val.toLowerCase())
    }
  }

  const r = parseInt(selectedColor.slice(1, 3), 16)
  const g = parseInt(selectedColor.slice(3, 5), 16)
  const b = parseInt(selectedColor.slice(5, 7), 16)

  const panelRender: ColorPickerProps['panelRender'] = (
    _,
    { components: { Picker } },
  ) => (
    <div style={{ width: 280 }}>
      {/* Hide built-in ColorInput that comes inside Picker */}
      <style>{`
        .brand-color-picker .ant-color-picker-input-container {
          display: none !important;
        }
      `}</style>
      <div className="brand-color-picker">
        <Picker />
      </div>

      {/* Custom Hex + RGB inputs */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1D1F', opacity: 0.5, marginBottom: 4 }}>Hex</div>
          <Input
            value={hexInput}
            onChange={handleHexInputChange}
            style={{ borderRadius: 8, height: 36 }}
          />
        </div>
        <div style={{ width: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1D1F', opacity: 0.5, marginBottom: 4 }}>R</div>
          <Input value={r} readOnly style={{ borderRadius: 8, height: 36, textAlign: 'center' }} />
        </div>
        <div style={{ width: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1D1F', opacity: 0.5, marginBottom: 4 }}>G</div>
          <Input value={g} readOnly style={{ borderRadius: 8, height: 36, textAlign: 'center' }} />
        </div>
        <div style={{ width: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1D1F', opacity: 0.5, marginBottom: 4 }}>B</div>
          <Input value={b} readOnly style={{ borderRadius: 8, height: 36, textAlign: 'center' }} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <Button onClick={() => setPickerOpen(false)} style={{ borderRadius: 8, height: 36 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleAddColor} style={{ borderRadius: 8, height: 36 }}>
          + Add Color
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      {colors.map((color, index) => (
        <div
          key={index}
          className="relative group cursor-pointer"
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: color,
            border: '2px solid #e5e7eb',
          }}
          onClick={() => handleRemoveColor(index)}
        >
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          >
            <DeleteOutlined style={{ color: '#fff', fontSize: 14 }} />
          </div>
        </div>
      ))}

      <ColorPicker
        value={selectedColor}
        onChange={handleColorChange}
        onChangeComplete={handleColorChange}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        placement="bottomRight"
        disabledAlpha
        panelRender={panelRender}
        styles={{ popupOverlayInner: { padding: 16 } }}
      >
        <div
          className="flex items-center justify-center cursor-pointer"
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '2px solid #E7E7E7',
            background: '#F4F4F5',
          }}
        >
          <PlusOutlined style={{ color: '#1C1D1F', fontSize: 16 }} />
        </div>
      </ColorPicker>
    </div>
  )
}
