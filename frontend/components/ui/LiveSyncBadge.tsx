'use client';

/**
 * LiveSyncBadge — shows backend real-time sync status in the Header.
 *
 * Displays:
 *   🟢 LIVE   — backend is fetching from Reddit via PRAW
 *   🔄 SYNCED — simulation mode (re-analysing CSV) — data is still fresh
 *   🟡 SYNCING — first cycle hasn't completed yet
 *   🔴 ERR    — sync thread encountered an error
 *
 * Polls /api/status every 30 seconds.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchStatus, startAutoRefresh } from '@/src/services/api';

type SyncMode = 'live' | 'simulation' | 'starting';

interface StatusData {
    total_rows: number;
    last_update: string | null;
    sync_mode: SyncMode;
    cycle_count: number;
    sync_interval_seconds: number;
    error: string | null;
}

function formatRelative(isoStr: string | null): string {
    if (!isoStr) return 'pending';
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
}

export default function LiveSyncBadge() {
    const [status, setStatus] = useState<StatusData | null>(null);
    const [tooltip, setTooltip] = useState(false);
    const [, tick] = useState(0); // Re-render every 10s to update relative time

    const loadStatus = useCallback(async () => {
        try {
            const data = await fetchStatus();
            setStatus(data);
        } catch {
            // Backend unreachable — keep showing last known state
        }
    }, []);

    useEffect(() => { loadStatus(); }, [loadStatus]);

    // Poll every 30s
    useEffect(() => startAutoRefresh(loadStatus, 30000), [loadStatus]);

    // Tick every 10s to refresh relative timestamps
    useEffect(() => {
        const id = setInterval(() => tick(t => t + 1), 10000);
        return () => clearInterval(id);
    }, []);

    if (!status) return null;

    const mode = status.sync_mode;
    const hasError = !!status.error;

    const dot = hasError ? '#ef4444'
        : mode === 'live' ? '#22c55e'
            : mode === 'simulation' ? '#f59e0b'
                : '#94a3b8';

    const label = hasError ? 'ERR'
        : mode === 'live' ? 'LIVE'
            : mode === 'simulation' ? 'SYNCED'
                : 'SYNCING';

    const bg = hasError ? 'rgba(239,68,68,0.08)'
        : mode === 'live' ? 'rgba(34,197,94,0.08)'
            : mode === 'simulation' ? 'rgba(245,158,11,0.08)'
                : 'rgba(148,163,184,0.08)';

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            {/* Badge */}
            <button
                onClick={() => setTooltip(t => !t)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: `1px solid ${dot}40`,
                    background: bg,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: dot,
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s ease',
                }}
            >
                {/* Pulse dot */}
                <span style={{ position: 'relative', width: '6px', height: '6px', display: 'inline-block' }}>
                    <span style={{
                        position: 'absolute', inset: 0, borderRadius: '50%', background: dot,
                        animation: mode === 'live' ? 'pulse 2s infinite' : 'none',
                    }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: dot }} />
                </span>
                {label}
            </button>

            {/* Tooltip */}
            {tooltip && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '240px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid var(--border)',
                    padding: '14px 16px',
                    zIndex: 999,
                }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--foreground)', marginBottom: '10px' }}>
                        Real-Time Sync Status
                    </div>
                    <Row label="Mode" value={mode === 'live' ? '🟢 Live (Reddit API)' : mode === 'simulation' ? '🔄 Simulation (CSV re-analysis)' : '🟡 Starting...'} />
                    <Row label="Total rows" value={String(status.total_rows)} />
                    <Row label="Updated" value={formatRelative(status.last_update)} />
                    <Row label="Cycles" value={String(status.cycle_count)} />
                    <Row label="Interval" value={`Every ${status.sync_interval_seconds}s`} />
                    {hasError && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444', background: '#fef2f2', borderRadius: '6px', padding: '6px 8px' }}>
                            ⚠ {status.error}
                        </div>
                    )}
                    {mode === 'simulation' && !hasError && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#92400e', background: '#fffbeb', borderRadius: '6px', padding: '6px 8px' }}>
                            Add Reddit API credentials to <code style={{ fontFamily: 'monospace' }}>backend/.env</code> for live data.
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.8); }
                }
            `}</style>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--foreground)' }}>{value}</span>
        </div>
    );
}
