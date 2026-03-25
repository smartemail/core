import { Outlet, useNavigate, useMatch } from '@tanstack/react-router'
import Lottie from 'lottie-react'
import loaderAnimation from '../assets/loader.json'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export function RootLayout() {
  const { isAuthenticated, loading, workspaces, isActivated } = useAuth()
  const navigate = useNavigate()

  const isHomePageRoute = useMatch({ from: '/', shouldThrow: false })
  const isSigninRoute = useMatch({ from: '/signin', shouldThrow: false })
  const isRegistrationRoute = useMatch({ from: '/registration', shouldThrow: false })
  const isRestorePasswordRoute = useMatch({ from: '/restore-password', shouldThrow: false })
  const isSetNewPasswordRoute = useMatch({ from: '/set-new-password', shouldThrow: false })
  const isActivateRoute = useMatch({ from: '/activate', shouldThrow: false })
  const isAcceptInvitationRoute = useMatch({
    from: '/accept-invitation',
    shouldThrow: false
  })
  const isLogoutRoute = useMatch({ from: '/logout', shouldThrow: false })
  const isWorkspaceCreateRoute = useMatch({ from: '/workspace/create', shouldThrow: false })
  const isSetupRoute = useMatch({ from: '/setup', shouldThrow: false })
  const isPricingRoute = useMatch({ from: '/pricing', shouldThrow: false })
  const isCreateRoute = useMatch({ from: '/create', shouldThrow: false })

  // Check if system is installed (explicitly check for true to handle undefined case)
  const isInstalled = window.IS_INSTALLED === true

  const isPublicRoute = isSigninRoute || isAcceptInvitationRoute || isLogoutRoute || isSetupRoute || isRegistrationRoute || isActivateRoute || isHomePageRoute || isRestorePasswordRoute || isSetNewPasswordRoute || isPricingRoute || isCreateRoute

  // If system is not installed, redirect to setup wizard
  const shouldRedirectToSetup = !isInstalled && !isSetupRoute


  // If not authenticated and not on public routes, redirect to signin
  const shouldRedirectToSignin =
    !isLogoutRoute && !isSigninRoute && !isAuthenticated && !isPublicRoute && !shouldRedirectToSetup

  // If authenticated and has no workspaces, redirect to workspace creation
  const shouldRedirectToCreateWorkspace =
    isAuthenticated && isActivated && workspaces.length === 0 && !isWorkspaceCreateRoute && !isLogoutRoute

  // If authenticated  and not activated and not on public routes, redirect to activation
  const shouldRedirectToActivate = 
    !isActivateRoute && isAuthenticated && !isActivated

  const shouldRedirectFromActivate = 
    isActivateRoute && isAuthenticated && isActivated
  // console.log('isAuthenticated', isAuthenticated)
  // handle redirection...
  useEffect(() => {
    if (loading) return

    if (shouldRedirectToSetup) {
      navigate({ to: '/setup' })
      return
    }

    if (shouldRedirectToSignin) {
      // Check if we're already on the signin pathname to avoid unnecessary navigation
      // This handles race conditions where route matching hasn't completed yet
      const currentPathname = window.location.pathname
      if (currentPathname === '/signin') {
        // Already on signin route, don't navigate
        return
      }

      // Preserve search parameters when redirecting to signin
      const currentSearch = window.location.search
      const searchParams = new URLSearchParams(currentSearch)
      const search: { email?: string } = {}
      
      // Preserve email parameter if present
      if (searchParams.has('email')) {
        search.email = searchParams.get('email') || undefined
      }

      navigate({ 
        to: '/signin',
        search: Object.keys(search).length > 0 ? search : undefined,
        replace: true
      })
      return
    }

    if(shouldRedirectFromActivate){
      navigate({ to: '/' })
      return
    }

    if(shouldRedirectToActivate) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const redirectTo = code ? `/activate?code=${code}` : '/activate';
      navigate({ to: redirectTo })
      return
    }

    if (shouldRedirectToCreateWorkspace) {
      navigate({ to: '/workspace/create' })
      return
    }
  }, [loading, shouldRedirectToSetup, shouldRedirectToSignin, shouldRedirectToCreateWorkspace, navigate, shouldRedirectToActivate, shouldRedirectFromActivate])

  if (
    loading ||
    shouldRedirectToSetup ||
    shouldRedirectToSignin ||
    shouldRedirectToCreateWorkspace ||
    shouldRedirectToActivate
  ) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#FAFAFA' }}
      >
        <Lottie animationData={loaderAnimation} loop style={{ width: 120, height: 120 }} />
      </div>
    )
  }

  return <Outlet />
}
