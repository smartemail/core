import { Form, Input, Button, App } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { authService } from '../services/api/auth'
import { SignUpRequest } from '../services/api/types'
import { AuthPageLayout } from '../layouts/AuthPageLayout'

export function RegistrationPage() {
  const { signin } = useAuth()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const handleEmailSubmit = useCallback(
    async (values: SignUpRequest) => {
      try {
        setLoading(true)
        const response = await authService.signUp(values)
        const ws = await signin(response.token)
        message.success('Account created successfully')
        if (ws.length > 0) {
          window.location.href = `/workspace/${ws[0].id}/create`
        } else {
          window.location.href = '/'
        }
      } catch (error: unknown) {
        message.error((error as Error)?.message || 'Failed to register')
      } finally {
        setLoading(false)
      }
    },
    [signin, message]
  )

  const handleLoginGoogle = () => {
    const clientId = window.GOOGLE_CLIENT_ID
    const redirectUri = window.GOOGLE_REDIRECT_URL
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
      title="Create your account"
      subtitle="Sign up to access AI email generation, save your campaigns, and more."
    >
      <Form
        form={form}
        name="signup"
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
          Already have an account?{' '}
          <Link to="/signin" style={{ color: '#2F6DFB', fontWeight: 500 }}>
            Sign In
          </Link>
        </span>
      </div>
    </AuthPageLayout>
  )
}
