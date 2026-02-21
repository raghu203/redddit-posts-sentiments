'use client';

import { useState } from 'react';
import { Settings, Sliders, Database, Palette, Info, Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
    const [model, setModel] = useState('vader');
    const [threshold, setThreshold] = useState(0.6);
    const [defaultSubs, setDefaultSubs] = useState('r/technology, r/science, r/space, r/worldnews, r/Python');
    const [dateRange, setDateRange] = useState('30');
    const [itemsPerPage, setItemsPerPage] = useState('8');
    const [theme, setTheme] = useState('light');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setModel('vader'); setThreshold(0.6); setDefaultSubs('r/technology, r/science, r/space, r/worldnews, r/Python');
        setDateRange('30'); setItemsPerPage('8'); setTheme('light');
    };

    const SectionTitle = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#ededfd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#5b5ef4" />
            </div>
            <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
        </div>
    );

    const FieldLabel = ({ label }: { label: string }) => (
        <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>{label}</label>
    );

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', maxWidth: '780px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--foreground)' }}>Settings</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Configure your dashboard preferences and analysis parameters</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', background: saved ? '#22c55e' : '#5b5ef4', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', minWidth: '120px', justifyContent: 'center' }}>
                        <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Analysis Settings */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <SectionTitle icon={Sliders} title="Analysis Settings" desc="Configure the NLP model and analysis parameters" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <FieldLabel label="Sentiment Model" />
                        <select value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--foreground)', outline: 'none', cursor: 'pointer', background: 'white' }}>
                            <option value="vader">VADER (Valence Aware Dictionary)</option>
                            <option value="textblob">TextBlob (Pattern-based)</option>
                            <option value="roberta">RoBERTa (Transformer-based)</option>
                        </select>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>VADER is recommended for social media text like Reddit comments.</div>
                    </div>
                    <div>
                        <FieldLabel label={`Confidence Threshold: ${threshold.toFixed(1)}`} />
                        <input type="range" min={0} max={1} step={0.1} value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))}
                            style={{ width: '100%', marginTop: '4px', accentColor: '#5b5ef4' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <span>Low (0.0)</span><span>High (1.0)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Settings */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <SectionTitle icon={Database} title="Data Settings" desc="Configure default data sources and time ranges" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <FieldLabel label="Default Subreddits" />
                        <textarea value={defaultSubs} onChange={e => setDefaultSubs(e.target.value)} rows={2}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--foreground)', outline: 'none', resize: 'vertical' }} />
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Comma-separated list of subreddit names to track.</div>
                    </div>
                    <div>
                        <FieldLabel label="Default Date Range" />
                        <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--foreground)', outline: 'none', cursor: 'pointer', background: 'white' }}>
                            <option value="7">Last 7 days</option>
                            <option value="14">Last 14 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Display Settings */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <SectionTitle icon={Palette} title="Display Settings" desc="Customize the dashboard appearance" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <FieldLabel label="Theme" />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['light', 'dark'].map(t => (
                                <button key={t} onClick={() => setTheme(t)} style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: theme === t ? '2px solid #5b5ef4' : '1px solid var(--border)',
                                    background: t === 'dark' ? '#1e293b' : 'white', color: t === 'dark' ? 'white' : 'var(--foreground)',
                                    fontSize: '13px', fontWeight: '500', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
                                }}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="Items Per Page" />
                        <select value={itemsPerPage} onChange={e => setItemsPerPage(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--foreground)', outline: 'none', cursor: 'pointer', background: 'white' }}>
                            <option value="5">5 items</option>
                            <option value="8">8 items</option>
                            <option value="10">10 items</option>
                            <option value="20">20 items</option>
                            <option value="50">50 items</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* About */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                <SectionTitle icon={Info} title="About This Project" desc="Reddit Sentiment Analysis Dashboard" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    {[
                        { label: 'Project', value: 'Reddit Sentiment Analysis Dashboard' },
                        { label: 'Purpose', value: 'Analyze public opinion on Reddit using NLP' },
                        { label: 'Sentiment Model', value: 'VADER / TextBlob / Pre-trained' },
                        { label: 'Data Source', value: 'Reddit API (PRAW) / CSV Dataset' },
                        { label: 'Frontend', value: 'Next.js, React, Recharts, TypeScript' },
                        { label: 'Backend', value: 'Python, Pandas, NLTK' },
                        { label: 'Preprocessing', value: 'URL removal, lowercase, stopwords, punctuation' },
                        { label: 'Use Cases', value: 'Brand monitoring, political analysis, product feedback' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-secondary)', minWidth: '130px', flexShrink: 0 }}>{item.label}</span>
                            <span style={{ color: 'var(--foreground)' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
