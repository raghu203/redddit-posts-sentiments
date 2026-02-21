'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Download, Plus } from 'lucide-react';
import SectionCard from '@/components/ui/SectionCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { fetchTrends, startAutoRefresh } from '@/src/services/api';

export default function TrendsPage() {
    const [view, setView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await fetchTrends();
            const raw = data.trends || [];
            setTrendData(raw.map((t: any) => ({
                date: t.date,
                positive: t.positive,
                neutral: t.neutral,
                negative: t.negative,
                total: t.total,
            })));
            setLastUpdated(new Date());
        } catch {
            // keep existing state on error
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

    // Compute stat cards from actual data
    const peakDay = trendData.reduce((best, d) => d.total > (best?.total || 0) ? d : best, null as any);
    const avgScore = trendData.length > 0
        ? trendData.reduce((s, d) => s + (d.positive - d.negative), 0) / trendData.length
        : 0;
    const dominantSentiment = avgScore > 0.3 ? 'Positive' : avgScore < -0.3 ? 'Negative' : 'Mixed/Neutral';

    // Derive dynamic timeline events from real trend data
    const timelineEvents = (() => {
        if (trendData.length === 0) return [];
        const first = trendData[0];
        const peakEntry = trendData.reduce((best, d) => d.positive > (best?.positive || 0) ? d : best, null as any);
        const negEntry = trendData.reduce((worst, d) => d.negative > (worst?.negative || 0) ? d : worst, null as any);
        const events: any[] = [];
        events.push({ date: first.date, title: 'Data Collection Start', desc: `Tracking began with ${first.total} comments on the first day.`, tags: ['Start'], active: true });
        if (peakEntry && peakEntry.date !== first.date) {
            events.push({ date: peakEntry.date, title: 'Positive Sentiment Peak', desc: `${peakEntry.positive} positive comments — highest observed day.`, tags: ['Peak'], active: false });
        }
        if (negEntry && negEntry.date !== first.date) {
            events.push({ date: negEntry.date, title: 'Negative Trend Observed', desc: `${negEntry.negative} negative comments detected on this date.`, tags: ['Negative'], active: false });
        }
        if (trendData.length > 1) {
            events.push({ date: trendData.at(-1)?.date, title: 'Latest Data Point', desc: `Most recent entry: ${trendData.at(-1)?.total || 0} comments analyzed.`, tags: [], active: false });
        }
        return events;
    })();

    const statCards = [
        { label: 'DOMINANT SENTIMENT', value: dominantSentiment, sub: `Avg net score: ${avgScore.toFixed(2)}`, badge: avgScore > 0 ? 'Positive' : 'Negative', badgeColor: avgScore > 0 ? '#16a34a' : '#dc2626', badgeBg: avgScore > 0 ? '#dcfce7' : '#fee2e2', extra: avgScore > 0 ? '↑' : '↓' },
        { label: 'PEAK DAY', value: peakDay?.date || '—', sub: `${peakDay?.total || 0} comments on peak day`, badge: 'Most Active', badgeColor: '#dc2626', badgeBg: '#fee2e2' },
        { label: 'TOTAL COMMENTS', value: String(trendData.reduce((s, d) => s + d.total, 0)), sub: 'across all tracked dates', bar: true },
        { label: 'DAYS TRACKED', value: String(trendData.length), sub: `${trendData[0]?.date || '—'} to ${trendData.at(-1)?.date || '—'}` },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Left */}
            <div style={{ flex: 1, padding: '24px 20px 24px 28px', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>Temporal Emotion Trends</h1>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                            Longitudinal analysis of affect intensity within <span style={{ color: '#5b5ef4', fontWeight: '500' }}>r/ArtificialIntelligence</span>.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <Calendar size={13} /> Jan 01, 2023 – Present
                        </div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#5b5ef4', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            <Download size={13} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '10.5px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>{s.value}</div>
                                {s.extra && <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>{s.extra}</span>}
                                {s.badge && <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', background: s.badgeBg, color: s.badgeColor }}>{s.badge}</span>}
                            </div>
                            {s.bar && <div style={{ height: '5px', background: '#5b5ef4', borderRadius: '3px', width: '70%', marginTop: '8px' }} />}
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '5px' }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Main Chart */}
                <SectionCard style={{ marginBottom: '20px' }} title="">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['Daily', 'Weekly', 'Monthly'] as const).map(v => (
                                <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: view === v ? '#5b5ef4' : 'white', color: view === v ? 'white' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '500', cursor: 'pointer' }}>{v}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            SMOOTHING:
                            <div style={{ width: '80px', height: '4px', background: '#e2e8f0', borderRadius: '2px', position: 'relative', cursor: 'pointer' }}>
                                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '14px', height: '14px', borderRadius: '50%', background: '#5b5ef4', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#5b5ef4', background: 'none', border: 'none', cursor: 'pointer' }}>≡ Advanced Filters</button>
                        </div>
                    </div>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    {[{ id: 'posGrad', color: '#22c55e' }, { id: 'neuGrad', color: '#94a3b8' }, { id: 'negGrad', color: '#ef4444' }].map(g => (
                                        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v: any, name: any) => [`${v} comments`, name]} />
                                <Area type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2.5} fill="url(#posGrad)" dot={false} name="Positive" />
                                <Area type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={1.5} fill="url(#neuGrad)" dot={false} name="Neutral" />
                                <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} fill="url(#negGrad)" dot={false} name="Negative" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                        {[{ c: '#3b82f6', l: 'Positive' }, { c: '#94a3b8', l: 'Neutral' }, { c: '#ef4444', l: 'Negative' }].map(s => (
                            <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '20px', height: '3px', background: s.c, display: 'inline-block', borderRadius: '2px' }} />{s.l}
                            </span>
                        ))}
                    </div>
                </SectionCard>

                {/* Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <SectionCard title="Daily Sentiment Balance (Positive − Negative)">
                        <div style={{ height: '120px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(v: any) => [`${v} comments`, '']} />
                                    <Bar dataKey="positive" fill="#22c55e" radius={[3, 3, 0, 0]} name="Positive" stackId="a" />
                                    <Bar dataKey="negative" fill="#ef4444" radius={[0, 0, 3, 3]} name="Negative" stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>
                    <SectionCard title="Top Correlation">
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--foreground)', letterSpacing: '-1px' }}>r = 0.82</div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                                Strong positive correlation between <strong>"Regulation"</strong> keyword frequency and <strong>Anxiety</strong> score.
                            </p>
                        </div>
                    </SectionCard>
                </div>
            </div>

            {/* Right - Timeline */}
            <div style={{ width: '300px', borderLeft: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Timeline Events</h3>
                    <a href="#" style={{ fontSize: '12.5px', color: '#5b5ef4', textDecoration: 'none', fontWeight: '500' }}>View All</a>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {timelineEvents.map((e, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px', position: 'relative' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.active ? '#5b5ef4' : '#d1d5db', border: e.active ? '2px solid #c7d2fe' : 'none', marginTop: '2px' }} />
                                {i < timelineEvents.length - 1 && <div style={{ width: '1px', flex: 1, background: '#e2e8f0', marginTop: '4px' }} />}
                            </div>
                            <div style={{ flex: 1, paddingBottom: '4px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#5b5ef4', marginBottom: '3px' }}>{e.date}</div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '4px' }}>{e.title}</div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{e.desc}</p>
                                {e.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                        {e.tags.map((t: string) => <span key={t} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: '500' }}>{t}</span>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                    <button style={{ width: '100%', padding: '9px', border: '1px dashed var(--border)', borderRadius: '8px', background: 'white', color: 'var(--text-secondary)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Plus size={13} /> Add Custom Event Marker
                    </button>
                </div>
            </div>
        </div>
    );
}
