import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input, Select } from 'antd'

export function FontsSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
const [fonts, setFonts] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load fonts from settings if exists
  useEffect(() => {
    const fontsSetting = settings.find(s => s.code === 'fonts')
    if (fontsSetting) {
      setFonts(fontsSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "fonts",
            "value": fonts
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
        title="Fonts"
        description="Define your fonts"
      />

      <div className="flex flex-col gap-3 mt-4">

      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Select font families"
        value={fonts ? fonts.split(',').map(f => f.trim()).filter(Boolean) : []}
        onChange={(values) => setFonts(values.join(', '))}
        options={[
          { label: 'Arial', value: 'Arial' },
          { label: 'Helvetica', value: 'Helvetica' },
          { label: 'Times New Roman', value: 'Times New Roman' },
          { label: 'Georgia', value: 'Georgia' },
          { label: 'Verdana', value: 'Verdana' },
          { label: 'Roboto', value: 'Roboto' },
          { label: 'Open Sans', value: 'Open Sans' },
          { label: 'Lato', value: 'Lato' },
          { label: 'Montserrat', value: 'Montserrat' },
          { label: 'Poppins', value: 'Poppins' },
          { label: 'Inter', value: 'Inter' },
          { label: 'Playfair Display', value: 'Playfair Display' },
          { label: 'Merriweather', value: 'Merriweather' },
          { label: 'Source Sans Pro', value: 'Source Sans Pro' },
          { label: 'Oswald', value: 'Oswald' },
        ]}
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