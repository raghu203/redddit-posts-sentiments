'use client';

import { useState, useEffect } from 'react';
import { fetchStatus, clearData } from '@/src/services/api';
import { Radio, PlayCircle, Settings, Activity, Server, RefreshCw } from 'lucide-react';

export default function LiveStreamPage() {
    const [isLive, setIsLive] = useState<boolean>(true);
    const [activating, setActivating] = useState(false);
    const [statusData, setStatusData] = useState<any>(null);

    const loadStatus = async () => {
        try {
            const data = await fetchStatus();
            setIsLive(!data.csv_loaded);
            setStatusData(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStartLive = async () => {
        setActivating(true);
        try {
            await clearData();
            setIsLive(true);
            await loadStatus();
        } catch (e) {
            console.error(e);
        } finally {
            setActivating(false);
        }
    };

    return (
        <div style={{ padding: '28px 32px', minHeight: '100vh', maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isLive ? '#dcfce7' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                        <Radio size={20} color={isLive ? '#16a34a' : '#d97706'} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)' }}>Live Stream Data</h1>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '52px' }}>
                    Manage the real-time Reddit data pipeline. Toggle between static CSV snapshots and live polling.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '24px' }}>
                {/* Control Panel */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={18} color="var(--primary)" /> Connection Status
                    </h2>

                    <div style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: isLive ? '#f0fdf4' : '#fffbeb',
                        border: `2px solid ${isLive ? '#86efac' : '#fde68a'}`,
                        marginBottom: '24px',
                        transition: 'all 0.4s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            {isLive ? (
                                <div style={{ position: 'relative', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ position: 'absolute', width: '100%', height: '100%', background: '#22c55e', borderRadius: '50%', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.75 }}></span>
                                    <span style={{ position: 'relative', width: '10px', height: '10px', background: '#16a34a', borderRadius: '50%' }}></span>
                                </div>
                            ) : (
                                <Activity size={20} color="#d97706" />
                            )}
                            <div style={{ fontSize: '18px', fontWeight: '800', color: isLive ? '#15803d' : '#b45309' }}>
                                {isLive ? 'Live Stream Active' : 'Viewing Static CSV'}
                            </div>
                        </div>
                        <p style={{ fontSize: '13.5px', color: isLive ? '#16a34a' : '#b45309', margin: 0, lineHeight: 1.5 }}>
                            {isLive
                                ? 'The dashboard is currently receiving real-time data from Reddit. The background scheduler is actively polling for new posts and running sentiment analysis.'
                                : 'A static CSV has been uploaded. The dashboard will use this fixed dataset. The real-time Reddit background fetcher is currently suspended.'}
                        </p>
                    </div>

                    {!isLive && (
                        <button
                            onClick={handleStartLive}
                            disabled={activating}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #5b5ef4, #4f46e5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: activating ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(91, 94, 244, 0.25)',
                                transition: 'transform 0.2s',
                                opacity: activating ? 0.8 : 1
                            }}
                            onMouseEnter={e => !activating && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => !activating && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {activating ? (
                                <>
                                    <RefreshCw size={18} className="spin" /> Starting Engine...
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={18} /> Resume Live Stream
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Status Snapshot Panel */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Server size={18} color="var(--primary)" /> Backend Telemetry
                    </h2>

                    {statusData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Mode', value: statusData.sync_mode.toUpperCase(), highlight: isLive, bold: false },
                                { label: 'Sync Interval', value: `${statusData.sync_interval_seconds} seconds`, highlight: false, bold: false },
                                { label: 'Scheduler Cycles', value: statusData.cycle_count.toLocaleString(), highlight: false, bold: false },
                                { label: 'Total Rows Analyzed', value: statusData.total_rows.toLocaleString(), highlight: false, bold: true },
                                { label: 'Last Refresh', value: statusData.last_update ? new Date(statusData.last_update).toLocaleTimeString() : 'N/A', highlight: false, bold: false },
                            ].map((stat, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: i < 4 ? '1px dashed var(--border)' : 'none' }}>
                                    <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{stat.label}</span>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: stat.bold || stat.highlight ? '700' : '600',
                                        color: stat.highlight ? '#16a34a' : 'var(--foreground)'
                                    }}>
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Fetching telemetry...</div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
