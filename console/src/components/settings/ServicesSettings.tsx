import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'

export function ServicesSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
  const [services, setservices] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load services from settings if exists
  useEffect(() => {
    const servicesSetting = settings.find(s => s.code === 'services')
    if (servicesSetting) {
      setservices(servicesSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "services",
            "value": services
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
        title="Services"
        description="List your services"
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input.TextArea
          placeholder="Enter your services"
          value={services}
          rows={10}
          onChange={(e) => setservices(e.target.value)}
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