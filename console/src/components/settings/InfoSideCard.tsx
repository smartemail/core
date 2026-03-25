import React from 'react'
import { Button, Typography } from 'antd'
import { Link } from '@tanstack/react-router'

const { Text } = Typography

interface InfoSideCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  showPolicyLinks?: boolean
}

export function InfoSideCard({ title, description, icon, showPolicyLinks = true }: InfoSideCardProps) {
  return (
    <div
      style={{
        border: '1px solid #C6D5FB',
        borderRadius: 20,
        padding: 20,
        background: 'linear-gradient(115.48deg, rgba(250, 250, 250, 0.1) 37.59%, rgba(47, 109, 251, 0.1) 94.34%), #FAFAFA',
      }}
    >
      <div className="flex items-start gap-3 mb-[30px]">
        {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}
        <Text style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{title}</Text>
      </div>
      <div className="mb-[30px]">
        <Text style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.5 }}>
          {description}
        </Text>
      </div>
      {showPolicyLinks && (
        <div className="flex justify-end gap-2">
          <Link to="/privacy"><Button size="middle">Privacy Policy</Button></Link>
          <Link to="/terms"><Button size="middle">Terms and Conditions</Button></Link>
        </div>
      )}
    </div>
  )
}
