"""
app.py — FLASK REST API (CSV-Driven + SQLite Fallback)
=======================================================
Central backend for the Reddit Alytics Dashboard.

Modes:
  - DEFAULT: Serves data from SQLite database (auto-synced via scheduler).
  - CSV MODE: When a CSV is uploaded via POST /api/upload-csv, all endpoints
              serve data from the in-memory DataFrame instead.
  - CLEAR:    POST /api/clear-data resets to default SQLite mode.

CSV Required Columns:
    post_id, subreddit, comment, sentiment_label, sentiment_score, created_time
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import io
import os
from datetime import datetime

# Local imports
from db import init_db, get_all_posts, get_stats
import scheduler
from clean import clean_text
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── INIT ────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

init_db()
engine = scheduler.start_scheduler()
vader = SentimentIntensityAnalyzer()

# ─── GLOBAL IN-MEMORY CSV STORE ──────────────────────────────────────────────
# When None → all endpoints use the SQLite database.
# When a DataFrame → all endpoints use this data.
UPLOADED_DF: pd.DataFrame | None = None
UPLOAD_META: dict = {}

REQUIRED_COLUMNS = {'post_id', 'subreddit', 'comment', 'sentiment_label', 'sentiment_score', 'created_time'}

def get_df() -> pd.DataFrame | None:
    """Returns the active DataFrame (uploaded CSV or None for SQLite fallback)."""
    return UPLOADED_DF

def empty_zero_response():
    """Standard zero-state response when no data is available."""
    return None

# ─── UPLOAD / CLEAR ENDPOINTS ────────────────────────────────────────────────

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    """
    Accepts a multipart CSV file upload and stores it in memory.
    All dashboard endpoints will now serve data from this CSV.
    """
    global UPLOADED_DF, UPLOAD_META

    if 'file' not in request.files:
        return jsonify({'ok': False, 'error': 'No file part in the request.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'ok': False, 'error': 'No file selected.'}), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify({'ok': False, 'error': 'Only CSV files are supported.'}), 400

    try:
        content = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(content))
    except Exception as e:
        return jsonify({'ok': False, 'error': f'Failed to parse CSV: {str(e)}'}), 400

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # Validate required columns
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        return jsonify({
            'ok': False,
            'error': f'Missing required columns: {", ".join(sorted(missing))}',
            'required_columns': sorted(REQUIRED_COLUMNS)
        }), 422

    # Coerce types
    df['sentiment_score'] = pd.to_numeric(df['sentiment_score'], errors='coerce').fillna(0.0)
    df['created_time'] = df['created_time'].astype(str)

    UPLOADED_DF = df
    UPLOAD_META = {
        'filename': file.filename,
        'rows': len(df),
        'columns': list(df.columns),
        'uploaded_at': datetime.now().isoformat(),
        'subreddits': df['subreddit'].nunique()
    }

    return jsonify({
        'ok': True,
        'message': f'Successfully loaded {len(df)} rows from {file.filename}.',
        'meta': UPLOAD_META
    })


@app.route('/api/clear-data', methods=['POST'])
def clear_data():
    """Clears the uploaded CSV and reverts all endpoints to SQLite fallback."""
    global UPLOADED_DF, UPLOAD_META
    UPLOADED_DF = None
    UPLOAD_META = {}
    return jsonify({'ok': True, 'message': 'Data cleared. Dashboard reset to default state.'})


@app.route('/api/upload-status', methods=['GET'])
def upload_status():
    """Returns the current upload state (is CSV loaded, file info, etc.)."""
    if UPLOADED_DF is not None:
        return jsonify({'csv_loaded': True, 'meta': UPLOAD_META})
    return jsonify({'csv_loaded': False, 'meta': {}})


# ─── HEALTH / STATUS ─────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    mode = 'csv' if UPLOADED_DF is not None else 'sqlite'
    return jsonify({'status': 'ok', 'data_mode': mode, 'message': f'Reddit Alytics API running in {mode.upper()} mode.'})


@app.route('/api/status', methods=['GET'])
def status():
    stats = get_stats()
    return jsonify({
        'status': 'ok',
        'total_rows': stats['total_posts'],
        'last_update': scheduler.sync_state['last_update'],
        'sync_mode': scheduler.sync_state['mode'],
        'sync_interval_seconds': scheduler.sync_state['interval_seconds'],
        'cycle_count': scheduler.sync_state['cycle_count'],
        'posts_last_cycle': scheduler.sync_state.get('posts_inserted', 0),
        'error': scheduler.sync_state['error'],
        'csv_loaded': UPLOADED_DF is not None
    })


# ─── DASHBOARD ENDPOINTS ─────────────────────────────────────────────────────

@app.route('/api/overview', methods=['GET'])
def overview():
    df = get_df()

    if df is None:
        db_posts = get_all_posts(limit=2000)
        if not db_posts:
            return jsonify({
                'total_comments': 0, 'total_subreddits': 0,
                'avg_sentiment_score': 0,
                'sentiment_counts': {'Positive': 0, 'Neutral': 0, 'Negative': 0},
                'most_active_subreddit': 'N/A'
            })
        df = pd.DataFrame(db_posts)
        df = df.rename(columns={'sentiment_label': 'sentiment_label', 'sentiment_score': 'sentiment_score'})

    counts = df['sentiment_label'].value_counts().to_dict()
    return jsonify({
        'total_comments': len(df),
        'total_subreddits': int(df['subreddit'].nunique()),
        'avg_sentiment_score': round(float(df['sentiment_score'].mean()), 4),
        'sentiment_counts': {
            'Positive': int(counts.get('Positive', 0)),
            'Neutral':  int(counts.get('Neutral', 0)),
            'Negative': int(counts.get('Negative', 0))
        },
        'most_active_subreddit': str(df['subreddit'].value_counts().idxmax()) if not df.empty else 'N/A'
    })


@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    df = get_df()

    if df is None:
        db_posts = get_all_posts(limit=2000)
        if not db_posts:
            return jsonify({'total': 0, 'counts': {'Positive': 0, 'Neutral': 0, 'Negative': 0},
                            'percentages': {'Positive': 0, 'Neutral': 0, 'Negative': 0}, 'avg_score': 0,
                            'distribution': []})
        df = pd.DataFrame(db_posts)

    total = len(df)
    if total == 0:
        return jsonify({'total': 0, 'counts': {'Positive': 0, 'Neutral': 0, 'Negative': 0},
                        'percentages': {'Positive': 0, 'Neutral': 0, 'Negative': 0}, 'avg_score': 0,
                        'distribution': []})

    counts = df['sentiment_label'].value_counts().to_dict()

    # Score distribution histogram (10 buckets from -1.0 to 1.0)
    bins = [-1.0, -0.8, -0.6, -0.4, -0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
    labels = [f'{bins[i]:.1f} to {bins[i+1]:.1f}' for i in range(len(bins)-1)]
    hist = pd.cut(df['sentiment_score'], bins=bins, labels=labels).value_counts().sort_index()
    distribution = [{'range': str(r), 'count': int(c)} for r, c in hist.items()]

    return jsonify({
        'total': total,
        'counts': {
            'Positive': int(counts.get('Positive', 0)),
            'Neutral':  int(counts.get('Neutral', 0)),
            'Negative': int(counts.get('Negative', 0))
        },
        'percentages': {
            'Positive': round(counts.get('Positive', 0) / total * 100, 1),
            'Neutral':  round(counts.get('Neutral', 0) / total * 100, 1),
            'Negative': round(counts.get('Negative', 0) / total * 100, 1),
        },
        'avg_score': round(float(df['sentiment_score'].mean()), 4),
        'distribution': distribution
    })


@app.route('/api/subreddits', methods=['GET'])
def subreddits():
    df = get_df()

    if df is None:
        db_posts = get_all_posts(limit=2000)
        if not db_posts: return jsonify({'subreddits': []})
        df = pd.DataFrame(db_posts)

    result = []
    total_all = len(df)
    for sub in df['subreddit'].unique():
        sub_df = df[df['subreddit'] == sub]
        counts = sub_df['sentiment_label'].value_counts()
        t = len(sub_df)
        pos = int(counts.get('Positive', 0))
        neu = int(counts.get('Neutral', 0))
        neg = int(counts.get('Negative', 0))
        result.append({
            'name': str(sub),
            'total': t,
            'positive': pos,
            'neutral': neu,
            'negative': neg,
            'positive_pct': round(pos / t * 100, 1) if t else 0,
            'neutral_pct':  round(neu / t * 100, 1) if t else 0,
            'negative_pct': round(neg / t * 100, 1) if t else 0,
            'avg_score': round(float(sub_df['sentiment_score'].mean()), 4)
        })
    return jsonify({'subreddits': result})


@app.route('/api/comments', methods=['GET'])
def comments():
    df = get_df()

    page     = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 8))
    search   = request.args.get('search', '').lower()
    sentiment_f = request.args.get('sentiment', '')
    sub_f    = request.args.get('subreddit', '')
    sort_by  = request.args.get('sort_by', 'score')
    sort_dir = request.args.get('sort_dir', 'desc')

    if df is None:
        db_posts = get_all_posts(limit=500)
        if not db_posts:
            return jsonify({'total': 0, 'page': 1, 'per_page': per_page, 'total_pages': 1, 'comments': [],
                            'counts': {'Positive': 0, 'Neutral': 0, 'Negative': 0, 'total': 0}})
        rows = []
        for row in db_posts:
            rows.append({
                'post_id': row.get('id', ''),
                'comment': row.get('title', row.get('comment', '')),
                'sentiment': row.get('sentiment_label', ''),
                'score': row.get('sentiment_score', 0),
                'subreddit': row.get('subreddit', ''),
                'author': row.get('author', ''),
                'upvotes': row.get('upvotes', 0),
                'created_time': row.get('created_time', '')
            })
        df = pd.DataFrame(rows)
        df = df.rename(columns={'sentiment': 'sentiment_label', 'score': 'sentiment_score'})
    else:
        # Normalize for CSV mode
        df = df.copy()
        if 'comment' in df.columns and 'sentiment_label' in df.columns:
            pass  # columns already correct

    # Build filtered rows
    fdf = df.copy()
    if search:
        mask = fdf['comment'].str.lower().str.contains(search, na=False)
        fdf = fdf[mask]
    if sentiment_f:
        fdf = fdf[fdf['sentiment_label'] == sentiment_f]
    if sub_f and sub_f != 'All':
        fdf = fdf[fdf['subreddit'] == sub_f]

    # Sort
    sort_col = 'sentiment_score' if sort_by == 'score' else ('upvotes' if 'upvotes' in fdf.columns else 'sentiment_score')
    if sort_col in fdf.columns:
        fdf = fdf.sort_values(sort_col, ascending=(sort_dir == 'asc'))

    total = len(fdf)
    total_pages = max(1, (total + per_page - 1) // per_page)
    start = (page - 1) * per_page
    paginated = fdf.iloc[start:start + per_page]

    all_counts = df['sentiment_label'].value_counts().to_dict()

    comment_list = []
    for _, row in paginated.iterrows():
        comment_list.append({
            'post_id':      str(row.get('post_id', '')),
            'comment':      str(row.get('comment', '')),
            'sentiment':    str(row.get('sentiment_label', '')),
            'score':        float(row.get('sentiment_score', 0)),
            'subreddit':    str(row.get('subreddit', '')),
            'author':       str(row.get('author', 'unknown')),
            'upvotes':      int(row.get('upvotes', 0)),
            'created_time': str(row.get('created_time', ''))
        })

    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
        'comments': comment_list,
        'counts': {
            'Positive': int(all_counts.get('Positive', 0)),
            'Neutral':  int(all_counts.get('Neutral', 0)),
            'Negative': int(all_counts.get('Negative', 0)),
            'total': len(df)
        }
    })


@app.route('/api/trends', methods=['GET'])
def trends():
    df = get_df()

    if df is None:
        db_posts = get_all_posts(limit=2000)
        if not db_posts: return jsonify({'trends': []})
        df = pd.DataFrame(db_posts)

    if df.empty:
        return jsonify({'trends': []})

    df = df.copy()
    try:
        df['date'] = pd.to_datetime(df['created_time'], errors='coerce').dt.strftime('%Y-%m-%d')
    except Exception:
        df['date'] = df['created_time'].astype(str).str[:10]

    df = df.dropna(subset=['date'])
    grouped = df.groupby('date')

    trend_rows = []
    for date, group in sorted(grouped, key=lambda x: x[0]):
        counts = group['sentiment_label'].value_counts()
        trend_rows.append({
            'date':      date,
            'avg_score': round(float(group['sentiment_score'].mean()), 4),
            'positive':  int(counts.get('Positive', 0)),
            'neutral':   int(counts.get('Neutral', 0)),
            'negative':  int(counts.get('Negative', 0)),
            'total':     len(group)
        })
    return jsonify({'trends': trend_rows})


@app.route('/api/emotions', methods=['GET'])
def emotions():
    df = get_df()

    if df is None:
        db_posts = get_all_posts(limit=2000)
        if not db_posts:
            return jsonify({'radar': [], 'heatmap': {}, 'outliers': []})
        df = pd.DataFrame(db_posts)

    if df.empty:
        return jsonify({'radar': [], 'heatmap': {}, 'outliers': []})

    EMOTION_LEXICON = {
        'Joy':      ['love', 'great', 'amazing', 'awesome', 'happy', 'excellent', 'wonderful', 'fantastic', 'good', 'enjoy', 'best', 'brilliant', 'delightful', 'superb'],
        'Anger':    ['hate', 'angry', 'furious', 'outraged', 'terrible', 'horrible', 'disgusting', 'awful', 'worst', 'ridiculous', 'pathetic', 'useless', 'idiotic'],
        'Fear':     ['scared', 'afraid', 'worried', 'anxious', 'terrified', 'nervous', 'panic', 'dread', 'horror', 'frightened', 'concerned', 'dangerous'],
        'Sadness':  ['sad', 'depressed', 'miserable', 'unhappy', 'disappointed', 'heartbroken', 'tragic', 'grief', 'sorry', 'regret', 'unfortunate', 'crying'],
        'Surprise': ['wow', 'shocking', 'unbelievable', 'unexpected', 'amazing', 'incredible', 'surprising', 'astonishing', 'mind-blowing', 'never expected'],
        'Neutral':  []
    }

    def detect_emotion(text: str) -> str:
        text_lower = str(text).lower()
        scores = {e: sum(1 for w in words if w in text_lower) for e, words in EMOTION_LEXICON.items() if words}
        return max(scores, key=scores.get) if any(scores.values()) else 'Neutral'

    text_col = 'comment' if 'comment' in df.columns else 'title'
    df = df.copy()
    df['emotion'] = df[text_col].apply(detect_emotion)

    # Radar data
    emotion_counts = df['emotion'].value_counts()
    total = len(df)
    radar = [{'emotion': e, 'value': round(emotion_counts.get(e, 0) / total, 3)} for e in EMOTION_LEXICON]

    # Heatmap (subreddit × emotion)
    heatmap = {}
    for sub in df['subreddit'].unique():
        sub_df = df[df['subreddit'] == sub]
        sub_total = len(sub_df)
        sub_counts = sub_df['emotion'].value_counts()
        heatmap[str(sub)] = {e: round(sub_counts.get(e, 0) / sub_total, 3) for e in EMOTION_LEXICON}

    # Outliers — top 8 extreme sentiment
    score_col = 'sentiment_score'
    outliers_df = df.nlargest(4, score_col)._append(df.nsmallest(4, score_col))
    outliers = []
    for _, row in outliers_df.iterrows():
        outliers.append({
            'comment':      str(row.get(text_col, '')),
            'sentiment':    str(row.get('sentiment_label', '')),
            'score':        float(row.get(score_col, 0)),
            'author':       str(row.get('author', 'unknown')),
            'subreddit':    str(row.get('subreddit', '')),
            'created_time': str(row.get('created_time', '')),
            'emotion':      str(row.get('emotion', 'Neutral')),
            'emotion_label': str(row.get('emotion', 'Neutral')),
        })

    # Sentiment Rates
    sent_counts = df['sentiment_label'].value_counts()
    sentiment_rates = {
        'Positive': round(float(sent_counts.get('Positive', 0) / total * 100), 1) if total else 0,
        'Neutral':  round(float(sent_counts.get('Neutral', 0) / total * 100), 1) if total else 0,
        'Negative': round(float(sent_counts.get('Negative', 0) / total * 100), 1) if total else 0
    }

    return jsonify({
        'radar': radar,
        'heatmap': heatmap,
        'outliers': outliers,
        'sentiment_rates': sentiment_rates,
        'total': total
    })


@app.route('/api/threads', methods=['GET'])
def threads():
    df = get_df()

    if df is None:
        db_posts = get_all_posts(limit=500)
        if not db_posts: return jsonify({'total': 0, 'threads': []})
        df = pd.DataFrame(db_posts)
        df = df.rename(columns={'id': 'post_id', 'title': 'comment',
                                'sentiment_label': 'sentiment_label',
                                'sentiment_score': 'sentiment_score'})

    if df.empty:
        return jsonify({'total': 0, 'threads': []})

    sub_f  = request.args.get('subreddit', '')
    sort   = request.args.get('sort', 'hot')
    page   = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    tdf = df.copy()
    if sub_f and sub_f != 'All':
        tdf = tdf[tdf['subreddit'] == sub_f]

    sort_col = 'sentiment_score'
    if 'upvotes' in tdf.columns and sort == 'top':
        sort_col = 'upvotes'
    tdf = tdf.sort_values(sort_col, ascending=(sort == 'new'))

    total = len(tdf)
    total_pages = max(1, (total + per_page - 1) // per_page)
    start = (page - 1) * per_page
    paged = tdf.iloc[start:start + per_page]

    thread_list = []
    for _, row in paged.iterrows():
        thread_list.append({
            'id':        str(row.get('post_id', '')),
            'title':     str(row.get('comment', ''))[:120],
            'subreddit': str(row.get('subreddit', '')),
            'author':    str(row.get('author', 'unknown')),
            'upvotes':   int(row.get('upvotes', 0)),
            'comments':  1,
            'sentiment': str(row.get('sentiment_label', '')),
            'score':     float(row.get('sentiment_score', 0)),
            'time':      str(row.get('created_time', ''))
        })

    return jsonify({'total': total, 'threads': thread_list})


@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    data = request.get_json(force=True, silent=True)
    raw_text = (data or {}).get('text', '').strip()
    if not raw_text:
        return jsonify({'ok': False, 'error': 'Text is empty'}), 400

    scores = vader.polarity_scores(clean_text(raw_text) or raw_text)
    score  = round(scores['compound'], 4)
    label  = 'Positive' if score >= 0.05 else ('Negative' if score <= -0.05 else 'Neutral')

    # Segment analysis
    segments = [s.strip() for s in raw_text.split('\n') if s.strip()][:100]
    seg_results = []
    summary = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
    for seg in segments:
        s = vader.polarity_scores(clean_text(seg) or seg)
        c = round(s['compound'], 4)
        l = 'Positive' if c >= 0.05 else ('Negative' if c <= -0.05 else 'Neutral')
        seg_results.append({'text': seg[:200], 'label': l, 'score': c})
        summary[l] += 1

    return jsonify({
        'ok': True,
        'post_sentiment': {'score': score, 'label': label, 'pos': scores['pos'], 'neu': scores['neu'], 'neg': scores['neg']},
        'segments_analyzed': len(seg_results),
        'segment_sentiments': seg_results,
        'summary': summary,
        'title': 'Custom Text Analysis',
        'body': raw_text[:1000]
    })


# ─── LEGACY DB ENDPOINTS ─────────────────────────────────────────────────────

@app.route('/posts', methods=['GET'])
def posts_list():
    return jsonify(get_all_posts())

@app.route('/stats', methods=['GET'])
def posts_stats():
    return jsonify(get_stats())

@app.route('/api/debug-fetch', methods=['GET'])
def debug_fetch():
    from db import get_stats as _gs
    before = _gs()['total_posts']
    scheduler.fetch_reddit_data()
    after  = _gs()['total_posts']
    return jsonify({'rows_before': before, 'rows_after': after, 'rows_added': after - before,
                    'sync_mode': scheduler.sync_state['mode'], 'error': scheduler.sync_state['error']})

# ─── RUN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "="*55)
    print("  RedditAlytics API  |  http://localhost:5000")
    print("  Mode: CSV-Driven + SQLite Fallback")
    print("  Upload CSV → POST /api/upload-csv")
    print("  Clear Data → POST /api/clear-data")
    print("="*55 + "\n")
    # use_reloader=False is mandatory to avoid double triggering the APScheduler thread
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
