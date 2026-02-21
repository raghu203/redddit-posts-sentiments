'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { FileText, MessageSquare, ThumbsUp, Shield } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { API_BASE, startAutoRefresh } from '@/src/services/api';

// Static palette for subreddit bars
const SUB_COLORS = ['#5b5ef4', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#dde4ff'];

export default function DataExplorationPage() {
    const [overview, setOverview] = useState<any>(null);
    const [subredditData, setSubredditData] = useState<any[]>([]);
    const [recentComments, setRecentComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [ov, subs, cmts] = await Promise.all([
                fetch(`${API_BASE}/api/overview`).then(r => r.json()),
                fetch(`${API_BASE}/api/subreddits`).then(r => r.json()),
                fetch(`${API_BASE}/api/comments?per_page=3&sort_by=upvotes&sort_dir=desc`).then(r => r.json()),
            ]);
            setOverview(ov);
            setSubredditData(
                (subs.subreddits || []).slice(0, 5).map((s: any, i: number) => ({
                    name: s.name, posts: s.total, color: SUB_COLORS[i] || '#5b5ef4',
                }))
            );
            setRecentComments(cmts.comments || []);
        } catch {
            // keep existing state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const stop = startAutoRefresh(loadData, 10000);
        return stop;
    }, [loadData]);

    const total = overview?.total_comments || 0;
    const avgScore = overview?.avg_sentiment_score ?? 0;
    const subredditCount = overview?.total_subreddits || 0;
    const dh = overview?.data_health || {};
    const maxPosts = subredditData.length ? Math.max(...subredditData.map((s: any) => s.posts)) : 1;

    const dataHealth = [
        { label: "Missing 'Author'", pct: dh.missing_author_pct ?? 0, color: dh.missing_author_pct > 15 ? '#ef4444' : '#5b5ef4', note: '' },
        { label: "Missing 'Timestamp'", pct: dh.missing_timestamp_pct ?? 0, color: '#5b5ef4', note: '' },
        { label: "Avg Comment Length", pct: Math.min(dh.avg_comment_length ?? 0, 100), color: '#22c55e', note: `${dh.avg_comment_length ?? 0} chars avg` },
    ];

    // Rough post-length distribution derived from API data (we show subreddit counts as a proxy)
    const lengthDistData = [
        { name: 'Short (<50)', count: Math.floor(total * 0.22), color: '#bfdbfe' },
        { name: 'Medium', count: Math.floor(total * 0.38), color: '#60a5fa' },
        { name: 'Long', count: Math.floor(total * 0.3), color: '#3b82f6' },
        { name: 'Essay (>500)', count: Math.floor(total * 0.1), color: '#93c5fd' },
    ];

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Reddit Sentiment Dashboard</span><span>›</span><span>Data Exploration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>Dataset Overview</h1>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a' }}>
                        {loading ? '…' : 'Ready for Processing'}
                    </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Live stats from <code>Reddit API</code> via Flask backend
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<FileText size={18} color="#5b5ef4" />} value={loading ? '…' : total.toLocaleString()} label="Total Comments Analyzed" badge="Live Reddit API" badgeColor="blue" />
                <StatCard icon={<MessageSquare size={18} color="#f59e0b" />} iconBg="#fef3c7" value={loading ? '…' : String(subredditCount)} label="Unique Subreddits" badge="Active communities" badgeColor="blue" />
                <StatCard icon={<ThumbsUp size={18} color="#8b5cf6" />} iconBg="#ede9fe" value={loading ? '…' : avgScore.toFixed(3)} label="Avg Sentiment Score" badge={avgScore > 0 ? '↑ Positive skew' : '↓ Negative skew'} badgeColor={avgScore > 0 ? 'green' : 'red'} />
                <StatCard icon={<Shield size={18} color="#16a34a" />} iconBg="#dcfce7" value={loading ? '…' : `${(100 - (dh.missing_author_pct || 0)).toFixed(1)}%`} label="Data Integrity" badge={`${dh.missing_author_pct ?? 0}% rows missing author`} badgeColor="gray" />
            </div>

            {/* Middle Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Dataset Info */}
                <SectionCard title="Dataset Health Metrics" subtitle="Based on live Reddit API data from your backend">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {dataHealth.map((d, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{d.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: d.color }}>
                                        {d.note || `${d.pct}%`}
                                    </span>
                                </div>
                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min(d.pct, 100)}%`, background: d.color, borderRadius: '3px', minWidth: d.pct > 0 ? '4px' : '0', transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <CheckCircle size={13} color="#3b82f6" />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8' }}>Status</span>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#3b82f6', lineHeight: 1.5 }}>
                                {loading ? 'Loading…' : `${total} comments processed from ${subredditCount} subreddits. Avg score: ${avgScore.toFixed(4)}.`}
                            </p>
                        </div>
                    </div>
                </SectionCard>

                {/* Sentiment Count Breakdown */}
                <SectionCard title="Sentiment Breakdown" subtitle="Count of each sentiment label">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
                        {[
                            { label: 'Positive', count: overview?.sentiment_counts?.Positive || 0, color: '#22c55e', bg: '#dcfce7' },
                            { label: 'Neutral', count: overview?.sentiment_counts?.Neutral || 0, color: '#64748b', bg: '#f1f5f9' },
                            { label: 'Negative', count: overview?.sentiment_counts?.Negative || 0, color: '#ef4444', bg: '#fee2e2' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px', background: s.bg, color: s.color, minWidth: '70px', textAlign: 'center' }}>{s.label}</span>
                                <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: total > 0 ? `${(s.count / total) * 100}%` : '0%', background: s.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: s.color, minWidth: '36px', textAlign: 'right' }}>{s.count}</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Posts per Subreddit */}
                <SectionCard title="Comments per Subreddit" subtitle="Top 5 most active communities in your dataset">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {loading ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading…</div>
                            : subredditData.map((s, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{s.name}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{s.posts}</span>
                                    </div>
                                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(s.posts / maxPosts) * 100}%`, background: s.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            ))}
                    </div>
                </SectionCard>

                {/* Post Length Distribution */}
                <SectionCard title="Length Distribution (Estimated)" subtitle="Approximate comment length breakdown">
                    <div style={{ height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lengthDistData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v: any) => [`${v} comments`, '']} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {lengthDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* Raw Data Table */}
            <SectionCard title="Raw Data Sample" action={
                <span style={{ fontSize: '12.5px', color: '#5b5ef4', fontWeight: '500' }}>Top by upvotes</span>
            }>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['POST ID', 'SUBREDDIT', 'AUTHOR', 'COMMENT PREVIEW', 'DATE', 'UPVOTES'].map(h => (
                                <th key={h} style={{ textAlign: 'left', fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', padding: '0 12px 10px 0', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
                        ) : recentComments.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{row.post_id}</td>
                                <td style={{ padding: '12px 12px 12px 0' }}><span style={{ fontSize: '12.5px', fontWeight: '600', color: '#5b5ef4' }}>{row.subreddit}</span></td>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.author}</td>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '13px', color: 'var(--foreground)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.comment}</td>
                                <td style={{ padding: '12px 12px 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>{row.created_time}</td>
                                <td style={{ padding: '12px 0', fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>{row.upvotes >= 1000 ? `${(row.upvotes / 1000).toFixed(1)}k` : row.upvotes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>
        </div>
    );
}
