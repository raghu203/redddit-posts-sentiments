'use client';

import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { FileText, MessageSquare, ThumbsUp, Shield } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const keywords = [
    { word: 'AI', size: 52, color: '#1e293b' }, { word: 'Regulation', size: 20, color: '#475569' },
    { word: 'Crypto', size: 40, color: '#1e293b' }, { word: 'Privacy', size: 18, color: '#64748b' },
    { word: 'Elon', size: 22, color: '#475569' }, { word: 'Climate', size: 18, color: '#475569' },
    { word: 'Tech', size: 34, color: '#1e293b' }, { word: 'Innovation', size: 22, color: '#475569' },
    { word: 'Layoffs', size: 18, color: '#64748b' }, { word: 'OpenAI', size: 28, color: '#5b5ef4' },
    { word: 'Data', size: 18, color: '#475569' }, { word: 'Security', size: 20, color: '#475569' },
    { word: 'Future', size: 38, color: '#1e293b' }, { word: 'Jobs', size: 16, color: '#94a3b8' },
    { word: 'Virtual', size: 16, color: '#94a3b8' }, { word: 'SpaceX', size: 26, color: '#1e293b' },
    { word: 'Silicon', size: 18, color: '#64748b' },
];

const subredditData = [
    { name: 'r/technology', posts: 450000, color: '#5b5ef4' },
    { name: 'r/futurism', posts: 210000, color: '#818cf8' },
    { name: 'r/gadgets', posts: 180000, color: '#a5b4fc' },
    { name: 'r/artificial', posts: 120000, color: '#c7d2fe' },
    { name: 'r/science', posts: 95000, color: '#e0e7ff' },
];

const postLengthData = [
    { name: 'Short', count: 28000, color: '#bfdbfe' },
    { name: 'Medium', count: 52000, color: '#60a5fa' },
    { name: 'Long', count: 68000, color: '#3b82f6' },
    { name: 'Essay', count: 38000, color: '#93c5fd' },
];

const rawData = [
    { id: '9x8j21', sub: 'r/technology', subColor: '#5b5ef4', author: 'u/tech_guru', title: 'New AI regulations proposed by EU committee...', date: '2023-09-12', score: '14.2k', scoreColor: '#16a34a' },
    { id: '8k2199', sub: 'r/futurism', subColor: '#8b5cf6', author: 'u/mars_rover', title: 'SpaceX successfully launches Starship v2...', date: '2023-09-11', score: '8.9k', scoreColor: '#16a34a' },
    { id: '7e4n55', sub: 'r/gadgets', subColor: '#f59e0b', author: 'null', title: 'Review: The new iPhone 15 feels like...', date: '2023-09-10', score: '2.1k', scoreColor: '#16a34a' },
];

const dataHealth = [
    { label: "Missing 'Selftext'", pct: 12.4, color: '#ef4444', note: '• Acceptable threshold: < 15%' },
    { label: "Missing 'Author'", pct: 0.1, color: '#5b5ef4', note: '' },
    { label: "Missing 'Timestamp'", pct: 0.0, color: '#5b5ef4', note: '' },
];

export default function DataExplorationPage() {
    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Project Alpha</span><span>›</span><span>Exploration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>Dataset Overview</h1>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a' }}>Ready for Processing</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Analysis of raw r/Technology and r/Futurism dumps (Q3 2023)</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<FileText size={18} color="#5b5ef4" />} value="1,245,892" label="Total Posts Analyzed" badge="↑ 12.5% vs last quarter" badgeColor="green" />
                <StatCard icon={<MessageSquare size={18} color="#f59e0b" />} iconBg="#fef3c7" value="45" label="Unique Subreddits" badge="Active communities" badgeColor="blue" />
                <StatCard icon={<ThumbsUp size={18} color="#8b5cf6" />} iconBg="#ede9fe" value="0.68" label="Avg. Sentiment Score" badge="↑ Positive skew" badgeColor="green" />
                <StatCard icon={<Shield size={18} color="#16a34a" />} iconBg="#dcfce7" value="98.2%" label="Data Integrity" badge="⚠ 1.8% rows dropped" badgeColor="gray" />
            </div>

            {/* Middle Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Word Cloud */}
                <SectionCard
                    title="Trending Keywords"
                    subtitle="Frequency analysis across all selected subreddits"
                    action={<Download size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center', padding: '8px 0', lineHeight: 2 }}>
                        {keywords.map((k, i) => (
                            <span key={i} style={{ fontSize: `${k.size}px`, fontWeight: k.size > 35 ? '800' : k.size > 25 ? '700' : k.size > 18 ? '500' : '400', color: k.color, cursor: 'pointer' }}>{k.word}</span>
                        ))}
                    </div>
                </SectionCard>

                {/* Data Health */}
                <SectionCard title="Data Health" subtitle="Missing value distribution">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {dataHealth.map((d, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{d.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: d.color }}>{d.pct}%</span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min(d.pct * 5, 100)}%`, background: d.color, borderRadius: '3px', minWidth: d.pct > 0 ? '4px' : '0' }} />
                                </div>
                                {d.note && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{d.note}</div>}
                            </div>
                        ))}
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <CheckCircle size={13} color="#3b82f6" />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8' }}>Recommendation</span>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#3b82f6', lineHeight: 1.5 }}>Drop rows with missing authors. Impute empty self-text with titles for sentiment analysis.</p>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Posts per Subreddit */}
                <SectionCard title="Posts per Subreddit" subtitle="Top 5 most active communities" action={<a href="#" style={{ fontSize: '12.5px', color: '#5b5ef4', textDecoration: 'none' }}>View All</a>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {subredditData.map((s, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{s.name}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{(s.posts / 1000).toFixed(0)}k</span>
                                </div>
                                <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(s.posts / 450000) * 100}%`, background: s.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Post Length */}
                <SectionCard title="Post Length Distribution" subtitle="Character count frequency (binned)" action={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>
                        LOG SCALE
                        <div style={{ width: '32px', height: '16px', borderRadius: '8px', background: '#3b82f6', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ position: 'absolute', right: '2px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'white' }} />
                        </div>
                    </div>
                }>
                    <div style={{ height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={postLengthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                                <Tooltip formatter={(v: any) => `${(v / 1000).toFixed(1)}k posts`} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {postLengthData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* Raw Data Table */}
            <SectionCard title="Raw Data Sample" action={
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#5b5ef4', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Download size={14} /> Export CSV
                </button>
            }>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['ID', 'SUBREDDIT', 'AUTHOR', 'TITLE PREVIEW', 'DATE', 'SCORE'].map(h => (
                                <th key={h} style={{ textAlign: 'left', fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', padding: '0 12px 10px 0', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rawData.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{row.id}</td>
                                <td style={{ padding: '12px 12px 12px 0' }}><span style={{ fontSize: '12.5px', fontWeight: '600', color: row.subColor }}>{row.sub}</span></td>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.author}</td>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '13px', color: 'var(--foreground)', maxWidth: '280px' }}>{row.title}</td>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>{row.date}</td>
                                <td style={{ padding: '12px 0', fontSize: '13px', fontWeight: '700', color: row.scoreColor }}>{row.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button style={{ width: '100%', marginTop: '16px', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', background: 'white', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}>
                    Load more rows
                </button>
            </SectionCard>
        </div>
    );
}
