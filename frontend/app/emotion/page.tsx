'use client';

import { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, Search, SlidersHorizontal, BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import { fetchEmotions, startAutoRefresh } from '@/src/services/api';

const ALL_EMOTIONS = ['Joy', 'Anger', 'Fear', 'Sadness', 'Surprise', 'Neutral'];

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
    const [sentimentRates, setSentimentRates] = useState<any>({ Positive: 0, Neutral: 0, Negative: 0 });
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const data = await fetchEmotions();
            setRadarData(data.radar || []);
            setHeatmap(data.heatmap || {});
            setOutliers(data.outliers || []);
            setSentimentRates(data.sentiment_rates || { Positive: 0, Neutral: 0, Negative: 0 });
        } catch {
            // keep existing state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        const stop = startAutoRefresh(loadData, 10000);
        return stop;
    }, [loadData]);

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

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {/* Card 1: Model Type */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={16} color="#3b82f6" />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Analysis Model</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Live Lexicon</div>
                    <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', fontWeight: '600' }}>Active Analysis</div>
                </div>

                {/* Card 2: Dominant Emotion */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '16px' }}>{emotionIcon[dominantEmotion.emotion] || '😐'}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Dominant Tone</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>{loading ? '…' : dominantEmotion.emotion}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{(dominantEmotion.value * 100).toFixed(1)}% intensity</div>
                </div>

                {/* Card 3: Sentiment Rate Breakdown (NEW) */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PieIcon size={16} color="#22c55e" />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Sentiment Rates</span>
                    </div>
                    <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: '#f1f5f9' }}>
                        <div style={{ width: `${sentimentRates.Positive}%`, background: '#22c55e', transition: 'width 0.8s' }} />
                        <div style={{ width: `${sentimentRates.Neutral}%`, background: '#94a3b8', transition: 'width 0.8s' }} />
                        <div style={{ width: `${sentimentRates.Negative}%`, background: '#ef4444', transition: 'width 0.8s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>{sentimentRates.Positive}%</div>
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pos</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{sentimentRates.Neutral}%</div>
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Neu</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>{sentimentRates.Negative}%</div>
                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Neg</div>
                        </div>
                    </div>
                </div>

                {/* Card 4: subreddits */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} color="#8b5cf6" />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Coverage</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>{loading ? '…' : subreddits.length} Subreddits</div>
                    <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>Full Sync</div>
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
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Aggregate Emotion Fingerprint" subtitle="Overall emotional skew across all comments"
                    action={<SlidersHorizontal size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                >
                    <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="emotion" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} />
                                <Radar
                                    name="Intensity"
                                    dataKey="value"
                                    stroke="#5b5ef4"
                                    strokeWidth={2}
                                    fill="#5b5ef4"
                                    fillOpacity={0.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* Outliers */}
            <SectionCard title="Emotional Outliers" subtitle="Detected comments with extreme emotional polarization">
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Filter emotional outliers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', outline: 'none', color: 'var(--foreground)' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredOutliers.map((item, i) => (
                        <div key={i} style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', transition: 'box-shadow 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                        {emotionIcon[item.emotion_label] || '😐'}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--foreground)' }}>u/{item.author || 'anonymous'}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>in r/{item.subreddit}</span>
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: (item.sentiment_score || 0) > 0 ? '#16a34a' : '#dc2626', background: (item.sentiment_score || 0) > 0 ? '#f0fdf4' : '#fff5f5', padding: '2px 8px', borderRadius: '4px' }}>
                                    {(item.sentiment_score || 0).toFixed(2)} Score
                                </div>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.comment}</p>
                        </div>
                    ))}
                    {!filteredOutliers.length && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                            No emotional outliers match your search.
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}
