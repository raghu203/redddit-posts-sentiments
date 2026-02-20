'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowUp, ArrowLeft, MessageSquare, Share2, Bookmark, User } from 'lucide-react';
import { threads, Comment } from '@/lib/threadData';
import { useState } from 'react';

const sentimentStyle = (s: string) => {
    if (s === 'Positive') return { color: '#16a34a', bg: '#dcfce7' };
    if (s === 'Negative') return { color: '#ef4444', bg: '#fee2e2' };
    return { color: '#64748b', bg: '#f1f5f9' };
};

const formatUpvotes = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

function CommentCard({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
    const [collapsed, setCollapsed] = useState(false);
    const ss = sentimentStyle(comment.sentiment);
    return (
        <div style={{ marginLeft: depth > 0 ? '24px' : '0', borderLeft: depth > 0 ? '2px solid #e2e8f0' : 'none', paddingLeft: depth > 0 ? '16px' : '0' }}>
            <div style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={13} color="#94a3b8" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '12.5px', color: 'var(--foreground)' }}>{comment.user}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{comment.time}</span>
                    <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 7px', borderRadius: '10px', background: ss.bg, color: ss.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {comment.sentiment}
                    </span>
                    <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {collapsed ? '▶ expand' : '▼ collapse'}
                    </button>
                </div>

                {!collapsed && (
                    <>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px', paddingLeft: '34px' }}>
                            {comment.text}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingLeft: '34px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#5b5ef4', fontWeight: '600', cursor: 'pointer' }}>
                                <ArrowUp size={13} /> {formatUpvotes(comment.upvotes)}
                            </span>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}>Reply</span>
                        </div>
                        {comment.replies?.map(reply => (
                            <CommentCard key={reply.id} comment={reply} depth={depth + 1} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default function ThreadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const thread = threads.find(t => t.id === Number(params.id));
    const [replyText, setReplyText] = useState('');

    if (!thread) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Thread not found.</p>
                <button onClick={() => router.push('/threads')} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', background: '#5b5ef4', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    Back to Threads
                </button>
            </div>
        );
    }

    const ss = sentimentStyle(thread.sentiment);

    return (
        <div style={{ padding: '24px 28px', maxWidth: '860px', margin: '0 auto', minHeight: '100vh' }}>
            {/* Back Button */}
            <button onClick={() => router.push('/threads')} style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px',
                background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '7px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                color: 'var(--text-secondary)', transition: 'all 0.15s',
            }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#5b5ef4'; (e.currentTarget as HTMLElement).style.color = '#5b5ef4'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
                <ArrowLeft size={14} /> Back to Threads
            </button>

            {/* Post Card */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ display: 'flex' }}>
                    {/* Vote Column */}
                    <div style={{ width: '60px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '6px', borderRight: '1px solid #f1f5f9', flexShrink: 0 }}>
                        <ArrowUp size={22} color="#5b5ef4" style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#5b5ef4' }}>{formatUpvotes(thread.upvotes)}</span>
                    </div>

                    {/* Post Body */}
                    <div style={{ padding: '20px 22px', flex: 1 }}>
                        {/* Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'white', background: '#5b5ef4', padding: '3px 10px', borderRadius: '6px' }}>{thread.subreddit}</span>
                            {thread.flair && <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 9px', borderRadius: '10px', background: ss.bg, color: ss.color }}>{thread.flair}</span>}
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posted by <strong style={{ color: 'var(--text-secondary)' }}>{thread.author}</strong> · {thread.time}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '10px', background: ss.bg, color: ss.color, textTransform: 'uppercase' as const }}>
                                {thread.sentiment} Sentiment
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '12px', lineHeight: '1.4' }}>
                            {thread.title}
                        </h1>

                        {/* Body */}
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '18px' }}>
                            {thread.body}
                        </p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                            {[
                                { icon: MessageSquare, label: `${thread.comments.toLocaleString()} Comments` },
                                { icon: Share2, label: 'Share' },
                                { icon: Bookmark, label: 'Save' },
                            ].map(({ icon: Icon, label }) => (
                                <button key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <Icon size={14} /> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply Box */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Comment as <span style={{ color: '#5b5ef4' }}>u/You</span>
                </div>
                <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="What are your thoughts?"
                    rows={3}
                    style={{
                        width: '100%', borderRadius: '8px', border: '1px solid var(--border)',
                        padding: '10px 12px', fontSize: '13px', resize: 'vertical', outline: 'none',
                        fontFamily: 'inherit', color: 'var(--foreground)', background: '#f8fafc'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                        onClick={() => setReplyText('')}
                        style={{
                            padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                            background: replyText ? '#5b5ef4' : '#e2e8f0',
                            color: replyText ? 'white' : 'var(--text-muted)',
                            border: 'none', cursor: replyText ? 'pointer' : 'not-allowed', transition: 'all 0.15s'
                        }}
                    >
                        Reply
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid var(--border)', padding: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} color="#5b5ef4" />
                    {thread.commentList.length} Comments
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {thread.commentList.map(comment => (
                        <div key={comment.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                            <CommentCard comment={comment} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
