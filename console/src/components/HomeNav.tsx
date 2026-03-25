import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { authService } from '../services/api/auth'
import { Workspace } from '../services/api/types'

export function HomeNav() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (!token) return
        let cancelled = false
        authService.getCurrentUser().then(({ workspaces }) => {
            if (!cancelled) setWorkspaces(workspaces)
        }).catch(() => {})
        return () => { cancelled = true }
    }, [])

    const ctaHref = workspaces.length > 0
        ? `/workspace/${workspaces[0].id}/create`
        : '/signin'

    return (
        <div className="home-nav-wrapper">
            <nav className="home-nav">
                <Link to="/" className="home-nav-logo">
                    <div className="home-nav-logo-icon">
                        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <text x="50%" y="52%" dominantBaseline="central" textAnchor="middle"
                                fill="currentColor" fontSize="14" fontWeight="700" fontFamily="Satoshi, sans-serif">S</text>
                            <circle cx="16" cy="4" r="2.5" fill="currentColor" />
                        </svg>
                    </div>
                    <span>Smart Mail</span>
                </Link>
                <div className="home-nav-actions">
                    <Link to="/pricing" className="home-nav-link">Pricing</Link>
                    <Link to={ctaHref} className="home-nav-cta">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 14L13 21L20 3M9 14L2 10L20 3M9 14L20 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        {workspaces.length > 0 ? 'Get Started' : 'Sign In'}
                    </Link>
                </div>
            </nav>
        </div>
    )
}
