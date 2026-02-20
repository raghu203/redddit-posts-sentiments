'use client';

import { useState } from 'react';
import { MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';

const emotions = ['Anger', 'Sadness', 'Fear', 'Joy', 'Disgust', 'Surprise'];
const subreddits = ['r/politics', 'r/technology', 'r/worldnews', 'r/gaming', 'r/aww', 'r/science'];

// Heatmap color intensity data [subreddit][emotion]
const heatmapData: Record<string, Record<string, string>> = {
    'r/politics': { Anger: '#ef4444', Sadness: '#e0e7ff', Fear: '#fde68a', Joy: '#d1fae5', Disgust: '#a78bfa', Surprise: '#fbcfe8' },
    'r/technology': { Anger: '#fca5a5', Sadness: '#c7d2fe', Fear: '#fef08a', Joy: '#a7f3d0', Disgust: '#ddd6fe', Surprise: '#fce7f3' },
    'r/worldnews': { Anger: '#f87171', Sadness: '#818cf8', Fear: '#f59e0b', Joy: '#6ee7b7', Disgust: '#e0e7ff', Surprise: '#fce7f3' },
    'r/gaming': { Anger: '#fca5a5', Sadness: '#a5b4fc', Fear: '#fde68a', Joy: '#6ee7b7', Disgust: '#ede9fe', Surprise: '#fce7f3' },
    'r/aww': { Anger: '#fee2e2', Sadness: '#e0e7ff', Fear: '#34d399', Joy: '#34d399', Disgust: '#f3f4f6', Surprise: '#fce7f3' },
    'r/science': { Anger: '#fecaca', Sadness: '#c7d2fe', Fear: '#fde68a', Joy: '#a7f3d0', Disgust: '#ede9fe', Surprise: '#fce7f3' },
};

const radarData = [
    { emotion: 'Anger', value: 0.78 },
    { emotion: 'Sadness', value: 0.45 },
    { emotion: 'Fear', value: 0.52 },
    { emotion: 'Joy', value: 0.38 },
    { emotion: 'Disgust', value: 0.61 },
    { emotion: 'Surprise', value: 0.42 },
];

const outliers = [
    {
        user: 'u/techno_skeptic', sub: 'r/technology', time: '2m ago',
        emotion: 'Anger: 0.98', emotionColor: '#ef4444', emotionBg: '#fee2e2', id: '#8f92a',
        text: "This is absolutely unacceptable. The new privacy policy explicitly states they can sell our data without consent. I'm cancelling my subscription immediately.",
        avatar: '#ef4444',
    },
    {
        user: 'u/sunny_lover_99', sub: 'r/aww', time: '15m ago',
        emotion: 'Joy: 0.95', emotionColor: '#16a34a', emotionBg: '#dcfce7', id: '#e3b1c4',
        text: "Just adopted this little guy from the shelter and he already knows his name! I've never felt so much love from an animal in my life. Best decision ever!",
        avatar: '#22c55e',
    },
];

export default function EmotionPage() {
    const [search, setSearch] = useState('');

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Emotion Analysis</h1>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>v2.4.0 (RoBERTa-large)</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {['24h', '7d', '30d'].map((t, i) => (
                        <button key={t} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: i === 1 ? '#5b5ef4' : 'white', color: i === 1 ? 'white' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '500', cursor: 'pointer' }}>{t}</button>
                    ))}
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#5b5ef4', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        ↓ Export Report
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<span style={{ fontSize: '18px' }}>💬</span>} value="142,893" label="Total Comments Analyzed" badge="↑ 12.5% vs last week" badgeColor="green" />
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Dominant Emotion</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Anger <span style={{ fontSize: '22px' }}>🔥</span>
                    </div>
                    <div style={{ height: '3px', background: '#ef4444', borderRadius: '2px', width: '60%', marginTop: '8px' }} />
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '5px' }}>42% intensity score across dataset</div>
                </div>
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Controversy Index</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)' }}>0.86</div>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#fee2e2', color: '#dc2626', display: 'inline-block', marginTop: '6px' }}>⚠ Critical Level</span>
                </div>
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Subjectivity Score</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)' }}>0.65</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Opinion-heavy discourse detected</div>
                </div>
            </div>

            {/* Heatmap + Radar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <SectionCard title="Emotion Density Heatmap" subtitle="Cross-reference of core emotions against top subreddits"
                    action={<MoreHorizontal size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }} />
                                    {emotions.map(e => (
                                        <th key={e} style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center', padding: '0 0 8px' }}>{e}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {subreddits.map(sub => (
                                    <tr key={sub}>
                                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingRight: '8px', whiteSpace: 'nowrap', fontWeight: '500' }}>{sub}</td>
                                        {emotions.map(e => (
                                            <td key={e} style={{ padding: '2px' }}>
                                                <div style={{
                                                    width: '100%', height: '36px', borderRadius: '6px',
                                                    background: heatmapData[sub]?.[e] || '#f1f5f9',
                                                    cursor: 'pointer', transition: 'transform 0.15s',
                                                }}
                                                    onMouseEnter={e2 => (e2.currentTarget.style.transform = 'scale(1.05)')}
                                                    onMouseLeave={e2 => (e2.currentTarget.style.transform = 'scale(1)')}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            INTENSITY
                            <div style={{ width: '80px', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #fce7f3, #ef4444)' }} />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Aggregate Fingerprint" subtitle="Overall emotional skew">
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Radar dataKey="value" stroke="#5b5ef4" fill="#5b5ef4" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: '#5b5ef4' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* High Intensity Outliers */}
            <SectionCard title="High Intensity Outliers" subtitle="Comments with >0.9 confidence score in primary emotion"
                action={
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', borderRadius: '7px', padding: '6px 10px', background: 'white' }}>
                            <Search size={13} color="var(--text-muted)" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search comments..." style={{ border: 'none', outline: 'none', fontSize: '12.5px', color: 'var(--text-secondary)', width: '140px', background: 'transparent' }} />
                        </div>
                        <button style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '7px', background: 'white', cursor: 'pointer' }}>
                            <SlidersHorizontal size={14} color="var(--text-muted)" />
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                    {outliers.map((o, i) => (
                        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: o.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: '700' }}>
                                        {o.user[2].toUpperCase()}
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{o.user}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>{o.sub} • {o.time}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: o.emotionBg, color: o.emotionColor }}>{o.emotion}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {o.id}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{o.text}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}
