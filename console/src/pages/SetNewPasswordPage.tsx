import { useState, useCallback, useEffect } from 'react'
import { authService, SetNewPasswordRequest } from '../services/api/auth'
import { Form, Input, Button, App } from 'antd'
import { useNavigate, Link } from '@tanstack/react-router'
import { AuthPageLayout } from '../layouts/AuthPageLayout'

export function SetNewPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const navigate = useNavigate()

  useEffect(() => {
    const query = window.location.search
    if (query) {
      const params = new URLSearchParams(query)
      const code = params.get('code')
      if (code) {
        form.setFieldValue('code', code)
      }
    }
  }, [form])

  const handleSetNewPasswordSubmit = useCallback(
    async (values: SetNewPasswordRequest) => {
      try {
        setLoading(true)
        const response = await authService.setNewPassword(values)
        const { message: successMessage } = response
        message.success(successMessage)

        setTimeout(() => {
          navigate({ to: '/signin' })
        }, 100)
      } catch (error: unknown) {
        message.error((error as Error)?.message || 'Failed to set new password')
      } finally {
        setLoading(false)
      }
    },
    [message, navigate]
  )

  return (
    <AuthPageLayout
      title="Set New Password"
      subtitle="Enter your new password below."
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSetNewPasswordSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="code"
          rules={[{ required: true, message: 'Please enter the restore code' }]}
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="new_password"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
        >
          <Input.Password
            placeholder="Enter new password"
            style={{ height: 44, borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label="Confirm Password"
          dependencies={['new_password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm new password"
            style={{ height: 44, borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ height: 48, borderRadius: 10, fontWeight: 600, fontSize: 16 }}
          >
            Set New Password
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
