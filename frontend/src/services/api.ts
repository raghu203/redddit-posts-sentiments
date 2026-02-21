/**
 * Centralized API service for the Reddit Sentiment Dashboard.
 * Uses NEXT_PUBLIC_API_URL from .env.local (falls back to localhost:5000).
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Generic fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_BASE}${path}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.append(k, v));
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
    return res.json();
}

// ─── Endpoint Functions ────────────────────────────────────────────────────

export const fetchOverview = (startDate?: string, endDate?: string) =>
    apiFetch<any>('/api/overview', {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
    });

export const fetchTrends = (startDate?: string, endDate?: string) =>
    apiFetch<any>('/api/trends', {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
    });

export const fetchSentiment = (subreddit?: string) =>
    apiFetch<any>('/api/sentiment', {
        ...(subreddit && subreddit !== 'All' && { subreddit }),
    });

export const fetchSubreddits = () =>
    apiFetch<any>('/api/subreddits');

export const fetchComments = (opts: {
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortDir?: string;
    search?: string;
    sentiment?: string;
    subreddit?: string;
} = {}) =>
    apiFetch<any>('/api/comments', {
        ...(opts.page !== undefined && { page: String(opts.page) }),
        ...(opts.perPage !== undefined && { per_page: String(opts.perPage) }),
        ...(opts.sortBy && { sort_by: opts.sortBy }),
        ...(opts.sortDir && { sort_dir: opts.sortDir }),
        ...(opts.search && { search: opts.search }),
        ...(opts.sentiment && opts.sentiment !== 'All' && { sentiment: opts.sentiment }),
        ...(opts.subreddit && opts.subreddit !== 'All' && { subreddit: opts.subreddit }),
    });

export const fetchEmotions = () =>
    apiFetch<any>('/api/emotions');

export const fetchThreads = (opts: { sort?: string; subreddit?: string; perPage?: number } = {}) =>
    apiFetch<any>('/api/threads', {
        ...(opts.sort && { sort: opts.sort }),
        ...(opts.subreddit && opts.subreddit !== 'All' && { subreddit: opts.subreddit }),
        ...(opts.perPage !== undefined && { per_page: String(opts.perPage) }),
    });

export const analyzeText = (text: string) =>
    fetch(`${API_BASE}/api/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    }).then(r => r.json());

export const fetchStatus = () =>
    apiFetch<{
        status: string;
        total_rows: number;
        last_update: string | null;
        sync_mode: 'live' | 'simulation' | 'starting';
        sync_interval_seconds: number;
        cycle_count: number;
        error: string | null;
    }>('/api/status');

export const fetchPosts = () =>
    apiFetch<any[]>('/posts');

export const fetchStats = () =>
    apiFetch<{
        total_posts: number;
        positive_count: number;
        negative_count: number;
        neutral_count: number;
        average_sentiment: number;
    }>('/stats');


// ─── Auto-refresh Hook (30s) ──────────────────────────────────────────────────
// Usage in any page: const stop = startAutoRefresh(() => fetchData(), 30000);
// Call stop() in a cleanup function.
export function startAutoRefresh(callback: () => void, intervalMs = 30000): () => void {
    const id = setInterval(callback, intervalMs);
    return () => clearInterval(id);
}
