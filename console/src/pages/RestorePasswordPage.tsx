import { useState, useCallback } from 'react'
import { authService, RestorePasswordRequest } from '../services/api/auth'
import { Form, Input, Button, App } from 'antd'
import { useNavigate, Link } from '@tanstack/react-router'
import { AuthPageLayout } from '../layouts/AuthPageLayout'

export function RestorePasswordPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const navigate = useNavigate()

  const handleRestoreSubmit = useCallback(
    async (values: RestorePasswordRequest) => {
      try {
        setLoading(true)
        const response = await authService.restorePassword(values)
        const { message: successMessage } = response
        message.success(successMessage)

        setTimeout(() => {
          navigate({ to: '/' })
        }, 100)
      } catch (error: unknown) {
        message.error((error as Error)?.message || 'Failed to restore password')
      } finally {
        setLoading(false)
      }
    },
    [message, navigate]
  )

  return (
    <AuthPageLayout
      title="Restore Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
    >
      <Form
        form={form}
        name="restore"
        onFinish={handleRestoreSubmit}
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

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ height: 48, borderRadius: 10, fontWeight: 600, fontSize: 16 }}
          >
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Link to="/signin" style={{ fontSize: 13, color: 'rgba(28, 29, 31, 0.5)' }}>
          Back to Sign In
        </Link>
      </div>
    </AuthPageLayout>
  )
}
