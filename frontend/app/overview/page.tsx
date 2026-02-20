'use client';

import { Bell, Calendar } from 'lucide-react';
import { FileText, MessageSquare, Clock, ThumbsUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { useState } from 'react';

const sentimentData = [
    { name: 'Positive', value: 45, color: '#5b5ef4' },
    { name: 'Neutral', value: 35, color: '#94a3b8' },
    { name: 'Negative', value: 20, color: '#ef4444' },
];

const dailyData = [
    { date: 'Oct 1', posts: 480 }, { date: 'Oct 15', posts: 620 },
    { date: 'Nov 1', posts: 1580 }, { date: 'Nov 15', posts: 1200 },
    { date: 'Dec 1', posts: 900 }, { date: 'Dec 8', posts: 1800 },
    { date: 'Dec 14', posts: 2341 }, { date: 'Dec 20', posts: 1600 },
    { date: 'Dec 31', posts: 2100 },
];

const weeklyData = [
    { date: 'W1', posts: 3200 }, { date: 'W2', posts: 4100 },
    { date: 'W3', posts: 5800 }, { date: 'W4', posts: 4900 },
    { date: 'W5', posts: 6200 }, { date: 'W6', posts: 8100 },
    { date: 'W7', posts: 9200 }, { date: 'W8', posts: 7400 },
];

const sentimentShifts = [
    { sub: 'r/technology', prefix: 'r/T', sentiment: 'Negative', change: '-15%', date: 'Just now', color: '#ef4444', bg: '#fee2e2' },
    { sub: 'r/science', prefix: 'r/S', sentiment: 'Positive', change: '+8%', date: '2h ago', color: '#16a34a', bg: '#dcfce7' },
    { sub: 'r/dataisbeautiful', prefix: 'r/D', sentiment: 'Neutral', change: '0%', date: '5h ago', color: '#64748b', bg: '#f1f5f9' },
];

const trendingTopics = [
    { word: 'AI', size: 32, color: '#1e293b' },
    { word: 'Climate', size: 18, color: '#475569' },
    { word: 'SpaceX', size: 28, color: '#1e293b' },
    { word: 'Inflation', size: 20, color: '#ef4444' },
    { word: 'OpenAI', size: 22, color: '#5b5ef4' },
    { word: 'Python', size: 16, color: '#475569' },
    { word: 'Research', size: 20, color: '#1e293b' },
    { word: 'Breakthrough', size: 17, color: '#16a34a' },
    { word: 'Algorithm', size: 24, color: '#1e293b' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1e293b', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: '600' }}>{label}</div>
                <div>{payload[0].value.toLocaleString()} posts</div>
            </div>
        );
    }
    return null;
};

export default function OverviewPage() {
    const [chartView, setChartView] = useState<'Daily' | 'Weekly'>('Daily');
    const data = chartView === 'Daily' ? dailyData : weeklyData;

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Overview Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
                        padding: '7px 12px', fontSize: '13px', color: 'var(--text-secondary)',
                    }}>
                        <Calendar size={14} />
                        Oct 1, 2023 – Dec 31, 2023
                    </div>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'white', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
                    }}>
                        <Bell size={16} color="var(--text-secondary)" />
                        <span style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444',
                            border: '1.5px solid white',
                        }} />
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<FileText size={18} color="#5b5ef4" />} value="142,893" label="Total Scraped Posts" badge="↑ 12.5%" badgeColor="green" />
                <StatCard icon={<MessageSquare size={18} color="#f59e0b" />} iconBg="#fef3c7" value="15" label="Subreddits Tracked" badge="Active" badgeColor="blue" />
                <StatCard icon={<Clock size={18} color="#f97316" />} iconBg="#ffedd5" value="92 Days" label="Analysis Period" />
                <StatCard icon={<ThumbsUp size={18} color="#8b5cf6" />} iconBg="#ede9fe" value="+0.65" label="Avg. Sentiment Score" badge="Positive Trend" badgeColor="purple" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '16px', marginBottom: '20px' }}>
                {/* Sentiment Donut */}
                <SectionCard title="Sentiment Distribution">
                    <div style={{ height: '220px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                                    {sentimentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => `${v}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)' }}>45%</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>POSITIVE</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
                        {sentimentData.map(s => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                {s.name}
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Post Volume */}
                <SectionCard
                    title="Post Volume Over Time"
                    subtitle="Daily frequency of submissions across all tracked subreddits"
                    action={
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['Daily', 'Weekly'] as const).map(v => (
                                <button key={v} onClick={() => setChartView(v)} style={{
                                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none',
                                    background: chartView === v ? '#5b5ef4' : '#f1f5f9',
                                    color: chartView === v ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.15s',
                                }}>{v}</button>
                            ))}
                        </div>
                    }
                >
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5b5ef4" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#5b5ef4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="posts" stroke="#5b5ef4" strokeWidth={2.5} fill="url(#postGrad)" dot={false} activeDot={{ r: 5, fill: '#5b5ef4' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
                {/* Sentiment Shifts */}
                <SectionCard
                    title="Notable Sentiment Shifts"
                    action={<a href="#" style={{ fontSize: '13px', color: '#5b5ef4', textDecoration: 'none', fontWeight: '500' }}>View All →</a>}
                >
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['SUBREDDIT', 'SENTIMENT', 'CHANGE', 'DATE'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', padding: '0 0 10px', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sentimentShifts.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#5b5ef4', flexShrink: 0 }}>{row.prefix}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{row.sub}</span>
                                    </td>
                                    <td style={{ padding: '12px 0' }}>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: row.bg, color: row.color }}>{row.sentiment}</span>
                                    </td>
                                    <td style={{ padding: '12px 0', fontSize: '13px', fontWeight: '600', color: row.color }}>{row.change}</td>
                                    <td style={{ padding: '12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>

                {/* Trending Topics */}
                <SectionCard title="Trending Topics">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', alignItems: 'center', padding: '8px 0', lineHeight: 1.8 }}>
                        {trendingTopics.map((t, i) => (
                            <a
                                key={i}
                                href={`https://www.reddit.com/search/?q=${encodeURIComponent(t.word)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    textDecoration: 'none',
                                    fontSize: `${t.size}px`,
                                    fontWeight: t.size > 24 ? '700' : t.size > 18 ? '600' : '400',
                                    color: t.color,
                                    cursor: 'pointer',
                                    transition: 'opacity 0.15s'
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                {t.word}
                            </a>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
