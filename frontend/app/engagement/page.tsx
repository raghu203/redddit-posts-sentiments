'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

const API = 'http://localhost:5000';

const subColors: Record<string, string> = {
    'r/technology': '#5b5ef4', 'r/science': '#0ea5e9', 'r/space': '#8b5cf6',
    'r/worldnews': '#f59e0b', 'r/Python': '#22c55e', 'r/gaming': '#ef4444', 'r/movies': '#ec4899',
};

const getSentimentLabel = (score: number) => {
    if (score >= 0.05) return { label: 'Mostly Positive', color: '#16a34a', bg: '#dcfce7' };
    if (score <= -0.05) return { label: 'Mostly Negative', color: '#dc2626', bg: '#fee2e2' };
    return { label: 'Mixed', color: '#64748b', bg: '#f1f5f9' };
};

export default function SubredditComparisonPage() {
    const [selectedSub, setSelectedSub] = useState<string | null>(null);
    const [subredditSentiment, setSubredditSentiment] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/subreddits`)
            .then(r => r.json())
            .then(data => setSubredditSentiment(
                (data.subreddits || []).map((s: any) => ({
                    name: s.name, positive: s.positive_pct, neutral: s.neutral_pct,
                    negative: s.negative_pct, total: s.total, avgScore: s.avg_score,
                }))
            ))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = selectedSub ? subredditSentiment.filter(s => s.name === selectedSub) : subredditSentiment;
    const mostPositive = subredditSentiment.length ? subredditSentiment.reduce((a, b) => a.avgScore > b.avgScore ? a : b) : null;
    const mostNegative = subredditSentiment.length ? subredditSentiment.reduce((a, b) => a.avgScore < b.avgScore ? a : b) : null;
    const mostActive = subredditSentiment.length ? subredditSentiment.reduce((a, b) => a.total > b.total ? a : b) : null;

    // Compute totals for overall donut
    const totalPos = subredditSentiment.reduce((s, r) => s + r.positive, 0);
    const totalNeu = subredditSentiment.reduce((s, r) => s + r.neutral, 0);
    const totalNeg = subredditSentiment.reduce((s, r) => s + r.negative, 0);
    const grandTotal = totalPos + totalNeu + totalNeg || 1;
    const overallPie = [
        { name: 'Positive', value: Math.round(totalPos / subredditSentiment.length || 0), color: '#22c55e' },
        { name: 'Neutral', value: Math.round(totalNeu / subredditSentiment.length || 0), color: '#94a3b8' },
        { name: 'Negative', value: Math.round(totalNeg / subredditSentiment.length || 0), color: '#ef4444' },
    ];

    // Build radar data from live positivity scores
    const radarData = [
        { metric: 'Positivity', ...Object.fromEntries(subredditSentiment.map(s => [s.name, (s.positive / 100)])) },
        { metric: 'Negativity', ...Object.fromEntries(subredditSentiment.map(s => [s.name, (s.negative / 100)])) },
        { metric: 'Neutrality', ...Object.fromEntries(subredditSentiment.map(s => [s.name, (s.neutral / 100)])) },
        { metric: 'Volume', ...Object.fromEntries(subredditSentiment.map(s => [s.name, Math.min(s.total / 10, 1)])) },
        { metric: 'Avg Score', ...Object.fromEntries(subredditSentiment.map(s => [s.name, (s.avgScore + 1) / 2])) },
    ];

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Subreddit Comparison</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Compare sentiment distribution and engagement across subreddits</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<TrendingUp size={18} color="#22c55e" />} iconBg="#dcfce7" value={mostPositive?.name || '—'} label="Most Positive Subreddit" badge={mostPositive ? `Score: ${mostPositive.avgScore.toFixed(2)}` : '—'} badgeColor="green" />
                <StatCard icon={<TrendingDown size={18} color="#ef4444" />} iconBg="#fee2e2" value={mostNegative?.name || '—'} label="Most Negative Subreddit" badge={mostNegative ? `Score: ${mostNegative.avgScore.toFixed(2)}` : '—'} badgeColor="red" />
                <StatCard icon={<Activity size={18} color="#5b5ef4" />} value={mostActive?.name || '—'} label="Most Active Subreddit" badge={mostActive ? `${mostActive.total} posts` : '—'} badgeColor="blue" />
                <StatCard icon={<Users size={18} color="#8b5cf6" />} iconBg="#ede9fe" value={String(subredditSentiment.length)} label="Subreddits Tracked" badge="All Active" badgeColor="purple" />
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setSelectedSub(null)} style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '500', cursor: 'pointer', border: '1px solid var(--border)',
                    background: !selectedSub ? '#5b5ef4' : 'white', color: !selectedSub ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s',
                }}>All Subreddits</button>
                {subredditSentiment.map(s => (
                    <button key={s.name} onClick={() => setSelectedSub(s.name)} style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '500', cursor: 'pointer', border: '1px solid var(--border)',
                        background: selectedSub === s.name ? subColors[s.name] : 'white', color: selectedSub === s.name ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s',
                    }}>{s.name}</button>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Stacked Bar Chart */}
                <SectionCard title="Sentiment Distribution by Subreddit" subtitle="Percentage breakdown of Positive / Neutral / Negative per subreddit"
                    action={
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                            {[{ c: '#22c55e', l: 'Positive' }, { c: '#94a3b8', l: 'Neutral' }, { c: '#ef4444', l: 'Negative' }].map(s => (
                                <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.c, display: 'inline-block' }} />{s.l}
                                </span>
                            ))}
                        </div>
                    }
                >
                    <div style={{ height: '310px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filtered} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={32} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                <Tooltip formatter={(v: any) => `${v}%`} />
                                <Bar dataKey="positive" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="Positive" />
                                <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutral" />
                                <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} name="Negative" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Overall Donut */}
                <SectionCard title="Overall Sentiment Split">
                    <div style={{ height: '220px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={overallPie} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                                    {overallPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => `${v}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>46%</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>POSITIVE</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '4px' }}>
                        {overallPie.map(s => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />{s.name}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Radar */}
                <SectionCard title="Engagement Radar" subtitle="Normalized engagement metrics across top 5 subreddits">
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 1]} />
                                <Tooltip />
                                <Radar name="r/technology" dataKey="r/technology" stroke="#5b5ef4" fill="#5b5ef4" fillOpacity={0.15} strokeWidth={2} />
                                <Radar name="r/science" dataKey="r/science" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} />
                                <Radar name="r/space" dataKey="r/space" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Subreddit Cards */}
                <SectionCard title="Subreddit Sentiment Summary">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                        {subredditSentiment.map(s => {
                            const sentiment = getSentimentLabel(s.avgScore);
                            return (
                                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: selectedSub === s.name ? '#f8f9ff' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}
                                    onClick={() => setSelectedSub(selectedSub === s.name ? null : s.name)}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: subColors[s.name] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <BarChart2 size={16} color={subColors[s.name]} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{s.name}</div>
                                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{(s.total / 1000).toFixed(1)}k posts · Avg: {s.avgScore.toFixed(2)}</div>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: sentiment.bg, color: sentiment.color, flexShrink: 0 }}>{sentiment.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
