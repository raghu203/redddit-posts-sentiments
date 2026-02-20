import React from 'react';

interface SectionCardProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export default function SectionCard({ title, subtitle, action, children, style }: SectionCardProps) {
    return (
        <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            ...style,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: subtitle ? '4px' : '16px' }}>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>{title}</h3>
                    {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
            {subtitle && <div style={{ marginTop: '16px' }}>{children}</div>}
            {!subtitle && children}
        </div>
    );
}
