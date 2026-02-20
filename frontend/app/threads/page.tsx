'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, MessageSquare, Share2, Bookmark, TrendingUp } from 'lucide-react';
import { threads } from '@/lib/threadData';

const subreddits = ['All', 'r/technology', 'r/science', 'r/space', 'r/worldnews', 'r/Python'];

const sentimentStyle = (s: string) => {
    if (s === 'Positive') return { color: '#16a34a', bg: '#dcfce7' };
    if (s === 'Negative') return { color: '#ef4444', bg: '#fee2e2' };
    return { color: '#64748b', bg: '#f1f5f9' };
};

const formatUpvotes = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export default function ThreadsPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [sort, setSort] = useState<'Hot' | 'New' | 'Top'>('Hot');

    const filtered = activeFilter === 'All'
        ? threads
        : threads.filter(t => t.subreddit === activeFilter);

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '2px' }}>Reddit Threads</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Browse and analyze scraped Reddit posts with sentiment insights</p>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {(['Hot', 'New', 'Top'] as const).map(s => (
                        <button key={s} onClick={() => setSort(s)} style={{
                            padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '500',
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            background: sort === s ? '#5b5ef4' : '#f1f5f9',
                            color: sort === s ? 'white' : 'var(--text-secondary)',
                        }}>
                            {s === 'Hot' ? '🔥' : s === 'New' ? '✨' : '⬆️'} {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subreddit Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {subreddits.map(sub => (
                    <button key={sub} onClick={() => setActiveFilter(sub)} style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '500',
                        border: activeFilter === sub ? '1.5px solid #5b5ef4' : '1.5px solid var(--border)',
                        background: activeFilter === sub ? 'var(--primary-light)' : 'white',
                        color: activeFilter === sub ? '#5b5ef4' : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                        {sub}
                    </button>
                ))}
            </div>

            {/* Thread List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(thread => {
                    const ss = sentimentStyle(thread.sentiment);
                    return (
                        <Link key={thread.id} href={`/threads/${thread.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                transition: 'all 0.18s ease',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(91,94,244,0.12)';
                                    (e.currentTarget as HTMLElement).style.borderColor = '#5b5ef4';
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Vote Sidebar + Content */}
                                <div style={{ display: 'flex' }}>
                                    {/* Upvote Column */}
                                    <div style={{
                                        width: '56px', background: '#f8fafc', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'flex-start', padding: '16px 0', gap: '4px', flexShrink: 0,
                                        borderRight: '1px solid #f1f5f9'
                                    }}>
                                        <ArrowUp size={18} color="#5b5ef4" />
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#5b5ef4' }}>
                                            {formatUpvotes(thread.upvotes)}
                                        </span>
                                    </div>

                                    {/* Main Content */}
                                    <div style={{ padding: '14px 18px', flex: 1 }}>
                                        {/* Meta */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '700', color: 'white',
                                                background: '#5b5ef4', padding: '2px 8px', borderRadius: '6px',
                                            }}>{thread.subreddit}</span>
                                            {thread.flair && (
                                                <span style={{
                                                    fontSize: '10.5px', fontWeight: '600', padding: '1px 8px',
                                                    borderRadius: '10px', background: ss.bg, color: ss.color,
                                                }}>{thread.flair}</span>
                                            )}
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                Posted by <strong style={{ color: 'var(--text-secondary)' }}>{thread.author}</strong> · {thread.time}
                                            </span>
                                            <span style={{
                                                marginLeft: 'auto', fontSize: '10px', fontWeight: '700',
                                                padding: '2px 8px', borderRadius: '10px', background: ss.bg, color: ss.color,
                                                textTransform: 'uppercase', letterSpacing: '0.04em'
                                            }}>{thread.sentiment}</span>
                                        </div>

                                        {/* Title */}
                                        <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '8px', lineHeight: '1.4' }}>
                                            {thread.title}
                                        </h2>

                                        {/* Body preview */}
                                        <p style={{
                                            fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: '12px',
                                            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any
                                        }}>
                                            {thread.body}
                                        </p>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                                <MessageSquare size={13} /> {thread.comments.toLocaleString()} comments
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                                <Share2 size={13} /> Share
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                                <Bookmark size={13} /> Save
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
