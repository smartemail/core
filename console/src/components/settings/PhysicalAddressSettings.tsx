import { useEffect, useState } from 'react'
import { SettingsSectionHeader } from './SettingsSectionHeader'
import { userSettingService, UserSetting } from '../../services/api/user_setting'
import { Button, Input } from 'antd'


export function PhysicalAddressSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {
  const [physicalAddress, setPhysicalAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load CompanyName from settings if exists
  useEffect(() => {
    const physicalAddressSetting = settings.find(s => s.code === 'physical_address')
    if (physicalAddressSetting) {
      setPhysicalAddress(physicalAddressSetting.value)
    }
  }, [settings])


  const handleSubmit = async () => {
    setLoading(true)
    setSuccess(false)

    try {

      const data: UserSetting[] = [
          {
            "code": "physical_address",
            "value": physicalAddress
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
        title="Physical Address"
        description="Street address or registered P.O. Box."
      />

      <div className="flex flex-col gap-3 mt-4">

        <Input
          placeholder="Enter your physical address"
          value={physicalAddress}
          onChange={(e) => setPhysicalAddress(e.target.value)}
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
