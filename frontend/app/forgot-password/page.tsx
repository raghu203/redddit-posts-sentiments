'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    BarChart2,
    Mail,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setError('');

        // Mock password reset request
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Left Panel - Hero Section (Shared with Login) */}
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
            }}>
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

                <div style={{ zIndex: 10, maxWidth: '540px' }}>
                    <h1 style={{
                        fontSize: '64px',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '24px',
                        letterSpacing: '-2px'
                    }}>
                        Secure.<br />Resilient.<br />Reliable.
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: '400'
                    }}>
                        Protecting your analysis and data is our priority.
                        Reset your access quickly and get back to gaining deep subreddit insights.
                    </p>
                </div>

                <div style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.4)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span>© 2026 RedditAlytics Dashboard. All rights reserved.</span>
                </div>
            </div>

            {/* Right Panel - Form Section */}
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
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '48px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.02)',
                    }}>
                        {!isSubmitted ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <h2 style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#1a1d2e',
                                        marginBottom: '8px',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        Forgot Password?
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                                        No worries! Enter your email and we'll send you reset instructions.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
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

                                    <div style={{ marginBottom: '28px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            marginBottom: '8px',
                                        }}>
                                            Email Address
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
                                                placeholder="alex@example.com"
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
                                            boxShadow: '0 8px 24px rgba(91, 94, 244, 0.25)',
                                            marginBottom: '24px',
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
                                                Send Reset Instructions
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: '#ecfdf5',
                                    color: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px',
                                }}>
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: '#1a1d2e',
                                    marginBottom: '8px',
                                    letterSpacing: '-0.5px'
                                }}>
                                    Check your mail
                                    Black</h2>
                                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                                    We've sent password reset instructions to <span style={{ fontWeight: '600', color: '#1a1d2e' }}>{email}</span>.
                                </p>
                            </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <Link href="/login" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                color: '#64748b',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'color 0.2s ease'
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                            >
                                <ArrowLeft size={16} />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
