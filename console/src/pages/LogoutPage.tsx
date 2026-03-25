import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import Lottie from 'lottie-react'
import loaderAnimation from '../assets/loader.json'

export function LogoutPage() {
  const { signout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const performSignout = async () => {
      await signout()
      navigate({ to: '/signin' })
    }
    performSignout()
  }, [signout, navigate])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Lottie animationData={loaderAnimation} loop style={{ width: 120, height: 120 }} />
    </div>
  )
}
