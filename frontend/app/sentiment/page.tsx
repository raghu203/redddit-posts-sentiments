'use client';

import { useState } from 'react';
import { BarChart2, Smile, Flame, ChevronDown, RefreshCw, ArrowUpRight, MessageCircle, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const sentimentBars = [
    { x: '-1.0', neg: 120, neu: 0, pos: 0 },
    { x: '-0.8', neg: 180, neu: 0, pos: 0 },
    { x: '-0.6', neg: 140, neu: 0, pos: 0 },
    { x: '-0.4', neg: 110, neu: 0, pos: 0 },
    { x: '-0.2', neg: 90, neu: 0, pos: 0 },
    { x: '0.0', neg: 0, neu: 280, pos: 0 },
    { x: '0.2', neg: 0, neu: 320, pos: 0 },
    { x: '0.4', neg: 0, neu: 310, pos: 0 },
    { x: '0.6', neg: 0, neu: 0, pos: 480 },
    { x: '0.8', neg: 0, neu: 0, pos: 380 },
    { x: '1.0', neg: 0, neu: 0, pos: 120 },
];

const subredditComparison = [
    { name: 'r/technology', neg: 35, neu: 25, pos: 40 },
    { name: 'r/stocks', neg: 30, neu: 30, pos: 40 },
    { name: 'r/science', neg: 20, neu: 30, pos: 50 },
    { name: 'r/gaming', neg: 40, neu: 25, pos: 35 },
];

const samplePosts = [
    {
        sub: 'r/technology', score: '-0.82 Neg', scoreColor: '#ef4444', scoreBg: '#fee2e2',
        title: 'The new API pricing changes are absolutely devastating for third-party developers.',
        body: "This move essentially kills all innovation in the ecosystem. I've been developing tools for 5 years and this overnight change makes my entire business model...",
        upvotes: '14.2k', comments: '842', time: '2h ago',
    },
    {
        sub: 'r/space', score: '+0.94 Pos', scoreColor: '#16a34a', scoreBg: '#dcfce7',
        title: 'Incredible achievement! First successful landing on the south pole.',
        body: 'Watching the livestream was breathtaking. The engineering precision required for this maneuver is just mind-blowing. Congratulations to the entire team for...',
        upvotes: '42.1k', comments: '3.2k', time: '5h ago',
    },
    {
        sub: 'r/investing', score: '0.05 Neu', scoreColor: '#64748b', scoreBg: '#f1f5f9',
        title: 'Federal Reserve releases minutes from July meeting.',
        body: 'The minutes indicate a potential pause in rate hikes, though inflation targets remain the priority. Several members noted the labor market is softening slightly. Li...',
        upvotes: '856', comments: '112', time: '12h ago',
    },
    {
        sub: 'r/gaming', score: '-0.65 Neg', scoreColor: '#ef4444', scoreBg: '#fee2e2',
        title: 'Server stability is unacceptable for a AAA title launch.',
        body: "Can't believe I paid $70 for a login screen simulator. We've been waiting 3 years for this and the networking code is clearly broken. Fix your servers!",
        upvotes: '22.4k', comments: '4.5k', time: '1h ago',
    },
    {
        sub: 'r/upliftingnews', score: '+0.88 Pos', scoreColor: '#16a34a', scoreBg: '#dcfce7',
        title: 'Local community plants 5,000 trees in a single weekend.',
        body: 'Volunteers from all over the county showed up to help restore the local park. It was amazing to see everyone working together for a greener future...',
        upvotes: '15.3k', comments: '230', time: '8h ago',
    },
];

const subColors: Record<string, string> = {
    'r/technology': '#5b5ef4', 'r/space': '#0ea5e9', 'r/investing': '#f59e0b',
    'r/gaming': '#ef4444', 'r/upliftingnews': '#22c55e',
};

export default function SentimentPage() {
    const [subreddits] = useState('r/technology, r/investing...');
    const [timeframe] = useState('Last 30 Days');

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left Panel */}
            <div style={{ flex: 1, padding: '24px 20px 24px 28px', overflowY: 'auto' }}>
                {/* Filters */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subreddits</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: '7px', padding: '7px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {subreddits} <ChevronDown size={14} />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timeframe</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: '7px', padding: '7px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {timeframe} <ChevronDown size={14} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingTop: '16px' }}>
                        <button style={{ padding: '8px 20px', background: '#5b5ef4', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Apply Filters</button>
                        <button style={{ padding: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><RefreshCw size={14} color="var(--text-muted)" /></button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <StatCard icon={<BarChart2 size={18} color="#5b5ef4" />} value="142,893" label="TOTAL VOLUME" badge="↑ 12.5% vs last period" badgeColor="green" />
                    <StatCard icon={<Smile size={18} color="#22c55e" />} iconBg="#dcfce7" value="+0.42" label="AVG SENTIMENT" />
                    <StatCard icon={<Flame size={18} color="#f97316" />} iconBg="#ffedd5" value="r/ArtificialInt..." label="MOST ACTIVE" badge="Contributes 34% of dataset" badgeColor="gray" />
                </div>

                {/* Sentiment Distribution */}
                <SectionCard title="Sentiment Distribution" subtitle="Frequency of polarity scores (-1.0 to +1.0)" style={{ marginBottom: '20px' }}
                    action={
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                            {[{ c: '#ef4444', l: 'Neg' }, { c: '#94a3b8', l: 'Neu' }, { c: '#3b82f6', l: 'Pos' }].map(s => (
                                <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.c, display: 'inline-block' }} />{s.l}
                                </span>
                            ))}
                        </div>
                    }
                >
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentimentBars} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="neg" fill="#ef4444" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="neu" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="pos" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Subreddit Comparison */}
                <SectionCard title="Subreddit Comparison" action={<a href="#" style={{ fontSize: '12.5px', color: '#5b5ef4', textDecoration: 'none', fontWeight: '500' }}>View Full Report</a>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                        {subredditComparison.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', width: '110px', flexShrink: 0 }}>{s.name}</span>
                                <div style={{ flex: 1, height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                                    <div style={{ width: `${s.neg}%`, background: '#ef4444' }} />
                                    <div style={{ width: `${s.neu}%`, background: '#94a3b8' }} />
                                    <div style={{ width: `${s.pos}%`, background: '#3b82f6' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Right Panel - Sample Posts */}
            <div style={{ width: '340px', borderLeft: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Sample Posts</h3>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a' }}>Live Feed</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {samplePosts.map((post, i) => (
                        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: subColors[post.sub] || '#5b5ef4' }}>{post.sub}</span>
                                <span style={{ fontSize: '11.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: post.scoreBg, color: post.scoreColor }}>{post.score}</span>
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '5px', lineHeight: 1.4 }}>{post.title}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>{post.body}</p>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={12} />{post.upvotes}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageCircle size={12} />{post.comments}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{post.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                    <button style={{ width: '100%', padding: '10px', border: 'none', background: 'none', color: '#5b5ef4', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Load More Posts</button>
                </div>
            </div>
        </div>
    );
}
