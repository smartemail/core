import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'


export function WebsiteUrlSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
   const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load websiteUrl from settings if exists
  useEffect(() => {
    const websiteUrlSetting = settings.find(s => s.code === 'website_url')
    if (websiteUrlSetting) {
      setWebsiteUrl(websiteUrlSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "website_url",
            "value": websiteUrl
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
        title="Website URL"
        description="Define your website URL"
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input
          placeholder="Enter your website URL"
          type='url'
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
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