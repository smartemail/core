import { Form, Input, Button, App } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api/auth'
import { SignInRequest } from '../services/api/types'
import { Link } from '@tanstack/react-router'
import { AuthPageLayout } from '../layouts/AuthPageLayout'

export function SignInPage() {
  const { signin } = useAuth()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const navigateToCreate = useCallback((ws: { id: string }[], wsIdOverride?: string) => {
    if (wsIdOverride) {
      window.location.href = `/workspace/${wsIdOverride}/create`
    } else if (ws.length > 0) {
      window.location.href = `/workspace/${ws[0].id}/create`
    } else {
      window.location.href = '/'
    }
  }, [])

  const handleEmailSubmit = useCallback(
    async (values: SignInRequest) => {
      try {
        setLoading(true)
        const response = await authService.signIn(values)
        const ws = await signin(response.token)
        message.success('Successfully signed in')
        navigateToCreate(ws)
      } catch (error: unknown) {
        message.error((error as Error)?.message || 'Failed to sign in')
      } finally {
        setLoading(false)
      }
    },
    [signin, message, navigateToCreate]
  )

  // Handle token from URL (OAuth callback)
  useEffect(() => {
    const run = async () => {
      const hash = window.location.hash
      const query = window.location.search

      let accessToken: string | null = null
      let workspaceId: string | null = null
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'))
        accessToken = params.get('token')
      } else if (query) {
        const params = new URLSearchParams(query)
        accessToken = params.get('token')
        workspaceId = params.get('workspace')
      }

      if (accessToken) {
        const ws = await signin(accessToken)
        message.success('Successfully signed in')
        navigateToCreate(ws, workspaceId || undefined)
      }
    }

    run()
  }, [signin, message, navigateToCreate])

  const clientId = window.GOOGLE_CLIENT_ID
  const redirectUri = window.GOOGLE_REDIRECT_URL
  const scope = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/contacts.other.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ].join(' ')

  const handleLoginGoogle = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`
    window.location.href = url
  }

  const handleLoginApple = async () => {
    try {
      const response = await authService.appleLogin()
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl.toString()
      }
    } catch (error: unknown) {
      message.error((error as Error)?.message || 'Failed to start Apple login')
    }
  }

  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue."
    >
      <Form
        form={form}
        name="signin"
        onFinish={handleEmailSubmit}
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            placeholder="Enter your email"
            style={{ height: 44, borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            placeholder="Enter your password"
            style={{ height: 44, borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ height: 48, borderRadius: 10, fontWeight: 600, fontSize: 16 }}
          >
            Sign In
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Link to="/restore-password" style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.5)' }}>
            Forgot password?
          </Link>
        </div>
      </Form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 20px' }}>
        <div style={{ flex: 1, height: 1, background: '#E4E4E4' }} />
        <span style={{ fontSize: 12, color: 'rgba(28, 29, 31, 0.35)', fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: 1, background: '#E4E4E4' }} />
      </div>

      {/* OAuth buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Button
          block
          onClick={handleLoginGoogle}
          style={{ height: 44, borderRadius: 10, fontWeight: 500 }}
        >
          Google
        </Button>
        <Button
          block
          onClick={handleLoginApple}
          style={{ height: 44, borderRadius: 10, fontWeight: 500 }}
        >
          Apple
        </Button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.5)' }}>
          Don't have an account?{' '}
          <Link to="/registration" style={{ color: '#2F6DFB', fontWeight: 500 }}>
            Sign Up
          </Link>
        </span>
      </div>
    </AuthPageLayout>
  )
}
