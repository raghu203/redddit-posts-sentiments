'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Database,
    MessageSquare,
    Heart,
    Cloud,
    BarChart2,
    Download,
    Settings,
    Mail,
    List,
} from 'lucide-react';

const mainNav = [
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/data-exploration', label: 'Data Sources', icon: Database },
    { href: '/sentiment', label: 'Sentiment Analysis', icon: MessageSquare },
    { href: '/emotion', label: 'Emotion Analysis', icon: Heart },
    { href: '/trends', label: 'Word Cloud', icon: Cloud },
    { href: '/engagement', label: 'Subreddit Comparison', icon: BarChart2 },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/threads', label: 'Reddit Threads', icon: List },
];

const systemNav = [
    { href: '/insights', label: 'Export Data', icon: Download },
    { href: '/model-performance', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
            <Link href={href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'all 0.15s ease',
                marginBottom: '2px',
            }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#f8f9fc'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
            </Link>
        );
    };

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            minWidth: 'var(--sidebar-width)',
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 50,
            padding: '0',
        }}>
            {/* Logo */}
            <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '7px',
                        background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <BarChart2 size={15} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)', letterSpacing: '-0.3px' }}>
                        RedditAlytics
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px', marginBottom: '8px' }}>
                    Main Menu
                </div>
                {mainNav.map(item => <NavItem key={item.href} {...item} />)}

                <div style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px', margin: '16px 0 8px' }}>
                    System
                </div>
                {systemNav.map(item => <NavItem key={item.href} {...item} />)}
            </nav>

            {/* User */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0,
                }}>
                    A
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--foreground)' }}>Dr. Alex Chen</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lead Researcher</div>
                </div>
            </div>
        </aside>
    );
}
