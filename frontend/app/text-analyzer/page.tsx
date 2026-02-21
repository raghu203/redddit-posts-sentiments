'use client';

import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, ThumbsUp, MessageSquare, AlertCircle, CheckCircle, MinusCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = 'http://localhost:5000';

const SENTIMENT_STYLE: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    Positive: { color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={16} color="#16a34a" /> },
    Neutral: { color: '#64748b', bg: '#f1f5f9', icon: <MinusCircle size={16} color="#64748b" /> },
    Negative: { color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={16} color="#ef4444" /> },
};

const PIE_COLORS = ['#22c55e', '#94a3b8', '#ef4444'];

export default function TextAnalyzerPage() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch(`${API}/api/analyze-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim() }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                setError(data.error || 'An unexpected error occurred.');
            } else {
                setResult(data);
            }
        } catch {
            setError('Could not reach the backend server. Make sure Flask is running on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    const pieData = result ? [
        { name: 'Positive', value: result.summary.Positive },
        { name: 'Neutral', value: result.summary.Neutral },
        { name: 'Negative', value: result.summary.Negative },
    ] : [];

    const ps = result ? SENTIMENT_STYLE[result.post_sentiment.label] : null;

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', maxWidth: '860px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '4px' }}>
                    🔴 Text Sentiment Analyzer
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Paste any Reddit comment block or custom text and get instant VADER sentiment analysis for the whole text and its segments.
                </p>
            </div>

            {/* Text Input Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste your text here (each line will be analyzed as a separate segment)..."
                    style={{
                        width: '100%', minHeight: '150px', padding: '14px',
                        borderRadius: '10px', border: '1.5px solid var(--border)',
                        fontSize: '13.5px', color: 'var(--foreground)',
                        background: 'white', outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s', resize: 'vertical'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#5b5ef4')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !text.trim()}
                    style={{
                        padding: '12px 24px', borderRadius: '10px', border: 'none',
                        background: loading || !text.trim() ? '#c7d2fe' : '#5b5ef4',
                        color: 'white', fontWeight: '600', fontSize: '14px', cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'background 0.2s', alignSelf: 'flex-end'
                    }}
                >
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Search size={16} />}
                    {loading ? 'Analyzing…' : 'Analyze Text'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
                    <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontWeight: '600', color: '#dc2626', fontSize: '13.5px', marginBottom: '4px' }}>Analysis Failed</p>
                        <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[180, 300, 240].map((h, i) => (
                        <div key={i} style={{ height: h, borderRadius: '12px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    ))}
                    <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
                </div>
            )}

            {/* Results */}
            {result && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Overall Score Card */}
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'white', background: '#5b5ef4', padding: '2px 10px', borderRadius: '6px' }}>
                                OVERALL ANALYSIS
                            </span>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{result.segments_analyzed} segments processed</span>
                        </div>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '14px' }}>
                            {result.title}
                        </h2>

                        {/* Sentiment Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>Overall Sentiment:</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', background: ps?.bg, color: ps?.color }}>
                                {ps?.icon} {result.post_sentiment.label}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: ps?.color }}>
                                ({result.post_sentiment.score >= 0 ? '+' : ''}{result.post_sentiment.score})
                            </span>
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                                😊 {Math.round(result.post_sentiment.pos * 100)}% &nbsp;
                                😐 {Math.round(result.post_sentiment.neu * 100)}% &nbsp;
                                😠 {Math.round(result.post_sentiment.neg * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Summary Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>

                        {/* Pie Chart */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px 20px' }}>
                            <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>
                                Segment Distribution
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                Distribution of sentiment across all lines
                            </p>
                            <div style={{ height: '180px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" strokeWidth={0}>
                                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v: any, name) => [`${v} segments`, name]} />
                                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
                                {['Positive', 'Neutral', 'Negative'].map((label, i) => (
                                    <div key={label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: [PIE_COLORS[0], PIE_COLORS[1], PIE_COLORS[2]][i] }}>
                                            {result.summary[label]}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Segments List */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px 20px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <MessageSquare size={15} color="#5b5ef4" />
                                <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--foreground)' }}>
                                    Pasted Text Segments
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                                {result.segment_sentiments.slice(0, 20).map((c: any, i: number) => {
                                    const cs = SENTIMENT_STYLE[c.label];
                                    return (
                                        <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', borderLeft: `3px solid ${cs.color}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                                                {cs.icon}
                                                <span style={{ fontSize: '11.5px', fontWeight: '600', color: cs.color }}>{c.label}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                    {c.score >= 0 ? '+' : ''}{c.score.toFixed(3)}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                                {c.text}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Paste your text or comment block above</p>
                    <p style={{ fontSize: '13px' }}>The model will analyze the sentiment of each line individually.</p>
                </div>
            )}
        </div>
    );
}
