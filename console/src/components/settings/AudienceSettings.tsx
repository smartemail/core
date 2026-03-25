import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'

export function AudienceSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
const [audience, setaudience] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load audience from settings if exists
  useEffect(() => {
    const audienceSetting = settings.find(s => s.code === 'audience')
    if (audienceSetting) {
      setaudience(audienceSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "audience",
            "value": audience
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
        title="Audience"
        description="Define your audience"
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input.TextArea
          placeholder="Enter your audience"
          value={audience}
          rows={10}
          onChange={(e) => setaudience(e.target.value)}
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