'use client';

import { Bell, Calendar, FileText, MessageSquare, Clock, ThumbsUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useState, useEffect } from 'react';

const API = 'http://localhost:5000';

const COLORS = { Positive: '#22c55e', Neutral: '#94a3b8', Negative: '#ef4444' };

const trendingTopics = [
    { word: 'AI', size: 32, color: '#1e293b' }, { word: 'SpaceX', size: 28, color: '#1e293b' },
    { word: 'OpenAI', size: 22, color: '#5b5ef4' }, { word: 'Inflation', size: 20, color: '#ef4444' },
    { word: 'Climate', size: 18, color: '#475569' }, { word: 'Python', size: 16, color: '#475569' },
    { word: 'Research', size: 20, color: '#1e293b' }, { word: 'Breakthrough', size: 17, color: '#16a34a' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: '#1e293b', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: '600' }}>{label}</div>
                <div>{payload[0].value} comments</div>
            </div>
        );
    }
    return null;
};

export default function OverviewPage() {
    const [chartView, setChartView] = useState<'Daily' | 'Weekly'>('Daily');
    const [overview, setOverview] = useState<any>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-01-15');

    useEffect(() => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        setLoading(true);
        Promise.all([
            fetch(`${API}/api/overview?${params}`).then(r => r.json()),
            fetch(`${API}/api/trends?${params}`).then(r => r.json()),
        ]).then(([ov, tr]) => {
            setOverview(ov);
            setTrendData((tr.trends || []).map((t: any) => ({ date: t.date, posts: t.total })));
        }).catch(() => {
            // Fallback if backend not reachable
            setOverview({ total_comments: 30, total_subreddits: 5, avg_sentiment_score: 0.18, sentiment_counts: { Positive: 14, Neutral: 9, Negative: 7 }, most_active_subreddit: 'r/space', most_positive_subreddit: 'r/science', most_negative_subreddit: 'r/worldnews' });
            setTrendData([{ date: 'Jan 02', posts: 2 }, { date: 'Jan 03', posts: 4 }, { date: 'Jan 04', posts: 3 }]);
        }).finally(() => setLoading(false));
    }, [startDate, endDate]);

    const sentimentData = overview ? [
        { name: 'Positive', value: overview.sentiment_counts.Positive, color: COLORS.Positive },
        { name: 'Neutral', value: overview.sentiment_counts.Neutral, color: COLORS.Neutral },
        { name: 'Negative', value: overview.sentiment_counts.Negative, color: COLORS.Negative },
    ] : [];

    const total = overview?.total_comments || 0;
    const posPct = total > 0 ? Math.round((sentimentData[0]?.value || 0) / total * 100) : 0;

    const sentimentShifts = overview ? [
        { sub: overview.most_positive_subreddit, prefix: overview.most_positive_subreddit?.slice(2, 4).toUpperCase(), sentiment: 'Positive', change: '↑ Best', color: '#16a34a', bg: '#dcfce7' },
        { sub: overview.most_negative_subreddit, prefix: overview.most_negative_subreddit?.slice(2, 4).toUpperCase(), sentiment: 'Negative', change: '↓ Worst', color: '#ef4444', bg: '#fee2e2' },
        { sub: overview.most_active_subreddit, prefix: overview.most_active_subreddit?.slice(2, 4).toUpperCase(), sentiment: 'Most Active', change: '🔥 Top', color: '#5b5ef4', bg: '#ededfd' },
    ] : [];

    if (loading) return (
        <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#5b5ef4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading dashboard…</p>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Overview Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '12px', color: 'inherit', outline: 'none', cursor: 'pointer' }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>–</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '12px', color: 'inherit', outline: 'none', cursor: 'pointer' }}
                        />
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                        <Bell size={16} color="var(--text-secondary)" />
                        <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid white' }} />
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<FileText size={18} color="#5b5ef4" />} value={overview?.total_comments?.toLocaleString()} label="Total Comments Analyzed" badge="Live" badgeColor="blue" />
                <StatCard icon={<MessageSquare size={18} color="#f59e0b" />} iconBg="#fef3c7" value={String(overview?.total_subreddits)} label="Subreddits Tracked" badge="Active" badgeColor="blue" />
                <StatCard icon={<Clock size={18} color="#f97316" />} iconBg="#ffedd5" value="15 Days" label="Analysis Period" />
                <StatCard icon={<ThumbsUp size={18} color="#8b5cf6" />} iconBg="#ede9fe" value={overview?.avg_sentiment_score?.toFixed(2)} label="Avg. Sentiment Score" badge={overview?.avg_sentiment_score > 0 ? 'Positive Trend' : 'Negative Trend'} badgeColor={overview?.avg_sentiment_score > 0 ? 'green' : 'red'} />
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
                                <Tooltip formatter={(v: any, name) => [`${v} comments`, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)' }}>{posPct}%</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>POSITIVE</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
                        {sentimentData.map(s => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                {s.name} ({s.value})
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Trend Chart */}
                <SectionCard title="Comments Over Time" subtitle="Daily frequency of analyzed comments"
                    action={
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['Daily', 'Weekly'] as const).map(v => (
                                <button key={v} onClick={() => setChartView(v)} style={{
                                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', border: 'none',
                                    background: chartView === v ? '#5b5ef4' : '#f1f5f9',
                                    color: chartView === v ? 'white' : 'var(--text-secondary)',
                                }}>{v}</button>
                            ))}
                        </div>
                    }
                >
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5b5ef4" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#5b5ef4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="posts" stroke="#5b5ef4" strokeWidth={2.5} fill="url(#postGrad)" dot={false} activeDot={{ r: 5, fill: '#5b5ef4' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
                <SectionCard title="Subreddit Sentiment Summary" action={<a href="/engagement" style={{ fontSize: '13px', color: '#5b5ef4', textDecoration: 'none', fontWeight: '500' }}>View Full →</a>}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['SUBREDDIT', 'SENTIMENT', 'CHANGE'].map(h => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard title="Trending Topics">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', alignItems: 'center', padding: '8px 0', lineHeight: 1.8 }}>
                        {trendingTopics.map((t, i) => (
                            <a key={i} href={`https://www.reddit.com/search/?q=${encodeURIComponent(t.word)}`} target="_blank" rel="noopener noreferrer"
                                style={{ textDecoration: 'none', fontSize: `${t.size}px`, fontWeight: t.size > 24 ? '700' : t.size > 18 ? '600' : '400', color: t.color, cursor: 'pointer', transition: 'opacity 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >{t.word}</a>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
