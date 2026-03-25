import { Form, Input, Button, App } from 'antd'
import { useState, useCallback } from 'react'
import { authService } from '../services/api/auth'
import { ActivateUserRequest } from '../services/api/types'
import { AuthPageLayout } from '../layouts/AuthPageLayout'

export function ActivatePage() {
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const handleActivateSubmit = useCallback(
    async (values: ActivateUserRequest) => {
      try {
        setLoading(true)
        const response = await authService.activateUser(values)
        if (response.status) {
          if (response.workspaceId) {
            window.location.href = `/workspace/${response.workspaceId}/create`
          } else {
            window.location.href = '/'
          }
        } else {
          message.error(response.message || 'Failed to activate account')
        }
      } catch (error: unknown) {
        message.error((error as Error)?.message || 'Failed to activate account')
      } finally {
        setLoading(false)
      }
    },
    [message]
  )

  return (
    <AuthPageLayout
      title="Activate your account"
      subtitle="Enter the activation code sent to your email."
    >
      <Form
        form={form}
        name="activate"
        onFinish={handleActivateSubmit}
        layout="vertical"
      >
        <Form.Item
          name="code"
          label="Activation Code"
          initialValue={new URLSearchParams(window.location.search).get('code') || ''}
          rules={[
            { required: true, message: 'Please enter your activation code' },
          ]}
        >
          <Input
            placeholder="Enter your activation code"
            style={{ height: 44, borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ height: 48, borderRadius: 10, fontWeight: 600, fontSize: 16 }}
          >
            Activate
          </Button>
        </Form.Item>
      </Form>
    </AuthPageLayout>
  )
}
