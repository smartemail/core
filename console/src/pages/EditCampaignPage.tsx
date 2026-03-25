import { useParams } from '@tanstack/react-router'
import { App } from 'antd'
import Lottie from 'lottie-react'
import loaderAnimation from '../assets/loader.json'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { templatesApi } from '../services/api/template'
import { CampaignPageContent } from './CreateCampaignPage'

export function EditCampaignPage() {
  const { workspaceId, templateId } = useParams({ from: '/workspace/$workspaceId/campaign/$templateId/edit' })
  const { workspaces } = useAuth()
  const workspace = workspaces.find((w) => w.id === workspaceId)

  const { data, isLoading } = useQuery({
    queryKey: ['template', workspaceId, templateId],
    queryFn: () => templatesApi.get({ workspace_id: workspaceId, id: templateId }),
    enabled: !!workspaceId && !!templateId,
  })

  if (!workspace) {
    return null
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Lottie animationData={loaderAnimation} loop style={{ width: 120, height: 120 }} />
      </div>
    )
  }

  if (!data?.template) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Template not found
      </div>
    )
  }

  return (
    <App>
      <CampaignPageContent workspace={workspace} existingTemplate={data.template} />
    </App>
  )
}
