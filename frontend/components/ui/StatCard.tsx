import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    badge?: string;
    badgeColor?: 'green' | 'blue' | 'red' | 'gray' | 'purple';
    iconBg?: string;
}

const badgeStyles: Record<string, React.CSSProperties> = {
    green: { background: '#dcfce7', color: '#16a34a' },
    blue: { background: '#dbeafe', color: '#2563eb' },
    red: { background: '#fee2e2', color: '#dc2626' },
    gray: { background: '#f1f5f9', color: '#64748b' },
    purple: { background: '#ede9fe', color: '#7c3aed' },
};

export default function StatCard({ icon, value, label, badge, badgeColor = 'green', iconBg = '#ededfd' }: StatCardProps) {
    return (
        <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flex: 1,
            minWidth: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                    width: '38px', height: '38px', borderRadius: '9px',
                    background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
                {badge && (
                    <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '3px 8px',
                        borderRadius: '20px', ...badgeStyles[badgeColor],
                    }}>
                        {badge}
                    </span>
                )}
            </div>
            <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                    {value}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {label}
                </div>
            </div>
        </div>
    );
}
