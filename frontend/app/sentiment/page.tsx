'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Smile, Flame, ChevronDown, RefreshCw, ArrowUpRight, MessageCircle, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const API = 'http://localhost:5000';

const SUBREDDITS = ['All', 'r/technology', 'r/science', 'r/space', 'r/worldnews', 'r/Python'];
const TIMEFRAMES = ['Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days'];

const subColors: Record<string, string> = {
    'r/technology': '#5b5ef4', 'r/space': '#0ea5e9', 'r/science': '#22c55e',
    'r/worldnews': '#f97316', 'r/Python': '#f59e0b',
};

export default function SentimentPage() {
    const [selectedSub, setSelectedSub] = useState('All');
    const [selectedTime, setSelectedTime] = useState('Last 30 Days');
    const [sentimentInfo, setSentimentInfo] = useState<any>(null);
    const [subreddits, setSubreddits] = useState<any[]>([]);
    const [samplePosts, setSamplePosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (sub?: string) => {
        setRefreshing(true);
        try {
            const params = sub && sub !== 'All' ? `?subreddit=${encodeURIComponent(sub)}` : '';
            const [sentData, subData, commData] = await Promise.all([
                fetch(`${API}/api/sentiment${params}`).then(r => r.json()),
                fetch(`${API}/api/subreddits`).then(r => r.json()),
                fetch(`${API}/api/comments?per_page=5${sub && sub !== 'All' ? `&subreddit=${encodeURIComponent(sub)}` : ''}`).then(r => r.json()),
            ]);
            setSentimentInfo(sentData);
            setSubreddits(subData.subreddits || []);
            setSamplePosts(commData.comments || []);
        } catch {
            // fallback handled by empty state
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApplyFilters = () => fetchData(selectedSub);
    const handleRefresh = () => fetchData(selectedSub);

    // Build distribution bar data from API
    const distBars = sentimentInfo?.distribution?.map((b: any) => ({
        x: b.range,
        count: b.count,
        fill: parseFloat(b.range) >= 0.05 ? '#3b82f6' : parseFloat(b.range) <= -0.05 ? '#ef4444' : '#94a3b8',
    })) || [];

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left Panel */}
            <div style={{ flex: 1, padding: '24px 20px 24px 28px', overflowY: 'auto' }}>
                {/* Filters */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subreddit</div>
                        <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {SUBREDDITS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timeframe</div>
                        <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingTop: '16px' }}>
                        <button onClick={handleApplyFilters} disabled={refreshing}
                            style={{ padding: '8px 20px', background: '#5b5ef4', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: refreshing ? 0.6 : 1 }}>
                            {refreshing ? 'Loading…' : 'Apply Filters'}
                        </button>
                        <button onClick={handleRefresh} style={{ padding: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <RefreshCw size={14} color="var(--text-muted)" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <StatCard icon={<BarChart2 size={18} color="#5b5ef4" />} value={String(sentimentInfo?.total || 0)} label="TOTAL COMMENTS" badge={`${sentimentInfo?.percentages?.Positive || 0}% Positive`} badgeColor="green" />
                    <StatCard icon={<Smile size={18} color="#22c55e" />} iconBg="#dcfce7" value={sentimentInfo?.avg_score?.toFixed(2) || '0.00'} label="AVG SENTIMENT SCORE" />
                    <StatCard icon={<Flame size={18} color="#f97316" />} iconBg="#ffedd5" value={subreddits[0]?.name || '—'} label="MOST POSITIVE" badge="Top Ranked" badgeColor="gray" />
                </div>

                {/* Sentiment Distribution */}
                <SectionCard title="Sentiment Distribution" subtitle="Frequency of VADER compound scores (−1.0 to +1.0)" style={{ marginBottom: '20px' }}
                    action={
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                            {[{ c: '#ef4444', l: 'Negative' }, { c: '#94a3b8', l: 'Neutral' }, { c: '#3b82f6', l: 'Positive' }].map(s => (
                                <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.c, display: 'inline-block' }} />{s.l}
                                </span>
                            ))}
                        </div>
                    }
                >
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distBars} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v: any) => [`${v} comments`, 'Count']} />
                                <Bar dataKey="count" fill="#5b5ef4" radius={[3, 3, 0, 0]}>
                                    {distBars.map((b: any, i: number) => (
                                        <rect key={i} fill={b.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Subreddit Comparison */}
                <SectionCard title="Subreddit Comparison" action={<a href="/engagement" style={{ fontSize: '12.5px', color: '#5b5ef4', textDecoration: 'none', fontWeight: '500' }}>View Full Report →</a>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                        {subreddits.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', width: '120px', flexShrink: 0 }}>{s.name}</span>
                                <div style={{ flex: 1, height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                                    <div title={`Neg ${s.negative_pct}%`} style={{ width: `${s.negative_pct}%`, background: '#ef4444' }} />
                                    <div title={`Neu ${s.neutral_pct}%`} style={{ width: `${s.neutral_pct}%`, background: '#94a3b8' }} />
                                    <div title={`Pos ${s.positive_pct}%`} style={{ width: `${s.positive_pct}%`, background: '#3b82f6' }} />
                                </div>
                                <span style={{ fontSize: '11.5px', fontWeight: '600', color: s.avg_score >= 0 ? '#16a34a' : '#ef4444', width: '44px', textAlign: 'right' }}>
                                    {s.avg_score >= 0 ? '+' : ''}{s.avg_score}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Right Panel - Sample Posts */}
            <div style={{ width: '340px', borderLeft: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Sample Comments</h3>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a' }}>Live Data</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>Loading comments…</p>
                    ) : samplePosts.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>No comments found.</p>
                    ) : samplePosts.map((post, i) => {
                        const scoreColor = post.sentiment === 'Positive' ? '#16a34a' : post.sentiment === 'Negative' ? '#ef4444' : '#64748b';
                        const scoreBg = post.sentiment === 'Positive' ? '#dcfce7' : post.sentiment === 'Negative' ? '#fee2e2' : '#f1f5f9';
                        return (
                            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: subColors[post.subreddit] || '#5b5ef4' }}>{post.subreddit}</span>
                                    <span style={{ fontSize: '11.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: scoreBg, color: scoreColor }}>{post.score >= 0 ? '+' : ''}{post.score.toFixed(2)}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5, marginBottom: '6px' }}>{post.comment}</p>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={12} />{post.upvotes}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{post.created_time}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{post.author}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                    <a href="/messages" style={{ display: 'block', width: '100%', padding: '10px', border: 'none', background: 'none', color: '#5b5ef4', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                        Open Comment Explorer →
                    </a>
                </div>
            </div>
        </div>
    );
}
