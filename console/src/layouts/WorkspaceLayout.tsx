import { Layout, Menu, Dropdown, Avatar, Drawer } from 'antd'
import { Outlet, Link, useParams, useMatches, useNavigate } from '@tanstack/react-router'
import md5 from 'blueimp-md5'
import { useAuth } from '../contexts/AuthContext'
import { UserPermissions } from '../services/api/types'
import { ContactsCsvUploadProvider } from '../components/contacts/ContactsCsvUploadProvider'
import { useState, useEffect } from 'react'
import { FileManagerProvider } from '../components/file_manager/context'
import { workspaceService } from '../services/api/workspace'
import { isRootUser } from '../services/api/auth'
import { pricingApi } from '../services/api/pricing'
import { LogOut, Menu as MenuIcon, X } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { DiamondIcon } from '../components/settings/SettingsIcons'

// Custom SVG icon components
const HomeIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 20V14C14 12.8954 13.1046 12 12 12C10.8954 12 10 12.8954 10 14V20M14 20L18 20C19.1046 20 20 19.1046 20 18V8.8641C20 8.15646 19.6261 7.50149 19.0167 7.14177L13.0167 3.60011C12.3894 3.22988 11.6106 3.22988 10.9833 3.60011L4.98335 7.14177C4.37395 7.50149 4 8.15646 4 8.8641V18C4 19.1046 4.89543 20 6 20L10 20M14 20H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CreateIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9M13 3L19 9M13 3V8C13 8.55228 13.4477 9 14 9H19M12 13V17M14 15H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const EmailIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ContactsIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5051 19H20C21.1046 19 22.0669 18.076 21.716 17.0286C21.1812 15.4325 19.8656 14.4672 17.5527 14.1329M14.5001 10.8645C14.7911 10.9565 15.1244 11 15.5 11C17.1667 11 18 10.1429 18 8C18 5.85714 17.1667 5 15.5 5C15.1244 5 14.7911 5.04354 14.5001 5.13552M9.5 14C13.1135 14 15.0395 15.0095 15.716 17.0286C16.0669 18.076 15.1046 19 14 19H5C3.89543 19 2.93311 18.076 3.28401 17.0286C3.96047 15.0095 5.88655 14 9.5 14ZM9.5 11C11.1667 11 12 10.1429 12 8C12 5.85714 11.1667 5 9.5 5C7.83333 5 7 5.85714 7 8C7 10.1429 7.83333 11 9.5 11Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AnalyticsIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 19V7C14 5.89543 13.1046 5 12 5H11C9.89543 5 9 5.89543 9 7V19M9 13H6C4.89543 13 4 13.8954 4 15V17C4 18.1046 4.89543 19 6 19H17C18.1046 19 19 18.1046 19 17V12C19 10.8954 18.1046 10 17 10H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const FileManagerIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V13M13 20L20 13M13 20V14C13 13.4477 13.4477 13 14 13H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PricingIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6V17C3 18.6569 4.34315 20 6 20H20C20.5523 20 21 19.5523 21 19V16M3 6C3 4.89543 3.89543 4 5 4H18C18.5523 4 19 4.44772 19 5V8M3 6C3 7.10457 3.89543 8 5 8H19M19 8H20C20.5523 8 21 8.44772 21 9V12M21 12H18C16.8954 12 16 12.8954 16 14C16 15.1046 16.8954 16 18 16H21M21 12V16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SettingsIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.65227 4.56614C9.85562 3.65106 10.6672 3 11.6046 3H12.396C13.3334 3 14.145 3.65106 14.3483 4.56614L14.5513 5.47935C15.2124 5.73819 15.8245 6.09467 16.37 6.53105L17.2642 6.24961C18.1583 5.96818 19.128 6.34554 19.5967 7.15735L19.9923 7.84264C20.461 8.65445 20.303 9.68287 19.6122 10.3165L18.922 10.9496C18.9736 11.2922 19.0003 11.643 19.0003 12C19.0003 12.357 18.9736 12.7078 18.922 13.0504L19.6122 13.6835C20.303 14.3171 20.4611 15.3455 19.9924 16.1574L19.5967 16.8426C19.128 17.6545 18.1583 18.0318 17.2642 17.7504L16.37 17.4689C15.8245 17.9053 15.2124 18.2618 14.5513 18.5206L14.3483 19.4339C14.145 20.3489 13.3334 21 12.396 21H11.6046C10.6672 21 9.85562 20.3489 9.65227 19.4339L9.44933 18.5206C8.7882 18.2618 8.17604 17.9053 7.63058 17.4689L6.73639 17.7504C5.84223 18.0318 4.87258 17.6545 4.40388 16.8426L4.00823 16.1573C3.53953 15.3455 3.69755 14.3171 4.38836 13.6835L5.07858 13.0504C5.02702 12.7077 5.0003 12.357 5.0003 12C5.0003 11.643 5.02702 11.2922 5.07858 10.9496L4.38837 10.3165C3.69757 9.68288 3.53954 8.65446 4.00824 7.84265L4.4039 7.15735C4.8726 6.34554 5.84225 5.96818 6.7364 6.24962L7.63059 6.53106C8.17604 6.09467 8.7882 5.73819 9.44933 5.47935L9.65227 4.56614Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.0003 12C13.0003 12.5523 12.5526 13 12.0003 13C11.448 13 11.0003 12.5523 11.0003 12C11.0003 11.4477 11.448 11 12.0003 11C12.5526 11 13.0003 11.4477 13.0003 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const { Content, Sider } = Layout

// Logo SVG Component
const LogoIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="#2F6DFB" />
    <path
      d="M19.8069 31C18.1333 31 16.6713 30.7409 15.4207 30.2228C14.1885 29.6848 13.0483 28.8379 12 27.6821L15.4483 23.9457C16.1655 24.683 16.9195 25.2509 17.7103 25.6495C18.5011 26.0281 19.3471 26.2174 20.2483 26.2174C21.0023 26.2174 21.5724 26.0978 21.9586 25.8587C22.3448 25.5996 22.5379 25.2509 22.5379 24.8125C22.5379 24.3741 22.3724 24.0154 22.0414 23.7364C21.7103 23.4375 21.269 23.1784 20.7172 22.9592C20.1839 22.7201 19.5862 22.481 18.9241 22.2418C18.2805 22.0027 17.6368 21.7138 16.9931 21.375C16.3494 21.0362 15.7517 20.6277 15.2 20.1495C14.6667 19.6513 14.2345 19.0435 13.9034 18.3261C13.5724 17.5888 13.4069 16.692 13.4069 15.6359C13.4069 14.2609 13.7103 13.0752 14.3172 12.0788C14.9241 11.0824 15.7793 10.3252 16.8828 9.80707C17.9862 9.26902 19.2828 9 20.7724 9C22.2437 9 23.6046 9.25906 24.8552 9.77717C26.1241 10.2754 27.1724 10.9928 28 11.9293L24.5241 15.6658C23.9172 15.0281 23.3103 14.5598 22.7034 14.2609C22.0966 13.942 21.4345 13.7826 20.7172 13.7826C20.1471 13.7826 19.6874 13.8822 19.3379 14.0815C19.0069 14.2808 18.8414 14.5797 18.8414 14.9783C18.8414 15.3967 19.0069 15.7455 19.3379 16.0245C19.669 16.2835 20.1011 16.5226 20.6345 16.7418C21.1862 16.9611 21.7839 17.1902 22.4276 17.4293C23.0897 17.6685 23.7425 17.9574 24.3862 18.2962C25.0299 18.615 25.6184 19.0335 26.1517 19.5516C26.7034 20.0498 27.1448 20.6775 27.4759 21.4348C27.8069 22.192 27.9724 23.1087 27.9724 24.1848C27.9724 26.3569 27.2552 28.0408 25.8207 29.2364C24.4046 30.4121 22.4 31 19.8069 31Z"
      fill="#FAFAFA"
    />
    <circle cx="32" cy="8" r="4" fill="#FAFAFA" />
  </svg>
)

// Helper function to generate Gravatar URL from email
const getGravatarUrl = (email: string | undefined, size: number = 32): string => {
  if (!email) return ''
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

// Layout constants
const SIDEBAR_WIDTH = 60
const MOBILE_HEADER_HEIGHT = 56

export function WorkspaceLayout() {
  const { workspaceId } = useParams({ from: '/workspace/$workspaceId' })
  const { signout, user } = useAuth()
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null)
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null)
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  // Use useMatches to determine the current route path
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname || ''

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [currentPath])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Fetch credits for mobile nav
  useEffect(() => {
    if (!isMobile) return
    pricingApi.subscription().then((res) => setCreditsLeft(res.credits_left)).catch(() => {})
  }, [isMobile])

  // Fetch user permissions for the current workspace
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user || !workspaceId) {
        setLoadingPermissions(false)
        return
      }

      // If user is root, they have full permissions
      if (isRootUser(user.email)) {
        setUserPermissions({
          contacts: { read: true, write: true },
          lists: { read: true, write: true },
          templates: { read: true, write: true },
          broadcasts: { read: true, write: true },
          transactional: { read: true, write: true },
          workspace: { read: true, write: true },
          message_history: { read: true, write: true },
          blog: { read: true, write: true }
        })
        setLoadingPermissions(false)
        return
      }

      try {
        const response = await workspaceService.getMembers(workspaceId)
        const currentUserMember = response.members.find((member) => member.user_id === user.id)

        if (currentUserMember) {
          setUserPermissions(currentUserMember.permissions)
        } else {
          setUserPermissions({
            contacts: { read: false, write: false },
            lists: { read: false, write: false },
            templates: { read: false, write: false },
            broadcasts: { read: false, write: false },
            transactional: { read: false, write: false },
            workspace: { read: false, write: false },
            message_history: { read: false, write: false },
            blog: { read: false, write: false }
          })
        }
      } catch (error) {
        console.error('Failed to fetch user permissions', error)
        setUserPermissions({
          contacts: { read: false, write: false },
          lists: { read: false, write: false },
          templates: { read: false, write: false },
          broadcasts: { read: false, write: false },
          transactional: { read: false, write: false },
          workspace: { read: false, write: false },
          message_history: { read: false, write: false },
          blog: { read: false, write: false }
        })
      } finally {
        setLoadingPermissions(false)
      }
    }

    fetchUserPermissions()
  }, [workspaceId, user])

  // Helper function to check if user has access to a resource
  const hasAccess = (resource: keyof UserPermissions): boolean => {
    if (!userPermissions) return false
    const permissions = userPermissions[resource]
    return permissions.read || permissions.write
  }

  // Determine which key should be selected based on the current path
  let selectedKey = 'analytics'
  if (currentPath.includes('/settings')) {
    selectedKey = 'settings'
  } else if (currentPath.includes('/create')) {
    selectedKey = 'create'
  } else if (currentPath.includes('/lists')) {
    selectedKey = 'lists'
  } else if (currentPath.includes('/templates')) {
    selectedKey = 'templates'
  } else if (currentPath.includes('/blog')) {
    selectedKey = 'blog'
  } else if (currentPath.includes('/contacts')) {
    selectedKey = 'contacts'
  } else if (currentPath.includes('/file-manager')) {
    selectedKey = 'file-manager'
  } else if (currentPath.includes('/transactional-notifications')) {
    selectedKey = 'transactional-notifications'
  } else if (currentPath.includes('/logs')) {
    selectedKey = 'logs'
  } else if (currentPath.includes('/pricing')) {
    selectedKey = 'pricing'
  } else if (currentPath.includes('/broadcasts')) {
    selectedKey = 'broadcasts'
  }

  // Icon colors for menu items
  const inactiveColor = 'rgba(28, 29, 31, 0.5)'
  const activeColor = '#2F6DFB'

  const menuItems = [
    hasAccess('message_history') && {
      key: 'analytics',
      icon: (
        <Link to="/workspace/$workspaceId" params={{ workspaceId }}>
          <HomeIcon color={selectedKey === 'analytics' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'Home',
    },
    hasAccess('templates') && {
      key: 'create',
      icon: (
        <Link to="/workspace/$workspaceId/create" params={{ workspaceId }}>
          <CreateIcon color={selectedKey === 'create' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'Create',
    },
    hasAccess('templates') && {
      key: 'templates',
      icon: (
        <Link to="/workspace/$workspaceId/templates" params={{ workspaceId }}>
          <EmailIcon color={selectedKey === 'templates' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'My emails'
    },
    hasAccess('contacts') && {
      key: 'contacts',
      icon: (
        <Link to="/workspace/$workspaceId/contacts" params={{ workspaceId }}>
          <ContactsIcon color={selectedKey === 'contacts' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'Contacts',
    },
    hasAccess('broadcasts') && {
      key: 'broadcasts',
      icon: (
        <Link to="/workspace/$workspaceId/broadcasts" params={{ workspaceId }}>
          <AnalyticsIcon color={selectedKey === 'broadcasts' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'Analytics',
    },
    hasAccess('workspace') && {
      key: 'file-manager',
      icon: (
        <Link to="/workspace/$workspaceId/file-manager" params={{ workspaceId }}>
          <FileManagerIcon color={selectedKey === 'file-manager' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'File Manager',
    },
    hasAccess('workspace') && {
      key: 'pricing',
      icon: (
        <Link to="/workspace/$workspaceId/pricing" params={{ workspaceId }}>
          <PricingIcon color={selectedKey === 'pricing' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'Pricing',
    },
    hasAccess('workspace') && {
      key: 'settings',
      icon: (
        <Link to="/workspace/$workspaceId/settings" params={{ workspaceId }}>
          <SettingsIcon color={selectedKey === 'settings' ? activeColor : inactiveColor} />
        </Link>
      ),
      label: 'Settings',
    }
  ].filter(Boolean) as any[]

  // Mobile nav items: label + icon + route + key
  const mobileNavItems = [
    hasAccess('message_history') && {
      key: 'analytics',
      label: 'Home',
      icon: <HomeIcon color={selectedKey === 'analytics' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId' as const,
    },
    hasAccess('templates') && {
      key: 'create',
      label: 'Create',
      icon: <CreateIcon color={selectedKey === 'create' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/create' as const,
    },
    hasAccess('templates') && {
      key: 'templates',
      label: 'My Emails',
      icon: <EmailIcon color={selectedKey === 'templates' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/templates' as const,
    },
    hasAccess('contacts') && {
      key: 'contacts',
      label: 'Contacts',
      icon: <ContactsIcon color={selectedKey === 'contacts' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/contacts' as const,
    },
    hasAccess('broadcasts') && {
      key: 'broadcasts',
      label: 'Analytics',
      icon: <AnalyticsIcon color={selectedKey === 'broadcasts' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/broadcasts' as const,
    },
    hasAccess('workspace') && {
      key: 'file-manager',
      label: 'File Manager',
      icon: <FileManagerIcon color={selectedKey === 'file-manager' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/file-manager' as const,
    },
    hasAccess('workspace') && {
      key: 'pricing',
      label: 'Pricing',
      icon: <PricingIcon color={selectedKey === 'pricing' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/pricing' as const,
    },
    hasAccess('workspace') && {
      key: 'settings',
      label: 'Settings',
      icon: <SettingsIcon color={selectedKey === 'settings' ? activeColor : inactiveColor} />,
      path: '/workspace/$workspaceId/settings' as const,
    },
  ].filter(Boolean) as { key: string; label: string; icon: React.ReactNode; path: string }[]

  const desktopSidebarContent = (
    <>
      {/* Logo */}
      <div
        style={{
          padding: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <LogoIcon />
      </div>

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          height: 'calc(100% - 120px)',
          borderRight: 0,
          backgroundColor: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        items={loadingPermissions ? [] : menuItems}
        theme="light"
      />

      {/* User Avatar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          width: SIDEBAR_WIDTH,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogOut size={16} />,
                label: 'Logout',
                onClick: () => signout()
              }
            ]
          }}
          trigger={['click']}
          placement="topRight"
        >
          <Avatar
            src={getGravatarUrl(user?.email)}
            size={27}
            style={{ cursor: 'pointer' }}
          />
        </Dropdown>
      </div>
    </>
  )

  return (
    <ContactsCsvUploadProvider>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#F2F2F2' }}>
        {isMobile ? (
          <>
            {/* Mobile top bar */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: MOBILE_HEADER_HEIGHT,
                paddingTop: 'env(safe-area-inset-top)',
                backgroundColor: '#FAFAFA',
                borderBottom: '1px solid #E4E4E4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'env(safe-area-inset-top) 16px 0 16px',
                zIndex: 20
              }}
            >
              <LogoIcon />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {mobileMenuOpen ? (
                  <X size={24} color="rgba(28, 29, 31, 0.5)" />
                ) : (
                  <MenuIcon size={24} color="rgba(28, 29, 31, 0.5)" />
                )}
              </button>
            </div>

            {/* Mobile full-screen navigation drawer */}
            <Drawer
              placement="bottom"
              open={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              // height={`calc(100vh - ${MOBILE_HEADER_HEIGHT}px)`}
              height={'auto'}
              styles={{
                body: {
                  padding: 0,
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                },
                header: { display: 'none' },
                wrapper: { boxShadow: 'none' },
              }}
              rootStyle={{ top: MOBILE_HEADER_HEIGHT }}
            >
              {/* Drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
                <div style={{ width: 100, height: 5, borderRadius: 3, backgroundColor: '#E4E4E4' }} />
              </div>

              {/* Navigation items */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 12px', flex: 1 }}>
                {!loadingPermissions && mobileNavItems.map((item) => {
                  const isActive = selectedKey === item.key
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        navigate({ to: item.path, params: { workspaceId } })
                        setMobileMenuOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderBottom: isActive ? 'none' : '1px solid #F0F0F0',
                        ...(isActive ? {
                          backgroundColor: '#F8F8F8',
                          borderRadius: 12,
                          border: '1px solid #E8E8E8',
                        } : {}),
                      }}
                    >
                      <span style={{
                        fontSize: 16,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#2F6DFB' : 'rgba(28, 29, 31, 0.5)',
                      }}>
                        {item.label}
                      </span>
                      {item.icon}
                    </div>
                  )
                })}
              </div>

              {/* User profile section at bottom */}
              <div style={{
                borderTop: '1px solid #F0F0F0',
              }}>
                {/* User info + credits */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #F0F0F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar src={getGravatarUrl(user?.email, 40)} size={40} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1D1F' }}>
                        {user?.name || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <span style={{ fontSize: 12, color: 'rgba(28, 29, 31, 0.5)' }}>
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  {creditsLeft !== null && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#F0F7FF',
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#2F6DFB',
                    }}>
                      <DiamondIcon size={14} />
                      <span>{creditsLeft.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Logout */}
                <div
                  onClick={() => signout()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                    cursor: 'pointer',
                    borderTop: '1px solid #F0F0F0',
                  }}
                >
                  <span style={{ fontSize: 16, color: 'rgba(28, 29, 31, 0.4)' }}>
                    Logout
                  </span>
                  <LogOut size={20} color="rgba(28, 29, 31, 0.3)" />
                </div>
              </div>
            </Drawer>

            {/* Mobile main content */}
            <Layout
              style={{
                marginTop: MOBILE_HEADER_HEIGHT,
                padding: '0',
                backgroundColor: '#F2F2F2',
                minHeight: `calc(100vh - ${MOBILE_HEADER_HEIGHT}px)`
              }}
            >
              <Content>
                <FileManagerProvider
                  key={`fm-${workspaceId}-${!userPermissions?.templates?.write}`}
                  readOnly={!userPermissions?.templates?.write}
                >
                  <Outlet />
                </FileManagerProvider>
              </Content>
            </Layout>
          </>
        ) : (
          <Layout>
            {/* Desktop sidebar */}
            <Sider
              width={SIDEBAR_WIDTH}
              theme="light"
              style={{
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                overflow: 'hidden',
                zIndex: 10,
                backgroundColor: '#FAFAFA',
                borderRight: '1px solid #E4E4E4'
              }}
              collapsed={true}
              collapsedWidth={SIDEBAR_WIDTH}
              trigger={null}
            >
              {desktopSidebarContent}
            </Sider>

            {/* Desktop main content */}
            <Layout
              style={{
                marginLeft: SIDEBAR_WIDTH,
                padding: '0',
                backgroundColor: '#F2F2F2',
                minHeight: '100vh'
              }}
            >
              <Content>
                <FileManagerProvider
                  key={`fm-${workspaceId}-${!userPermissions?.templates?.write}`}
                  readOnly={!userPermissions?.templates?.write}
                >
                  <Outlet />
                </FileManagerProvider>
              </Content>
            </Layout>
          </Layout>
        )}
      </Layout>
    </ContactsCsvUploadProvider>
  )
}
