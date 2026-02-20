'use client';

import { useState } from 'react';
import { Calendar, Download, Plus, RefreshCw } from 'lucide-react';
import SectionCard from '@/components/ui/SectionCard';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

const trendData = [
    { date: "Jan '23", joy: 0.38, fear: 0.05, anger: 0.02, neutral: 0.3 },
    { date: "Mar '23", joy: 0.42, fear: 0.08, anger: 0.03, neutral: 0.28 },
    { date: "May '23", joy: 0.45, fear: 0.15, anger: 0.04, neutral: 0.25 },
    { date: "Jul '23", joy: 0.40, fear: 0.35, anger: 0.06, neutral: 0.22 },
    { date: "Sep '23", joy: 0.38, fear: 0.55, anger: 0.08, neutral: 0.20 },
    { date: "Nov '23", joy: 0.42, fear: 0.82, anger: 0.12, neutral: 0.18 },
    { date: "Jan '24", joy: 0.50, fear: 0.78, anger: 0.10, neutral: 0.22 },
];

const volatilityData = [
    { week: 'W1', v: 0.2 }, { week: 'W2', v: 0.35 }, { week: 'W3', v: 0.28 },
    { week: 'W4', v: 0.45 }, { week: 'W5', v: 0.38 }, { week: 'W6', v: 0.52 },
    { week: 'W7', v: 0.48 }, { week: 'W8', v: 0.60 },
];

const timelineEvents = [
    { date: 'Nov 17, 2023', title: 'CEO Ouster News', desc: 'Sudden leadership change triggered massive spike in "Surprise" and "Fear".', tags: ['OpenAI', 'Sam Altman'], active: true },
    { date: 'Oct 30, 2023', title: 'Executive Order on AI', desc: 'White House announcement. Mixed sentiment: Relief vs. stifle concerns.', tags: [] },
    { date: 'July 20, 2023', title: 'Senate Hearings', desc: 'Congressional testimony creates sustained "Anxiety" plateau.', tags: [] },
    { date: 'Mar 14, 2023', title: 'GPT-4 Release', desc: 'Dominant "Joy" and "Anticipation" metrics. Peak engagement volume.', tags: [] },
    { date: 'Feb 07, 2023', title: 'Bing Chat Demo', desc: 'Initial excitement followed by "Confusion" clusters.', tags: [] },
];

const statCards = [
    { label: 'DOMINANT AFFECT', value: 'Anticipation', sub: 'Highest sustained volume over Q3.', badge: 'Steady', badgeColor: '#16a34a', badgeBg: '#dcfce7', extra: '↑12%' },
    { label: 'PEAK VOLATILITY', value: 'Nov 14-21', sub: "Correlates with 'OpenAI Leadership' event.", badge: 'Critical', badgeColor: '#dc2626', badgeBg: '#fee2e2' },
    { label: 'SAMPLE VOLUME', value: '842.1k', sub: 'comments', bar: true },
    { label: 'TREND SIGNAL', value: 'Polarizing', sub: "Divergence between 'Joy' and 'Fear' widening." },
];

export default function TrendsPage() {
    const [view, setView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

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
                                    {[{ id: 'joyGrad', color: '#3b82f6' }, { id: 'fearGrad', color: '#a855f7' }, { id: 'angerGrad', color: '#ef4444' }].map(g => (
                                        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="joy" stroke="#3b82f6" strokeWidth={2.5} fill="url(#joyGrad)" dot={false} name="Joy / Anticipation" />
                                <Area type="monotone" dataKey="fear" stroke="#a855f7" strokeWidth={2.5} fill="url(#fearGrad)" dot={false} name="Fear / Anxiety" />
                                <Area type="monotone" dataKey="anger" stroke="#ef4444" strokeWidth={2} fill="url(#angerGrad)" dot={false} strokeDasharray="6 3" name="Anger" />
                                <Area type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={1.5} fill="none" dot={false} name="Neutral" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                        {[{ c: '#3b82f6', l: 'Joy / Anticipation' }, { c: '#a855f7', l: 'Fear / Anxiety' }, { c: '#ef4444', l: 'Anger' }, { c: '#94a3b8', l: 'Neutral' }].map(s => (
                            <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '20px', height: '3px', background: s.c, display: 'inline-block', borderRadius: '2px' }} />{s.l}
                            </span>
                        ))}
                    </div>
                </SectionCard>

                {/* Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <SectionCard title="Sentiment Volatility Index">
                        <div style={{ height: '120px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volatilityData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                                        {volatilityData.map((e, i) => <Cell key={i} fill={e.v > 0.5 ? '#5b5ef4' : '#bfdbfe'} />)}
                                    </Bar>
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
                                        {e.tags.map(t => <span key={t} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: '500' }}>{t}</span>)}
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
