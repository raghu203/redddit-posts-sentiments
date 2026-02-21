'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import LiveSyncBadge from '../ui/LiveSyncBadge';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // In a real app, you would clear cookies/tokens here
        router.push('/login');
    };

    return (
        <header style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            background: 'transparent',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            gap: '16px',
        }}>
            <LiveSyncBadge />
            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 8px',
                        borderRadius: '10px',
                        border: '1px solid transparent',
                        background: isOpen ? 'white' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                        if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                        if (!isOpen) e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '12px',
                    }}>
                        A
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>Alex Chen</span>
                    <ChevronDown size={14} color="var(--text-muted)" style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease'
                    }} />
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '200px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border)',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                    }}>
                        <div style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--border)',
                            marginBottom: '4px',
                        }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>Dr. Alex Chen</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>alex.chen@redditalytics.com</div>
                        </div>

                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s ease',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <User size={16} />
                            Profile Settings
                        </button>

                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s ease',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f4f6fb'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Settings size={16} />
                            Account Settings
                        </button>

                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                fontSize: '13px',
                                color: 'var(--negative)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--negative-bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
