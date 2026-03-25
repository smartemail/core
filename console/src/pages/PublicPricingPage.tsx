import { HomeNav } from '../components/HomeNav'
import { PricingPage } from './PricingPage'
import { useIsMobile } from '../hooks/useIsMobile'
import './HomePage.css'

export function PublicPricingPage() {
    const isMobile = useIsMobile()

    return (
        <div className="home-page">
            <HomeNav />
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: isMobile ? '20px 16px 40px' : '30px 40px 60px' }}>
                <PricingPage isPublic />
            </div>
        </div>
    )
}
