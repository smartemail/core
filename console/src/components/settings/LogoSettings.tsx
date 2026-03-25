import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'
import { Upload } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'


export function LogoSettings({ workspaceId, settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
  const [logo, setLogo] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load Logo from settings if exists
  useEffect(() => {
    const logoSetting = settings.find(s => s.code === 'logo')
    if (logoSetting) {
      setLogo(logoSetting.value)
    }
  }, [settings])


  return (
    <>
      <SettingsSectionHeader
        title="Business logo"
        description="Business logo for sending in the mail."
      />

      <div className="flex flex-col gap-3 mt-4">
        {logo && (
          <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
        )}
        {logo && (
          <Button
            type="primary"
            danger
            size="small"
            className="mt-2 w-24"
            onClick={async () => {
              const confirmed = window.confirm('Are you sure you want to remove the logo?')
              if (!confirmed) {
                return
              }

              setLoading(true)
              setSuccess(false)
              try {
                const data: UserSetting[] = [
                  {
                    code: 'logo',
                    value: ''
                  }
                ]
                await userSettingService.updateUserSettings(data)
                setLogo('')
                onSettingUpdate()
                setSuccess(true)
              } catch (err) {
                console.error(err)
              } finally {
                setLoading(false)
              }
            }}
          >
            Delete logo
          </Button>
        )}
        {!logo && (
        <Upload
          multiple={false}
          showUploadList={false}
          accept="image/*"
          beforeUpload={(file) => {
            if (!file.type.startsWith('image/')) {
              return Upload.LIST_IGNORE
            }
            return true
          }}
          customRequest={async ({ file }) => {
            try {
              setLoading(true)
              const formData = new FormData()
              formData.append('logo', file)
              await userSettingService.updateUserLogo(formData)
              setLoading(false)
              setSuccess(true)
              onSettingUpdate()
            } catch (err) {
              console.log(err)
              setLoading(false)
            }
          }}
        >
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={loading}
            style={{
              backgroundColor: '#2F6DFB',
              borderRadius: '10px',
              fontWeight: 700
            }}
          >
            {loading ? 'Uploading...' : 'Upload logo'}
          </Button>
        </Upload>
        )}

        {success && (
          <div className="text-green-600 text-sm">Saved successfully</div>
        )}
      </div>
    </>
  )
}
