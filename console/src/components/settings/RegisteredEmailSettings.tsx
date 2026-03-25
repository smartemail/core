import { SettingsSectionHeader } from './SettingsSectionHeader'
import { UserSetting } from '../../services/api/user_setting'
import { User } from '../../services/api/types'

export function RegisteredEmailSettings({ workspaceId , settings,  user }: { workspaceId: string, settings: UserSetting[], user: User  }) {
  return (
    <>
      <SettingsSectionHeader title="Registered Email" description="Your registered email" />
      <div>
        <div><b>{user.email}</b></div>
      </div>
    </>
  )
}
