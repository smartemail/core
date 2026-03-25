import { SettingsSectionHeader } from './SettingsSectionHeader'
import { UserSetting } from '../../services/api/user_setting'
import { pricingApi } from '../../services/api/pricing'
import { useEffect, useState } from 'react'

export function SubscriptionPlanSettings({ workspaceId , settings, onSettingUpdate }: { workspaceId: string, settings: UserSetting[], onSettingUpdate: () => void }) {

  const [plan, setPlan] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await pricingApi.subscription()
        setPlan(response.plan)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSubscription()
  }, [])


  return (
    <>
      <SettingsSectionHeader title="Subscription Plan" description="Manage your subscription plan" />
      <div>
        <div>Subscription plan: <b>{plan}</b></div>
      </div>
    </>
  )
}
