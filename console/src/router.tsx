import { useEffect } from 'react'
import { createRootRoute, createRoute, redirect, useParams, useNavigate } from '@tanstack/react-router'
import { RootLayout } from './layouts/RootLayout'
import { WorkspaceLayout } from './layouts/WorkspaceLayout'
import { AnalyticsLayout } from './layouts/AnalyticsLayout'
import { SignInPage } from './pages/SignInPage'
import { RegistrationPage } from './pages/RegistrationPage'
import { PricingPage } from './pages/PricingPage'
import { SuccessPage } from './pages/SuccessPage'
import { ActivatePage } from './pages/ActivatePage'
import { LogoutPage } from './pages/LogoutPage'
import { HomePage } from './pages/HomePage'
import { AcceptInvitationPage } from './pages/AcceptInvitationPage'
import { CreateWorkspacePage } from './pages/CreateWorkspacePage'
import { WorkspaceSettingsPage } from './pages/WorkspaceSettingsPage'
import { ContactsPage } from './pages/ContactsPage'
import { ListsPage } from './pages/ListsPage'
import { FileManagerPage } from './pages/FileManagerPage'
import { EmailsPage } from './pages/EmailsPage'
import { BroadcastsPage } from './pages/BroadcastsPage'
import { TransactionalNotificationsPage } from './pages/TransactionalNotificationsPage'
import { LogsPage } from './pages/LogsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { DebugSegmentPage } from './pages/DebugSegmentPage'
import { BlogPage } from './pages/BlogPage'
import { CreateTemplatePage } from './pages/CreateTemplatePage'
import { EditCampaignPage } from './pages/EditCampaignPage'
import { RestorePasswordPage } from './pages/RestorePasswordPage'
import { SetNewPasswordPage } from './pages/SetNewPasswordPage'
import { PublicCreateCampaignPage } from './pages/PublicCreateCampaignPage'
import { PublicPricingPage } from './pages/PublicPricingPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { TermsPage } from './pages/TermsPage'
import SetupWizard from './pages/SetupWizard'
import { createRouter } from '@tanstack/react-router'

export interface ContactsSearch {
  cursor?: string
  email?: string
  external_id?: string
  first_name?: string
  last_name?: string
  phone?: string
  country?: string
  language?: string
  list_id?: string
  contact_list_status?: string
  segments?: string[]
  limit?: number
}

export interface SignInSearch {
  email?: string
}

export interface RegistrationSearch {
  email?: string
}

export interface ActivateSearch {
  code?: string
}


export interface AcceptInvitationSearch {
  token?: string
}

export interface BlogSearch {
  status?: string
  category_id?: string
}

export interface AnalyticsSearch {
  period?: '7D' | '14D' | '30D' | '90D'
}

// Create the root route
const rootRoute = createRootRoute({
  component: RootLayout
})

// Create the index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
})

// Create the signin route
const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignInPage,
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    email: search.email as string | undefined
  })
})

// Create the registration route
const registrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registration',
  component: RegistrationPage,
  validateSearch: (search: Record<string, unknown>): RegistrationSearch => ({
    email: search.email as string | undefined
  })
})

// Create the restore password route
const restorePasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/restore-password',
  component: RestorePasswordPage
})

// Create the set new password route
const setNewPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/set-new-password',
  component: SetNewPasswordPage
})


// Create the public pricing route (no auth required)
const publicPricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PublicPricingPage
})

// Create the public create route (no auth required, guest mode)
const publicCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: PublicCreateCampaignPage,
})

// Create the privacy policy route
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPolicyPage
})

// Create the terms route
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage
})

// Create the workspace pricing route
const pricingRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/pricing',
  component: PricingPage
})

// Create the success route
const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  component: SuccessPage,
})

// Create the registration route
const activateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activate',
  component: ActivatePage,
  validateSearch: (search: Record<string, unknown>): ActivateSearch => ({
    code: search.code as string | undefined
  })
})

// Create the logout route
const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logout',
  component: LogoutPage
})

// Create the setup wizard route
const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  component: SetupWizard
})

// Create the accept invitation route
const acceptInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accept-invitation',
  component: AcceptInvitationPage,
  validateSearch: (search: Record<string, unknown>): AcceptInvitationSearch => ({
    token: search.token as string | undefined
  })
})

// Create the workspace create route
const workspaceCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace/create',
  component: CreateWorkspacePage
})

// Create the workspace route
const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace/$workspaceId',
  component: WorkspaceLayout
})

// Create the default workspace route — redirect to home
const workspaceIndexRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/' })
  },
})

// Create analytics layout route (pathless layout for campaigns/analytics tabs)
const analyticsLayoutRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  id: 'analytics-layout',
  component: AnalyticsLayout,
  validateSearch: (search: Record<string, unknown>): AnalyticsSearch => ({
    period: search.period as AnalyticsSearch['period']
  })
})

// Create workspace child routes under analytics layout
const workspaceBroadcastsRoute = createRoute({
  getParentRoute: () => analyticsLayoutRoute,
  path: '/broadcasts',
  component: BroadcastsPage
})

const workspaceListsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/lists',
  component: ListsPage
})

const workspaceFileManagerRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/file-manager',
  component: FileManagerPage
})

const workspaceTransactionalNotificationsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/transactional-notifications',
  component: TransactionalNotificationsPage
})

const workspaceLogsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/logs',
  component: LogsPage
})

export const workspaceContactsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/contacts',
  component: ContactsPage,
  validateSearch: (search: Record<string, unknown>): ContactsSearch => ({
    cursor: search.cursor as string | undefined,
    email: search.email as string | undefined,
    external_id: search.external_id as string | undefined,
    first_name: search.first_name as string | undefined,
    last_name: search.last_name as string | undefined,
    phone: search.phone as string | undefined,
    country: search.country as string | undefined,
    language: search.language as string | undefined,
    list_id: search.list_id as string | undefined,
    contact_list_status: search.contact_list_status as string | undefined,
    segments: Array.isArray(search.segments)
      ? (search.segments as string[])
      : search.segments
        ? [search.segments as string]
        : undefined,
    limit: search.limit ? Number(search.limit) : undefined
  })
})

const workspaceSettingsRedirectRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/settings',
  component: () => {
    const { workspaceId } = useParams({ from: '/workspace/$workspaceId/settings' })
    const navigate = useNavigate()

    useEffect(() => {
      navigate({
        to: '/workspace/$workspaceId/settings/$section',
        params: { workspaceId, section: 'subscription' },
        replace: true
      })
    }, [workspaceId, navigate])

    return null
  }
})

const workspaceSettingsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/settings/$section',
  component: WorkspaceSettingsPage
})

const workspaceCreateRoute2 = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/create',
  component: CreateTemplatePage,
})

const workspaceTemplatesRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/templates',
  component: EmailsPage
})

const workspaceCampaignEditRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/campaign/$templateId/edit',
  component: EditCampaignPage
})

const workspaceAnalyticsRoute = createRoute({
  getParentRoute: () => analyticsLayoutRoute,
  path: '/analytics',
  component: AnalyticsPage
})

const workspaceNewSegmentRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/debug-segment',
  component: DebugSegmentPage
})

const workspaceBlogRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: '/blog',
  component: BlogPage,
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    status: search.status as string | undefined,
    category_id: search.category_id as string | undefined
  })
})

// Create the router
const routeTree = rootRoute.addChildren([
  indexRoute,
  signinRoute,
  registrationRoute,
  restorePasswordRoute,
  setNewPasswordRoute,
  successRoute,
  activateRoute,
  logoutRoute,
  setupRoute,
  acceptInvitationRoute,
  publicPricingRoute,
  publicCreateRoute,
  privacyRoute,
  termsRoute,
  workspaceCreateRoute,
  workspaceRoute.addChildren([
    workspaceIndexRoute,
    analyticsLayoutRoute.addChildren([
      workspaceBroadcastsRoute,
      workspaceAnalyticsRoute
    ]),
    workspaceContactsRoute,
    workspaceListsRoute,
    workspaceTransactionalNotificationsRoute,
    workspaceLogsRoute,
    workspaceFileManagerRoute,
    workspaceSettingsRedirectRoute,
    workspaceSettingsRoute,
    workspaceCreateRoute2,
    workspaceTemplatesRoute,
    workspaceCampaignEditRoute,
    workspaceNewSegmentRoute,
    workspaceBlogRoute,
    pricingRoute
  ])
])

// Create and export the router with explicit type
export const router = createRouter({
  routeTree
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
