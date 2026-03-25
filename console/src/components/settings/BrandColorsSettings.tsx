import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'


export function BrandColorsSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
  const [colors, setColors] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load colors from settings if exists
  useEffect(() => {
    const brandColorSetting = settings.find(s => s.code === 'brand_colors')
    if (brandColorSetting) {
      setColors(brandColorSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "brand_colors",
            "value": colors
          }
      ]
      await userSettingService.updateUserSettings(data)
       onSettingUpdate()
      setSuccess(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SettingsSectionHeader
        title="Brand colors"
        description="List your brand colors"
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input.TextArea
          placeholder="Enter your brand colors"
          value={colors}
          rows={10}
          onChange={(e) => setColors(e.target.value)}
        />


        <Button type="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>

        {success && (
          <div className="text-green-600 text-sm">Saved successfully</div>
        )}
      </div>
    </>
  )
}
