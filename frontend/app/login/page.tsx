'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BarChart2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Mock login delay
        setTimeout(() => {
            if (email === 'admin@redditalytics.com' && password === 'admin') {
                router.push('/overview');
            } else if (!email || !password) {
                setError('Please fill in all fields');
                setIsLoading(false);
            } else {
                setError('Invalid credentials. Try admin@redditalytics.com / admin');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Left Panel - Hero Section */}
            <div style={{
                flex: '0 0 60%',
                background: 'linear-gradient(135deg, #050510 0%, #0c0c2a 100%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '60px',
                color: 'white',
                overflow: 'hidden',
                '@media (max-width: 1024px)': {
                    display: 'none'
                }
            } as any}>
                {/* Background Blobs */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(91, 94, 244, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                }} />

                {/* Branding */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(91, 94, 244, 0.4)',
                    }}>
                        <BarChart2 size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                        RedditAlytics
                    </span>
                </div>

                {/* Hero Text */}
                <div style={{ zIndex: 10, maxWidth: '540px' }}>
                    <h1 style={{
                        fontSize: '64px',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '24px',
                        letterSpacing: '-2px'
                    }}>
                        Analyze.<br />Visualize.<br />Understand.
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: '400'
                    }}>
                        The most advanced Reddit sentiment analysis platform powered by machine learning.
                        Identify trends, track emotions, and gain deep insights before they go viral.
                    </p>
                </div>

                {/* Footer Credits */}
                <div style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.4)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span>© 2026 RedditAlytics Dashboard. All rights reserved.</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                        N
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Section */}
            <div style={{
                flex: 1,
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '440px',
                }}>
                    {/* Centered Login Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '48px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.02)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1a1d2e',
                                marginBottom: '8px',
                                letterSpacing: '-0.5px'
                            }}>
                                RedditAlytics Portal
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '15px' }}>
                                Sign in to access your analytics dashboard
                            </p>
                        </div>

                        <form onSubmit={handleLogin}>
                            {/* Error Message */}
                            {error && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: '#fff1f2',
                                    color: '#e11d48',
                                    fontSize: '13px',
                                    marginBottom: '24px',
                                    border: '1px solid rgba(225, 29, 72, 0.1)',
                                }}>
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    marginBottom: '8px',
                                }}>
                                    Work Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8',
                                    }}>
                                        <Mail size={18} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="admin@redditalytics.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 48px',
                                            borderRadius: '14px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '15px',
                                            outline: 'none',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-light)';
                                            e.currentTarget.style.background = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.background = '#f8fafc';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div style={{ marginBottom: '28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <label style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#475569',
                                    }}>
                                        Password
                                    </label>
                                    <Link href="/forgot-password" style={{
                                        fontSize: '13px',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}>
                                        Forgot?
                                    </Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8',
                                    }}>
                                        <Lock size={18} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 48px 14px 48px',
                                            borderRadius: '14px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '15px',
                                            outline: 'none',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-light)';
                                            e.currentTarget.style.background = '#fff';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.background = '#f8fafc';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                            padding: '4px',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '14px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.3s ease',
                                    opacity: isLoading ? 0.7 : 1,
                                    boxShadow: '0 8px 24px rgba(91, 94, 244, 0.25)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(91, 94, 244, 0.35)';
                                        e.currentTarget.style.background = '#4a4df0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(91, 94, 244, 0.25)';
                                    e.currentTarget.style.background = 'var(--primary)';
                                }}
                            >
                                {isLoading ? (
                                    <div style={{
                                        width: '22px',
                                        height: '22px',
                                        border: '2.5px solid white',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                ) : (
                                    <>
                                        Sign In to Dashboard
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Test Credentials Hint */}
                        <div style={{
                            marginTop: '32px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px dashed #e2e8f0',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                Test Credentials
                            </p>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>
                                <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>admin@redditalytics.com</code> / <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>admin</code>
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                            Need an enterprise account? <Link href="/contact-sales" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Contact Sales</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 1024px) {
                    .hero-panel { display: none !important; }
                }
            `}</style>
        </div>
    );
}
