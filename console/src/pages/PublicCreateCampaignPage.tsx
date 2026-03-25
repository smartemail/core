import { App } from 'antd'
import { CampaignPageContent } from './CreateCampaignPage'
import type { Workspace } from '../services/api/types'

const guestWorkspace: Workspace = {
  id: 'guest',
  name: 'Guest',
  settings: {
    timezone: 'UTC',
    email_tracking_enabled: false,
  },
  created_at: '',
  updated_at: '',
}

export function PublicCreateCampaignPage() {
  return (
    <App>
      <CampaignPageContent
        workspace={guestWorkspace}
        isGuestMode={true}
      />
    </App>
  )
}
