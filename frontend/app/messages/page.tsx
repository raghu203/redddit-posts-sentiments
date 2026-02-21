'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Download, RefreshCw } from 'lucide-react';
import { API_BASE, startAutoRefresh } from '@/src/services/api';

const sentimentColors: Record<string, { color: string; bg: string }> = {
    Positive: { color: '#16a34a', bg: '#dcfce7' },
    Neutral: { color: '#64748b', bg: '#f1f5f9' },
    Negative: { color: '#ef4444', bg: '#fee2e2' },
};

const ITEMS_PER_PAGE = 8;

export default function CommentExplorerPage() {
    const [search, setSearch] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState<'All' | 'Positive' | 'Neutral' | 'Negative'>('All');
    const [subFilter, setSubFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<'score' | 'upvotes'>('upvotes');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [data, setData] = useState<any[]>([]);
    const [subreddits, setSubreddits] = useState<string[]>(['All']);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ Positive: 0, Neutral: 0, Negative: 0, total: 0 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                per_page: String(ITEMS_PER_PAGE),
                sort_by: sortBy,
                sort_dir: sortDir,
            });
            if (search) params.append('search', search);
            if (sentimentFilter !== 'All') params.append('sentiment', sentimentFilter);
            if (subFilter !== 'All') params.append('subreddit', subFilter);

            const res = await fetch(`${API_BASE}/api/comments?${params}`);
            const json = await res.json();
            setData(json.comments || []);
            setTotal(json.total || 0);
            setTotalPages(json.total_pages || 1);
            setCounts(json.counts || { Positive: 0, Neutral: 0, Negative: 0, total: 0 });

            // Build subreddit list once
            if (subreddits.length <= 1) {
                const subRes = await fetch(`${API_BASE}/api/subreddits`);
                const subJson = await subRes.json();
                setSubreddits(['All', ...(subJson.subreddits || []).map((s: any) => s.name)]);
            }
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [page, sortBy, sortDir, search, sentimentFilter, subFilter, subreddits.length]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const stop = startAutoRefresh(() => fetchData(), 10000);
        return stop;
    }, [fetchData]);

    const toggleSort = (col: 'score' | 'upvotes') => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
        setPage(1);
    };

    const handleSearch = (val: string) => { setSearch(val); setPage(1); };

    const handleExportCSV = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/comments?per_page=1000`);
            const json = await res.json();
            const header = 'Comment,Sentiment,Score,Subreddit,Author,Created,Upvotes\n';
            const rows = (json.comments || []).map((c: any) =>
                `"${(c.comment || '').replace(/"/g, '""')}",${c.sentiment},${c.score},${c.subreddit},${c.author},${c.created_time},${c.upvotes}`
            ).join('\n');
            const blob = new Blob([header + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'reddit_comments.csv'; a.click();
            URL.revokeObjectURL(url);
        } catch { }
    };

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>Comment Explorer</h1>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Search and filter individual Reddit reactions from the Live API
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#5b5ef4', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats from API */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {[
                    { label: 'Total', value: counts.total || total, color: '#5b5ef4', bg: '#ededfd' },
                    { label: 'Positive', value: counts.Positive, color: '#16a34a', bg: '#dcfce7' },
                    { label: 'Neutral', value: counts.Neutral, color: '#64748b', bg: '#f1f5f9' },
                    { label: 'Negative', value: counts.Negative, color: '#ef4444', bg: '#fee2e2' },
                ].map(s => (
                    <div key={s.label} onClick={() => { setSentimentFilter(s.label === 'Total' ? 'All' : s.label as any); setPage(1); }}
                        style={{ padding: '12px 18px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'opacity 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        <span style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</span>
                        <span style={{ fontSize: '12.5px', fontWeight: '500', color: s.color }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
                    <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
                        placeholder="Search comments or authors..."
                        style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', color: 'var(--foreground)', fontFamily: 'inherit' }}
                    />
                </div>

                {/* Sentiment Tabs */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {(['All', 'Positive', 'Neutral', 'Negative'] as const).map(s => (
                        <button key={s} onClick={() => { setSentimentFilter(s); setPage(1); }} style={{
                            padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '500', cursor: 'pointer',
                            border: sentimentFilter === s ? 'none' : '1px solid var(--border)',
                            background: sentimentFilter === s ? (s === 'All' ? '#5b5ef4' : sentimentColors[s]?.bg || '#5b5ef4') : 'white',
                            color: sentimentFilter === s ? (s === 'All' ? 'white' : sentimentColors[s]?.color || 'white') : 'var(--text-secondary)',
                            transition: 'all 0.15s',
                        }}>{s}</button>
                    ))}
                </div>

                {/* Subreddit Filter */}
                <select value={subFilter} onChange={e => { setSubFilter(e.target.value); setPage(1); }}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', background: 'white' }}>
                    {subreddits.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#fafbfc' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', width: '40%' }}>Comment</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sentiment</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => toggleSort('score')}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Score <ArrowUpDown size={12} /></span>
                            </th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Subreddit</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Author</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => toggleSort('upvotes')}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Upvotes <ArrowUpDown size={12} /></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Loading comments…</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No comments match your filters.</td></tr>
                        ) : data.map((c, i) => {
                            const sc = sentimentColors[c.sentiment] || sentimentColors.Neutral;
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f8f9ff')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.comment}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.created_time}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.color }}>{c.sentiment}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: c.score >= 0.05 ? '#16a34a' : c.score <= -0.05 ? '#ef4444' : '#64748b' }}>
                                            {c.score >= 0 ? '+' : ''}{(+c.score).toFixed(2)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#5b5ef4', fontWeight: '500' }}>{c.subreddit}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{c.author}</td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{c.upvotes >= 1000 ? `${(c.upvotes / 1000).toFixed(1)}k` : c.upvotes}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total} comments
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontSize: '12.5px', fontWeight: '500',
                            color: page <= 1 ? '#d1d5db' : 'var(--text-secondary)', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                        }}>
                            <ChevronLeft size={14} /> Previous
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                padding: '6px 10px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', border: 'none', minWidth: '32px',
                                background: page === p ? '#5b5ef4' : 'transparent', color: page === p ? 'white' : 'var(--text-secondary)',
                            }}>{p}</button>
                        ))}
                        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: 'white', fontSize: '12.5px', fontWeight: '500',
                            color: page >= totalPages ? '#d1d5db' : 'var(--text-secondary)', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                        }}>
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
