import { ReactNode } from 'react'
import { HomeNav } from '../components/HomeNav'
import '../pages/HomePage.css'

interface AuthPageLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="home-page" style={{ minHeight: '100vh' }}>
      <HomeNav />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 16px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1D1F', marginBottom: 8 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 14, color: 'rgba(28, 29, 31, 0.5)' }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{
            background: '#FAFAFA',
            borderRadius: 20,
            padding: '32px 28px',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
