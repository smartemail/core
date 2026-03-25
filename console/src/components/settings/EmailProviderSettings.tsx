import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Radio, Select } from 'antd'
import { User } from '../../services/api/types'

export function EmailProviderSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
  const [emailProvider, setEmailProvider] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
  
    // Load emailProvider from settings if exists
    useEffect(() => {
      const emailProviderSetting = settings.find(s => s.code === 'email_provider')
      if (emailProviderSetting) {
        setEmailProvider(emailProviderSetting.value)
      } else {
        if(user.registration_type === 'gmail'){
          setEmailProvider('gmail')
        } else {
          setEmailProvider('sendgrid')
        }
      }
    }, [settings])
  
  
    const handleSubmit = async () => {
      setLoading(true)
      setSuccess(false)
  
      try {
  
        const data: UserSetting[] = [
            {
              "code": "email_provider",
              "value": emailProvider
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
          title="Email provider"
          description="Define your email provider"
        />
  
        <div className="flex flex-col gap-3 mt-4">
          
        <Radio.Group 
          value={emailProvider} 
          onChange={(e) => setEmailProvider(e.target.value)}
        >
          <Radio value="sendgrid">SendGrid</Radio>
          {user.registration_type === "gmail" && <Radio value="gmail">Gmail</Radio>}
        </Radio.Group>
       
        
  
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