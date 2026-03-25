import { useState, useCallback } from 'react'
import { Modal, Form, Input, Button, App, Segmented, ConfigProvider } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { authService } from '../../../services/api/auth'
import type { SignInRequest, SignUpRequest } from '../../../services/api/types'

interface AuthGateModalProps {
  open: boolean
  onClose: () => void
  prompt: string
}

const segmentedTheme = {
  components: {
    Segmented: {
      itemColor: 'rgba(28, 29, 31, 0.5)',
      itemHoverColor: 'rgba(28, 29, 31, 0.7)',
      itemSelectedBg: '#2F6DFB',
      itemSelectedColor: '#F8F8F8',
      trackBg: '#F4F4F5',
      borderRadius: 10,
      controlHeight: 40,
      trackPadding: 5,
    },
  },
}

export function AuthGateModal({ open, onClose, prompt }: AuthGateModalProps) {
  const { signin } = useAuth()
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'Sign In' | 'Sign Up'>('Sign Up')
  const [loading, setLoading] = useState(false)
  const [signInForm] = Form.useForm()
  const [signUpForm] = Form.useForm()

  const navigateAfterAuth = useCallback((ws: { id: string }[]) => {
    if (prompt) sessionStorage.setItem('pending_prompt', prompt)
    onClose()
    // Wait for React to process auth state updates before navigating,
    // otherwise RootLayout's auth guard redirects to /signin
    setTimeout(() => {
      if (ws.length > 0) {
        navigate({ to: `/workspace/${ws[0].id}/create` })
      } else {
        navigate({ to: '/' })
      }
    }, 100)
  }, [prompt, navigate, onClose])

  const handleSignIn = useCallback(async (values: SignInRequest) => {
    try {
      setLoading(true)
      const response = await authService.signIn(values)
      const ws = await signin(response.token)
      message.success('Successfully signed in')
      navigateAfterAuth(ws)
    } catch (error: unknown) {
      message.error((error as Error)?.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }, [signin, message, navigateAfterAuth])

  const handleSignUp = useCallback(async (values: SignUpRequest) => {
    try {
      setLoading(true)
      const response = await authService.signUp(values)
      const ws = await signin(response.token)
      message.success('Account created successfully')
      navigateAfterAuth(ws)
    } catch (error: unknown) {
      message.error((error as Error)?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }, [signin, message, navigateAfterAuth])

  const handleLoginGoogle = useCallback(() => {
    const clientId = (window as any).GOOGLE_CLIENT_ID
    const redirectUri = (window as any).GOOGLE_REDIRECT_URL
    if (!clientId || !redirectUri) return

    const scope = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/contacts.other.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ].join(' ')

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`
  }, [])

  const handleLoginApple = useCallback(async () => {
    try {
      const response = await authService.appleLogin()
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl.toString()
      }
    } catch (error: unknown) {
      message.error((error as Error)?.message || 'Failed to start Apple login')
    }
  }, [message])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={440}
      styles={{ body: { padding: '10px 0 0' } }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1D1F', marginBottom: 8 }}>
          Create a free account to generate emails
        </div>
        <div style={{ fontSize: 14, color: 'rgba(28, 29, 31, 0.5)' }}>
          Sign up to access AI email generation, save your campaigns, and more.
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
        <ConfigProvider theme={segmentedTheme}>
          <Segmented
            value={mode}
            onChange={(value) => setMode(value as 'Sign In' | 'Sign Up')}
            options={['Sign In', 'Sign Up']}
            block
            style={{ width: '100%' }}
          />
        </ConfigProvider>
      </div>

      {mode === 'Sign In' ? (
        <Form
          form={signInForm}
          onFinish={handleSignIn}
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
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <a href="/restore-password" style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.5)' }}>
              Forgot password?
            </a>
          </div>
        </Form>
      ) : (
        <Form
          form={signUpForm}
          onFinish={handleSignUp}
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
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              style={{ height: 44, borderRadius: 10 }}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match'))
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm your password"
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
              Create Account
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* OAuth buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
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
    </Modal>
  )
}
