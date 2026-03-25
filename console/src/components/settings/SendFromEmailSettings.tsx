import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'
import { User } from '../../services/api/types'

export function SendFromEmailSettings({ workspaceId , settings, user}: { workspaceId: string, settings: UserSetting[], user: User }) {
   const [sendFromEmail, setSendFromEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load sendFromEmail from settings if exists
  useEffect(() => {
    const sendFromEmailSetting = settings.find(s => s.code === 'send_from_email')
    if(!sendFromEmailSetting){
      setSendFromEmail(user.email)
    }
    if (sendFromEmailSetting) {
      setSendFromEmail(sendFromEmailSetting.value)
    }
  }, [settings, user])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "send_from_email",
            "value": sendFromEmail
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
        title="Email From"
        description="Define your email from"
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input
          placeholder="Enter your email from"
          type='email'
          value={sendFromEmail}
          onChange={(e) => setSendFromEmail(e.target.value)}
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