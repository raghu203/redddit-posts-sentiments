'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    BarChart2,
    Mail,
    ArrowRight,
    ArrowLeft,
    Building2,
    Users,
    MessageSquare,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function ContactSalesPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        teamSize: '1-10',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError('');

        // Mock sales lead submission
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
                        Scale.<br />Empower.<br />Succeed.
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: '400'
                    }}>
                        Unlock enterprise-grade subreddit analysis features for your entire team.
                        Custom integrations, advanced emotional tracking, and priority support.
                    </p>
                </div>

                <div style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.4)',
                    zIndex: 10,
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
                    maxWidth: '480px',
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '40px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.02)',
                    }}>
                        {!isSubmitted ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                    <h2 style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#1a1d2e',
                                        marginBottom: '8px',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        Contact Enterprise Sales
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                                        Fill out the form below and our team will get back to you shortly.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {error && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            background: '#fff1f2',
                                            color: '#e11d48',
                                            fontSize: '13px',
                                            marginBottom: '20px',
                                        }}>
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name *</label>
                                            <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Work Email *</label>
                                            <input name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="john@company.com" />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Company Name</label>
                                            <input name="company" value={formData.company} onChange={handleChange} style={inputStyle} placeholder="Acme Inc." />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Team Size</label>
                                            <select name="teamSize" value={formData.teamSize} onChange={handleChange} style={inputStyle}>
                                                <option value="1-10">1-10 employees</option>
                                                <option value="11-50">11-50 employees</option>
                                                <option value="51-200">51-200 employees</option>
                                                <option value="201+">201+ employees</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>How can we help? *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                            placeholder="Tell us about your analysis needs..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 8px 20px rgba(91, 94, 244, 0.2)',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        {isLoading ? 'Submitting...' : 'Send Inquiry'}
                                        {!isLoading && <ArrowRight size={18} />}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
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
                                <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1a1d2e', marginBottom: '12px' }}>Request Received</h2>
                                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                                    Thanks for reaching out! One of our enterprise specialists will contact you at <span style={{ fontWeight: '600', color: '#1a1d2e' }}>{formData.email}</span> within 24 hours.
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
                                fontWeight: '500'
                            }}>
                                <ArrowLeft size={16} />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
};
