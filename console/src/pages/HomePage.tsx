import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authService } from '../services/api/auth'
import { Workspace } from '../services/api/types'
import { Sparkles, ChevronDown, RefreshCw, Send } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { HomeNav } from '../components/HomeNav'
import cleanMinimalImg from '../assets/clean_minimal.png'
import warmLocalImg from '../assets/warm_local.png'
import luxuryPremiumImg from '../assets/luxury_premium.png'
import boldVibrantImg from '../assets/bold_vibrant.png'
import './HomePage.css'

export function HomePage() {
    const navigate = useNavigate()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [prompt, setPrompt] = useState('')

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
        <div className="home-page">
            {/* ─── Navbar ─── */}
            <HomeNav />

            {/* ─── Hero Section ─── */}
            <section className="home-hero">
                <div className="home-hero-labels">
                    <span className="home-hero-label">Smart AI</span>
                    <span className="home-hero-label-dot" />
                    <span className="home-hero-label">Pixels</span>
                    <span className="home-hero-label-dot" />
                    <span className="home-hero-label">Samples</span>
                </div>

                <h1>
                    Emails Designed &amp;<br />
                    Delivered Faster with AI
                </h1>

                <p className="home-hero-sub">
                    Use AI as your ultimate marketing assistant. Generate Templates, Contents,
                    and Brand Guides for your email campaigns in just minutes.
                </p>

                <div className="home-prompt">
                    <input
                        type="text"
                        placeholder="Describe your Email campaign in a sentence or two..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button type="button" className="home-prompt-btn" onClick={() => {
                        if (prompt.trim()) {
                            sessionStorage.setItem('pending_prompt', prompt)
                            if (workspaces.length > 0) {
                                navigate({ to: `/workspace/${workspaces[0].id}/create` })
                            } else {
                                navigate({ to: '/create' })
                            }
                        } else {
                            navigate({ to: ctaHref })
                        }
                    }}>
                        <Sparkles size={14} />
                        Generate
                    </button>
                </div>
            </section>

            {/* ─── Showcase Section ─── */}
            <section className="home-showcase">
                <div className="home-showcase-grid">
                    {/* Column 1: Prompt + Hooks */}
                    <div className="home-showcase-col">
                        <div className="home-showcase-card">
                            <div className="sc-header">
                                <Sparkles size={16} color="#2F6DFB" />
                                <span className="sc-header-title">Prompt</span>
                                <ChevronDown size={18} color="#999" />
                            </div>
                            <div className="sc-divider" />
                            <div className="sc-label">Describe your Email campaign in a sentence or two<span className="sc-req">*</span></div>
                            <div className="sc-textarea">
                                Announce our new AI email generation service that helps businesses create, design, and send campaigns in minutes.
                                <span className="sc-charcount"><span className="sc-charcount-current">113</span>/1000</span>
                            </div>
                        </div>
                        <div className="home-showcase-card sc-hooks-card">
                            <div className="sc-hooks-header">
                                <span>Trending hooks</span>
                                <span className="sc-toggle active" />
                            </div>
                            <div className="sc-tags">
                                <span className="sc-tag">Cold snap in NYC</span>
                                <span className="sc-tag">Subway delays</span>
                                <span className="sc-tag">Holiday rush</span>
                                <span className="sc-tag">Energy prices up</span>
                                <span className="sc-tag">Weekend crowds</span>
                                <span className="sc-tag">Shorter daylight</span>
                            </div>
                            <div className="sc-helper">Select a hook to read more about it's origin.</div>
                        </div>
                    </div>

                    {/* Column 2: Upload + Templates */}
                    <div className="home-showcase-col">
                        <div className="home-showcase-card">
                            <div className="sc-upload-header">
                                <span>Upload custom image(s)</span>
                                <span className="sc-toggle active" />
                            </div>
                            <div className="sc-file-row">
                                <div className="sc-file-thumb" />
                                <div className="sc-file-info">
                                    <span className="sc-file-name">Frame 1.png</span>
                                    <span className="sc-file-size">9,529 kB</span>
                                </div>
                                <span className="sc-file-delete">&#128465;</span>
                            </div>
                        </div>
                        <div className="home-showcase-card sc-branding-card">
                            <div className="sc-tabs">
                                <span className="sc-tab">Branding</span>
                                <span className="sc-tab active">Preset</span>
                            </div>
                            <div className="sc-templates-grid">
                                <div className="sc-template selected">
                                    <div className="sc-template-preview">
                                        <img src={cleanMinimalImg} alt="Clean Minimal" />
                                    </div>
                                    <div className="sc-template-label"><span className="sc-radio selected" /> Clean Minimal</div>
                                </div>
                                <div className="sc-template">
                                    <div className="sc-template-preview">
                                        <img src={warmLocalImg} alt="Warm Local" />
                                    </div>
                                    <div className="sc-template-label"><span className="sc-radio" /> Warm Local</div>
                                </div>
                                <div className="sc-template">
                                    <div className="sc-template-preview">
                                        <img src={luxuryPremiumImg} alt="Luxury Premium" />
                                    </div>
                                    <div className="sc-template-label" />
                                </div>
                                <div className="sc-template">
                                    <div className="sc-template-preview">
                                        <img src={boldVibrantImg} alt="Bold & Vibrant" />
                                    </div>
                                    <div className="sc-template-label" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Subject + Send */}
                    <div className="home-showcase-col">
                        <div className="home-showcase-card">
                            <div className="sc-subject-header">
                                <span>Subject Line<span className="sc-req">*</span></span>
                                <span className="sc-regenerate"><RefreshCw size={12} /> Re-generate</span>
                            </div>
                            <div className="sc-subject-input">Email marketing, without the busywork!</div>
                            <div className="sc-charcount-row"><span className="sc-charcount-green">38</span>/140</div>
                            <div className="sc-score-card">
                                <div className="sc-score-circle">A</div>
                                <div className="sc-score-info">
                                    <div className="sc-score-label">94 Points</div>
                                    <div className="sc-score-bar"><div className="sc-score-fill" /></div>
                                    <div className="sc-score-hint">Very solid subject line.</div>
                                </div>
                            </div>
                        </div>
                        <div className="home-showcase-card">
                            <div className="sc-modal-header">
                                <span className="sc-modal-title">Send or Schedule</span>
                                <span className="sc-modal-close">&times;</span>
                            </div>
                            <div className="sc-modal-text">Do you want to send &ldquo;Company of Heroes 2&rdquo; immediately or schedule it for later?</div>
                            <div className="sc-schedule-row">
                                <span>Schedule for later delivery</span>
                                <span className="sc-toggle" />
                            </div>
                            <div className="sc-send-row">
                                <button className="sc-send-btn" type="button"><Send size={14} /> Send Now</button>
                                <span className="sc-credits">&#x1F48E; 32 / 968</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="home-footer">
                <p>
                    &copy; {new Date().getFullYear()} Smart Mail AI &nbsp;·&nbsp;
                    <Link to="/privacy" className="home-footer-link">Privacy Policy</Link>
                    &nbsp;·&nbsp;
                    <Link to="/terms" className="home-footer-link">Terms and Conditions</Link>
                </p>
            </footer>
        </div>
    )
}