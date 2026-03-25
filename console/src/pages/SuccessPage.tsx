import { useNavigate } from '@tanstack/react-router';
import { HomeNav } from '../components/HomeNav';
import thankYouGif from '../assets/thank-you.gif';
import './HomePage.css';

export function SuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="home-page" style={{ minHeight: '100vh' }}>
            <HomeNav />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '60px 16px 40px',
                minHeight: 'calc(100vh - 80px)',
            }}>
                <div
                    style={{
                        width: 350,
                        backgroundColor: '#FAFAFA',
                        borderRadius: 20,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 30,
                        boxShadow: '0px 16px 36px rgba(28, 29, 31, 0.1)',
                    }}
                >
                    <img
                        src={thankYouGif}
                        alt="Thank You"
                        style={{ width: '100%', borderRadius: 12 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center' }}>
                        <h1 style={{
                            fontFamily: 'Satoshi, sans-serif',
                            fontSize: 24,
                            fontWeight: 700,
                            lineHeight: '130%',
                            letterSpacing: '-0.02em',
                            color: '#2A2B3B',
                            margin: 0,
                        }}>
                            Thank You<br />for Choosing SmartMail!
                        </h1>
                        <p style={{
                            fontFamily: 'Satoshi, sans-serif',
                            fontSize: 14,
                            fontWeight: 500,
                            lineHeight: '150%',
                            letterSpacing: '0',
                            color: '#2A2B3B',
                            margin: 0,
                        }}>
                            We're excited to help you create smarter,<br />better emails.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="success-cta"
                        onClick={() => navigate({ to: '/' })}
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
}
