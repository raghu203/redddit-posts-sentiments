'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, FileText, Database, Trash2, RefreshCw } from 'lucide-react';
import { uploadCSV, clearData, fetchUploadStatus } from '@/src/services/api';

const REQUIRED_COLUMNS = ['post_id', 'subreddit', 'comment', 'sentiment_label', 'sentiment_score', 'created_time'];

const EXAMPLE_CSV = `post_id,subreddit,comment,sentiment_label,sentiment_score,created_time
t1_abc123,r/technology,This new AI is absolutely amazing!,Positive,0.82,2024-03-15 10:30:00
t1_def456,r/worldnews,The situation looks quite concerning to me.,Negative,-0.61,2024-03-15 11:00:00
t1_ghi789,r/science,Interesting findings, but more study needed.,Neutral,0.02,2024-03-15 12:15:00
t1_jkl012,r/Python,Just finished my first machine learning model!,Positive,0.78,2024-03-16 09:00:00
t1_mno345,r/space,The Artemis mission is going to be incredible.,Positive,0.91,2024-03-16 14:20:00`;

interface UploadMeta {
    filename: string;
    rows: number;
    columns: string[];
    uploaded_at: string;
    subreddits: number;
}

export default function UploadDataPage() {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [meta, setMeta] = useState<UploadMeta | null>(null);
    const [clearing, setClearing] = useState(false);
    const [showSuccessCheck, setShowSuccessCheck] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);

    // Check current upload status on mount
    useEffect(() => {
        fetchUploadStatus()
            .then(d => {
                if (d.csv_loaded && d.meta) {
                    setMeta(d.meta);
                    setStatus('success');
                    setMessage(`"${d.meta.filename}" is currently loaded with ${d.meta.rows} rows.`);
                }
            })
            .catch(() => { });
    }, []);

    const handleFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setStatus('error');
            setMessage('Only CSV files are supported. Please upload a valid .csv file.');
            return;
        }

        setUploading(true);
        setStatus('idle');
        setMessage('');
        setShowSuccessCheck(false);
        setUploadProgress(0);

        try {
            const data: any = await uploadCSV(file, (pct) => {
                setUploadProgress(pct);
            });

            if (data.ok) {
                // Once upload is 100%, we stay in "Analyzing" mode briefly
                setUploadProgress(100);
                setTimeout(() => {
                    setShowSuccessCheck(true);
                    setTimeout(() => {
                        setStatus('success');
                        setMessage(data.message);
                        setMeta(data.meta);
                        setUploading(false);
                        setShowSuccessCheck(false);
                    }, 1000);
                }, 800);
            } else {
                setStatus('error');
                setMessage(data.error || 'Upload failed. Please check your CSV format.');
                setMeta(null);
                setUploading(false);
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Could not connect to the backend.');
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    };

    const handleClear = async () => {
        setClearing(true);
        try {
            await clearData();
            setStatus('idle');
            setMessage('');
            setMeta(null);
        } catch {
            setStatus('error');
            setMessage('Failed to clear data. Backend may not be reachable.');
        } finally {
            setClearing(false);
        }
    };

    const downloadExample = () => {
        const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_reddit_data.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '28px 32px', minHeight: '100vh', maxWidth: '860px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ededfd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Upload size={18} color="#5b5ef4" />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--foreground)' }}>Upload Data</h1>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginLeft: '50px' }}>
                    Upload a CSV file to populate the entire dashboard with your own Reddit sentiment data.
                </p>
            </div>

            {/* Active Data Banner */}
            {meta && status === 'success' && (
                <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle size={22} color="#16a34a" />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#15803d' }}>
                                Data Active: {meta.filename}
                            </div>
                            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px' }}>
                                {meta.rows.toLocaleString()} rows · {meta.subreddits} subreddits · Uploaded at {new Date(meta.uploaded_at).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        disabled={clearing}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', background: 'white', color: '#ef4444',
                            border: '1px solid #fca5a5', borderRadius: '8px',
                            fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {clearing ? <RefreshCw size={13} className="spin" /> : <Trash2 size={13} />}
                        Clear Data
                    </button>
                </div>
            )}

            {/* Drop Zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                style={{
                    border: `2px dashed ${dragging ? '#5b5ef4' : status === 'error' ? '#fca5a5' : '#c7d2fe'}`,
                    borderRadius: '16px',
                    padding: '56px 24px',
                    textAlign: 'center',
                    cursor: uploading ? 'default' : 'pointer',
                    background: dragging ? '#f0f1ff' : status === 'error' ? '#fff5f5' : '#fafbff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {uploading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        animation: 'fadeIn 0.3s ease',
                    }}>
                        <div className="shimmer-bg" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} />

                        {showSuccessCheck ? (
                            <div style={{ animation: 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #16a34a' }}>
                                    <CheckCircle size={48} color="#16a34a" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'relative', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '50%',
                                        border: '4px solid #e0e7ff',
                                        borderTop: '4px solid #5b5ef4',
                                        animation: 'spin 1s linear infinite',
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        animation: 'pulse 1.5s ease-in-out infinite'
                                    }}>
                                        <Upload size={24} color="#5b5ef4" />
                                    </div>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                                    {uploadProgress < 100 ? 'Uploading Dataset...' : 'Analyzing Results...'}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: '#5b5ef4', marginBottom: '16px', fontFamily: 'monospace' }}>
                                    {uploadProgress}%
                                </div>
                                <div style={{ width: '240px', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                                    <div style={{
                                        width: `${uploadProgress}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #5b5ef4, #818cf8)',
                                        borderRadius: '5px',
                                        transition: 'width 0.1s ease-out',
                                    }} />
                                    {uploadProgress < 100 && (
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, height: '100%', width: '30%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                            animation: 'shimmerBar 1.5s infinite'
                                        }} />
                                    )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '14px', fontWeight: '500' }}>
                                    {uploadProgress < 100 ? `Transferring data packets...` : `Finalizing sentiment mappings...`}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <input ref={fileRef} type="file" accept=".csv" onChange={handleInputChange} style={{ display: 'none' }} />
                <div style={{ marginBottom: '12px', transform: dragging ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#ededfd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: dragging ? '0 10px 15px -3px rgba(91, 94, 244, 0.2)' : 'none' }}>
                        <Upload size={24} color="#5b5ef4" />
                    </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '6px' }}>
                    Drop your CSV here, or click to browse
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    Supports .csv files only • Max recommended: 50,000 rows
                </div>
            </div>

            {/* Status Messages */}
            {status === 'success' && !meta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
                    <CheckCircle size={18} color="#16a34a" />
                    <span style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '500' }}>{message}</span>
                </div>
            )}
            {status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 18px', background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '10px', marginBottom: '20px', animation: 'shake 0.4s ease' }}>
                    <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <div style={{ fontSize: '13.5px', color: '#dc2626', fontWeight: '600', marginBottom: '2px' }}>Upload Failed</div>
                        <div style={{ fontSize: '12.5px', color: '#ef4444' }}>{message}</div>
                    </div>
                </div>
            )}

            {/* Two Column Layout: Required Format + Example */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Required Columns */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <FileText size={15} color="#5b5ef4" />
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--foreground)' }}>Required Columns</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {REQUIRED_COLUMNS.map(col => (
                            <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5b5ef4', flexShrink: 0 }} />
                                <code style={{ fontSize: '12.5px', fontFamily: 'monospace', color: '#5b5ef4', background: '#f0f1ff', padding: '2px 8px', borderRadius: '5px' }}>{col}</code>
                            </div>
                        ))}
                    </div>
                    <button onClick={downloadExample} style={{
                        marginTop: '16px', width: '100%', padding: '9px', borderRadius: '8px',
                        background: '#5b5ef4', color: 'white', border: 'none',
                        fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'transform 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        ↓ Download Sample CSV
                    </button>
                </div>

                {/* How It Works */}
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <Database size={15} color="#5b5ef4" />
                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--foreground)' }}>How It Works</span>
                    </div>
                    {[
                        { step: '1', text: 'Prepare your CSV with the required columns.' },
                        { step: '2', text: 'Drop or click to upload the file.' },
                        { step: '3', text: 'The entire dashboard auto-updates instantly.' },
                        { step: '4', text: 'Click "Clear Data" to reset back to the default state.' },
                    ].map(s => (
                        <div key={s.step} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ededfd', color: '#5b5ef4', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {s.step}
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loaded File Details */}
            {meta && (
                <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', animation: 'slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--foreground)', marginBottom: '14px' }}>
                        📊 Loaded File Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                            { label: 'Filename', value: meta.filename },
                            { label: 'Total Rows', value: meta.rows.toLocaleString() },
                            { label: 'Subreddits', value: meta.subreddits },
                            { label: 'Columns', value: meta.columns.length },
                            { label: 'Uploaded At', value: new Date(meta.uploaded_at).toLocaleString() },
                            { label: 'Status', value: '✅ Active' },
                        ].map(item => (
                            <div key={item.label} style={{ padding: '12px', background: '#fafbff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#5b5ef4' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes progressSafe {
                    0% { transform: scaleX(0); }
                    20% { transform: scaleX(0.3); }
                    50% { transform: scaleX(0.6); }
                    80% { transform: scaleX(0.8); }
                    100% { transform: scaleX(0.95); }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                @keyframes shimmerBar {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(400%); }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .shimmer-bg {
                    background: linear-gradient(-45deg, #fafbff, #f0f1ff, #fafbff);
                    background-size: 400% 400%;
                    animation: shimmer 8s ease infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
