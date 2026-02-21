'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';

const API = 'http://localhost:5000';
const ALL_EMOTIONS = ['Joy', 'Anger', 'Fear', 'Sadness', 'Surprise', 'Neutral'];

// Map emotion value (0–1) to a color intensity
const emotionColor = (val: number, emotion: string): string => {
    const palette: Record<string, [string, string]> = {
        Joy: ['#fef9c3', '#eab308'],
        Anger: ['#fee2e2', '#ef4444'],
        Fear: ['#fef3c7', '#f59e0b'],
        Sadness: ['#ede9fe', '#8b5cf6'],
        Surprise: ['#fce7f3', '#ec4899'],
        Neutral: ['#f1f5f9', '#64748b'],
    };
    const [low, high] = palette[emotion] || ['#f1f5f9', '#64748b'];
    // lerp based on intensity
    if (val <= 0) return low;
    if (val >= 0.6) return high;
    return low; // simplified — just use low/mid/high bucket
};

const intensityColor = (val: number, emotion: string) => {
    if (val === 0) return '#f1f5f9';
    const palette: Record<string, string[]> = {
        Joy: ['#fef9c3', '#fde047', '#eab308'],
        Anger: ['#fee2e2', '#fca5a5', '#ef4444'],
        Fear: ['#fef3c7', '#fcd34d', '#f59e0b'],
        Sadness: ['#ede9fe', '#c4b5fd', '#8b5cf6'],
        Surprise: ['#fce7f3', '#f9a8d4', '#ec4899'],
        Neutral: ['#f1f5f9', '#cbd5e1', '#64748b'],
    };
    const scale = palette[emotion] || palette.Neutral;
    if (val < 0.2) return scale[0];
    if (val < 0.5) return scale[1];
    return scale[2];
};

export default function EmotionPage() {
    const [search, setSearch] = useState('');
    const [radarData, setRadarData] = useState<any[]>([]);
    const [heatmap, setHeatmap] = useState<Record<string, Record<string, number>>>({});
    const [outliers, setOutliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/emotions`)
            .then(r => r.json())
            .then(data => {
                setRadarData(data.radar || []);
                setHeatmap(data.heatmap || {});
                setOutliers(data.outliers || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const subreddits = Object.keys(heatmap);
    const dominantEmotion = radarData.length
        ? radarData.reduce((a, b) => a.value > b.value ? a : b)
        : { emotion: '—', value: 0 };

    const emotionIcon: Record<string, string> = { Joy: '😊', Anger: '😠', Fear: '😨', Sadness: '😢', Surprise: '😲', Neutral: '😐' };

    const filteredOutliers = outliers.filter(o =>
        !search || o.comment.toLowerCase().includes(search.toLowerCase()) || o.author?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Emotion Analysis</h1>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>Keyword Lexicon Model</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Detect emotional tone (Joy, Anger, Fear, Sadness, Surprise) using keyword-based lexicon</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <StatCard icon={<span style={{ fontSize: '18px' }}>💬</span>} value={loading ? '…' : String(radarData.reduce((s, r) => s, 0) !== undefined ? 'Live' : '—')} label="Model" badge="Keyword Lexicon" badgeColor="blue" />
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Dominant Emotion</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? '…' : dominantEmotion.emotion} <span style={{ fontSize: '22px' }}>{emotionIcon[dominantEmotion.emotion] || '😐'}</span>
                    </div>
                    <div style={{ height: '3px', background: '#5b5ef4', borderRadius: '2px', width: `${(dominantEmotion.value * 100).toFixed(0)}%`, marginTop: '8px', minWidth: '10%' }} />
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '5px' }}>{(dominantEmotion.value * 100).toFixed(1)}% intensity across dataset</div>
                </div>
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Subreddits Tracked</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)' }}>{loading ? '…' : subreddits.length}</div>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a', display: 'inline-block', marginTop: '6px' }}>All Active</span>
                </div>
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Emotions Tracked</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--foreground)' }}>6</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>Joy · Anger · Fear · Sadness · Surprise · Neutral</div>
                </div>
            </div>

            {/* Heatmap + Radar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <SectionCard title="Emotion Density Heatmap" subtitle="Cross-reference of core emotions against top subreddits"
                    action={<MoreHorizontal size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                >
                    {loading ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '110px' }} />
                                        {ALL_EMOTIONS.map(e => (
                                            <th key={e} style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center', padding: '0 0 8px' }}>{e}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {subreddits.map(sub => (
                                        <tr key={sub}>
                                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingRight: '8px', whiteSpace: 'nowrap', fontWeight: '500' }}>{sub}</td>
                                            {ALL_EMOTIONS.map(e => {
                                                const val = heatmap[sub]?.[e] || 0;
                                                return (
                                                    <td key={e} style={{ padding: '2px' }}>
                                                        <div
                                                            title={`${sub} · ${e}: ${(val * 100).toFixed(0)}%`}
                                                            style={{ width: '100%', height: '36px', borderRadius: '6px', background: intensityColor(val, e), cursor: 'pointer', transition: 'transform 0.15s', position: 'relative' }}
                                                            onMouseEnter={e2 => (e2.currentTarget.style.transform = 'scale(1.05)')}
                                                            onMouseLeave={e2 => (e2.currentTarget.style.transform = 'scale(1)')}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                INTENSITY
                                <div style={{ width: '80px', height: '8px', borderRadius: '4px', background: 'linear-gradient(to right, #fce7f3, #ef4444)' }} />
                                HIGH
                            </div>
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Aggregate Emotion Fingerprint" subtitle="Overall emotional skew across all comments">
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData.length ? radarData : ALL_EMOTIONS.map(e => ({ emotion: e, value: 0 }))}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Radar dataKey="value" stroke="#5b5ef4" fill="#5b5ef4" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: '#5b5ef4' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* High Intensity Outliers */}
            <SectionCard title="High Intensity Outliers" subtitle="Most positive and most negative comments in the dataset"
                action={
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', borderRadius: '7px', padding: '6px 10px', background: 'white' }}>
                            <Search size={13} color="var(--text-muted)" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search comments..." style={{ border: 'none', outline: 'none', fontSize: '12.5px', color: 'var(--text-secondary)', width: '140px', background: 'transparent' }} />
                        </div>
                        <button style={{ padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '7px', background: 'white', cursor: 'pointer' }}>
                            <SlidersHorizontal size={14} color="var(--text-muted)" />
                        </button>
                    </div>
                }
            >
                {loading ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                        {filteredOutliers.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No comments match your search.</div>
                        ) : filteredOutliers.map((o, i) => {
                            const isPos = o.score > 0;
                            const emotionColor2 = isPos ? '#16a34a' : '#ef4444';
                            const emotionBg = isPos ? '#dcfce7' : '#fee2e2';
                            const avatarColor = isPos ? '#22c55e' : '#ef4444';
                            return (
                                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: '700' }}>
                                                {(o.author || 'u')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)' }}>{o.author}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>{o.subreddit} · {o.created_time}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: emotionBg, color: emotionColor2 }}>
                                                {o.emotion}: {o.score >= 0 ? '+' : ''}{o.score.toFixed(2)}
                                            </span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>VADER</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{o.comment}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
