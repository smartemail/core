import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'


export function BusinessNameSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load businessName from settings if exists
  useEffect(() => {
    const businessNameSetting = settings.find(s => s.code === 'business_name')
    if (businessNameSetting) {
      setBusinessName(businessNameSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "business_name",
            "value": businessName
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
        title="Business Name"
        description="Define your business name"
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input
          placeholder="Enter your business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
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
