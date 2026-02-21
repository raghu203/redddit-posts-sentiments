'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, FileText, FileJson, FileImage, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { API_BASE, fetchComments, startAutoRefresh } from '@/src/services/api';

const sentimentStyle = (s: string) =>
    s === 'Positive' ? { c: '#16a34a', bg: '#dcfce7' }
        : s === 'Negative' ? { c: '#ef4444', bg: '#fee2e2' }
            : { c: '#64748b', bg: '#f1f5f9' };

export default function ExportPage() {
    const [exporting, setExporting] = useState<string | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadPreview = useCallback(async () => {
        try {
            const data = await fetchComments({ perPage: 5, sortBy: 'upvotes', sortDir: 'desc' });
            setPreview(data.comments || []);
            setTotal(data.total || 0);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadPreview(); }, [loadPreview]);

    // Auto-refresh preview every 30 seconds
    useEffect(() => {
        const stop = startAutoRefresh(loadPreview, 30000);
        return stop;
    }, [loadPreview]);

    const handleExport = async (format: string) => {
        if (format === 'pdf') return;
        setExporting(format);
        try {
            const res = await fetch(`${API_BASE}/api/comments?per_page=1000&sort_by=upvotes&sort_dir=desc`);
            const data = await res.json();
            const rows: any[] = data.comments || [];

            if (format === 'csv') {
                const header = 'Comment,Sentiment,Score,Subreddit,Author,Date,Upvotes\n';
                const body = rows.map(c =>
                    `"${(c.comment || '').replace(/"/g, '""')}",${c.sentiment},${c.score},${c.subreddit},${c.author},${c.created_time},${c.upvotes}`
                ).join('\n');
                const blob = new Blob([header + body], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `reddit_sentiment_${Date.now()}.csv`; a.click();
                URL.revokeObjectURL(url);
            } else if (format === 'json') {
                const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `reddit_sentiment_${Date.now()}.json`; a.click();
                URL.revokeObjectURL(url);
            }
        } catch { }
        setTimeout(() => setExporting(null), 1800);
    };

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Report Center</span><span>›</span><span>Export Insights</span>
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>Data Export & Insights</h1>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Download analyzed datasets directly from the Live Reddit API
                </p>
            </div>

            {/* Export Format Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { format: 'csv', icon: FileText, title: 'CSV Export', desc: 'Comma-separated values. Best for Excel, Google Sheets, and spreadsheet tools.', color: '#22c55e', bg: '#dcfce7' },
                    { format: 'json', icon: FileJson, title: 'JSON Export', desc: 'Structured data format. Best for developers and APIs.', color: '#5b5ef4', bg: '#ededfd' },
                    { format: 'pdf', icon: FileImage, title: 'PDF Report', desc: 'Formatted report with charts. Best for presentations (coming soon).', color: '#f59e0b', bg: '#fef3c7' },
                ].map(ef => (
                    <div key={ef.format} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: ef.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ef.icon size={20} color={ef.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>{ef.title}</div>
                                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{total > 0 ? `${total} real comments` : 'Loading…'}</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{ef.desc}</p>
                        <button onClick={() => handleExport(ef.format)} disabled={ef.format === 'pdf' || exporting === ef.format} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '10px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600',
                            cursor: ef.format === 'pdf' ? 'not-allowed' : 'pointer',
                            background: exporting === ef.format ? '#dcfce7' : ef.format === 'pdf' ? '#f1f5f9' : ef.color,
                            color: exporting === ef.format ? '#16a34a' : ef.format === 'pdf' ? '#94a3b8' : 'white',
                            transition: 'all 0.2s',
                        }}>
                            {exporting === ef.format
                                ? <><CheckCircle2 size={14} /> Downloaded!</>
                                : <><Download size={14} /> {ef.format === 'pdf' ? 'Coming Soon' : `Download ${ef.format.toUpperCase()}`}</>
                            }
                        </button>
                    </div>
                ))}
            </div>

            {/* Preview Table */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>Data Preview</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Top 5 comments by upvotes (live from backend)</p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', background: '#ededfd', color: '#5b5ef4' }}>{total} total rows</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#fafbfc', borderBottom: '1px solid var(--border)' }}>
                            {['Comment', 'Sentiment', 'Score', 'Subreddit', 'Author', 'Upvotes'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
                        ) : preview.map((row, i) => {
                            const sc = sentimentStyle(row.sentiment);
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--foreground)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.comment}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.c }}>{row.sentiment}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: row.score >= 0 ? '#16a34a' : '#ef4444' }}>
                                        {row.score >= 0 ? '+' : ''}{(+row.score).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '12.5px', color: '#5b5ef4', fontWeight: '500' }}>{row.subreddit}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{row.author}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>
                                        {row.upvotes >= 1000 ? `${(row.upvotes / 1000).toFixed(1)}k` : row.upvotes}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Export Tips */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1d4ed8', marginBottom: '6px' }}>📋 What's in the export?</div>
                <div style={{ fontSize: '12.5px', color: '#3b82f6', lineHeight: 1.8 }}>
                    Each row includes: <strong>comment text, cleaned text, sentiment label (Positive/Neutral/Negative), compound score (-1 to +1), subreddit, author, created time, upvotes</strong>.
                    The CSV/JSON is generated from your real <code>analyzed_output.csv</code> via the Flask backend.
                </div>
            </div>
        </div>
    );
}
