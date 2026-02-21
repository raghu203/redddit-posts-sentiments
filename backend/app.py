"""
app.py — FLASK REST API
========================
This is the backend server for the Reddit Sentiment Dashboard.

Project Flow position:
    Sentiment Analysis → Store Results → Dashboard Visualization (API)

What this does:
- Runs analyze.py once on startup to process all data
- Exposes REST API endpoints that the Next.js frontend can call
- Returns JSON data for charts, tables, and stats in the dashboard

API Endpoints:
  GET /api/overview          → KPI stats (total posts, avg score, etc.)
  GET /api/sentiment         → Sentiment distribution (Pos/Neu/Neg counts)
  GET /api/subreddits        → Per-subreddit sentiment breakdown
  GET /api/comments          → Paginated comment table with search & filter
  GET /api/trends            → Sentiment over time (by date)
  GET /health                → Health check

CORS is enabled so the Next.js dev server (localhost:3000) can call this.

To run:
  python app.py
  → Server starts at http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
from analyze import analyze
from api_fetch import fetch_post_data
from clean import clean_text
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── INIT ────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Allow requests from the Next.js frontend

# ─── RUN ANALYSIS ON STARTUP ─────────────────────────────────────────────────
# Load analyzed data. If analyzed_output.csv already exists, use it directly.
# Otherwise run the full pipeline (clean + analyze).
DATA_FILE = 'reddit_data.csv'
OUTPUT_FILE = 'analyzed_output.csv'

if os.path.exists(OUTPUT_FILE):
    print(f"[app.py] Loading existing results from {OUTPUT_FILE}")
    df = pd.read_csv(OUTPUT_FILE)
else:
    print(f"[app.py] No cached results found. Running analysis pipeline...")
    df = analyze(DATA_FILE)

print(f"[app.py] Data ready. {len(df)} comments loaded.")


# ─── HELPER ──────────────────────────────────────────────────────────────────
def sentiment_counts(dataframe: pd.DataFrame) -> dict:
    """Return Positive/Neutral/Negative counts from a DataFrame."""
    counts = dataframe['sentiment'].value_counts().to_dict()
    return {
        'Positive': int(counts.get('Positive', 0)),
        'Neutral':  int(counts.get('Neutral', 0)),
        'Negative': int(counts.get('Negative', 0)),
    }


# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Health check — confirms the server is running."""
    return jsonify({'status': 'ok', 'message': 'Reddit Sentiment API is running.'})


@app.route('/api/overview', methods=['GET'])
def overview():
    """
    Returns high-level KPI statistics for the Overview dashboard page.

    Response:
    {
      "total_comments": 30,
      "total_subreddits": 5,
      "avg_sentiment_score": 0.1234,
      "sentiment_counts": { "Positive": 15, "Neutral": 8, "Negative": 7 },
      "most_active_subreddit": "r/technology",
      "most_positive_subreddit": "r/space",
      "most_negative_subreddit": "r/worldnews"
    }
    """
    # Filter by date if params provided
    filtered = df.copy()
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if start_date or end_date:
        filtered['created_time'] = pd.to_datetime(filtered['created_time'], errors='coerce')
        filtered = filtered.dropna(subset=['created_time'])
        if start_date:
            filtered = filtered[filtered['created_time'] >= pd.to_datetime(start_date)]
        if end_date:
            filtered = filtered[filtered['created_time'] <= pd.to_datetime(end_date)]

    total = len(filtered)
    if total == 0:
        return jsonify({
            'total_comments': 0,
            'total_subreddits': 0,
            'avg_sentiment_score': 0,
            'sentiment_counts': {'Positive': 0, 'Neutral': 0, 'Negative': 0},
            'most_active_subreddit': 'None',
            'most_positive_subreddit': 'None',
            'most_negative_subreddit': 'None',
            'data_health': {'missing_author_pct': 0, 'missing_timestamp_pct': 0, 'avg_comment_length': 0}
        })

    counts = sentiment_counts(filtered)
    avg_score = round(float(filtered['compound_score'].mean()), 4)

    sub_avg = filtered.groupby('subreddit')['compound_score'].mean()
    most_positive = sub_avg.idxmax()
    most_negative = sub_avg.idxmin()
    most_active = filtered['subreddit'].value_counts().idxmax()

    # Data health stats
    missing_author = int(filtered['author'].isna().sum() + (filtered['author'] == '').sum())
    avg_len = round(float(filtered['comment'].str.len().mean()), 1) if 'comment' in filtered.columns else 0

    return jsonify({
        'total_comments': total,
        'total_subreddits': filtered['subreddit'].nunique(),
        'avg_sentiment_score': avg_score,
        'sentiment_counts': counts,
        'most_active_subreddit': most_active,
        'most_positive_subreddit': most_positive,
        'most_negative_subreddit': most_negative,
        'data_health': {
            'missing_author_pct': round(missing_author / total * 100, 1) if total > 0 else 0,
            'missing_timestamp_pct': round(float(filtered['created_time'].isna().sum()) / total * 100, 1) if total > 0 else 0,
            'avg_comment_length': avg_len,
        }
    })


@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    """
    Returns full sentiment distribution data for pie/bar/donut charts.

    Optional query params:
      ?subreddit=r/technology   → filter by subreddit
      ?sentiment=Positive       → filter by sentiment label

    Response:
    {
      "total": 30,
      "counts": { "Positive": 15, "Neutral": 8, "Negative": 7 },
      "percentages": { "Positive": 50.0, "Neutral": 26.7, "Negative": 23.3 },
      "avg_score": 0.1234,
      "distribution": [  // Score histogram buckets for bar chart
        { "range": "-1.0 to -0.8", "count": 3 },
        ...
      ]
    }
    """
    filtered = df.copy()

    # Apply filters
    sub_param = request.args.get('subreddit')
    sent_param = request.args.get('sentiment')
    if sub_param:
        filtered = filtered[filtered['subreddit'] == sub_param]
    if sent_param:
        filtered = filtered[filtered['sentiment'] == sent_param]

    total = len(filtered)
    if total == 0:
        return jsonify({'error': 'No data for given filters'}), 404

    counts = sentiment_counts(filtered)
    percentages = {k: round(v / total * 100, 1) for k, v in counts.items()}

    # Score histogram (11 buckets from -1.0 to +1.0)
    buckets = []
    for i, low in enumerate([round(-1.0 + j * 0.2, 1) for j in range(11)]):
        high = round(low + 0.2, 1)
        bucket_count = int(((filtered['compound_score'] >= low) &
                            (filtered['compound_score'] < high)).sum())
        buckets.append({'range': f'{low:.1f}', 'count': bucket_count})

    return jsonify({
        'total': total,
        'counts': counts,
        'percentages': percentages,
        'avg_score': round(float(filtered['compound_score'].mean()), 4),
        'distribution': buckets,
    })


@app.route('/api/subreddits', methods=['GET'])
def subreddits():
    """
    Returns per-subreddit sentiment breakdown for the Subreddit Comparison page.

    Response:
    {
      "subreddits": [
        {
          "name": "r/technology",
          "total": 8,
          "positive": 3,
          "neutral": 2,
          "negative": 3,
          "positive_pct": 37.5,
          "neutral_pct": 25.0,
          "negative_pct": 37.5,
          "avg_score": -0.05
        },
        ...
      ]
    }
    """
    result = []
    for sub in df['subreddit'].unique():
        sub_df = df[df['subreddit'] == sub]
        total = len(sub_df)
        counts = sentiment_counts(sub_df)
        result.append({
            'name': sub,
            'total': total,
            'positive': counts['Positive'],
            'neutral': counts['Neutral'],
            'negative': counts['Negative'],
            'positive_pct': round(counts['Positive'] / total * 100, 1),
            'neutral_pct': round(counts['Neutral'] / total * 100, 1),
            'negative_pct': round(counts['Negative'] / total * 100, 1),
            'avg_score': round(float(sub_df['compound_score'].mean()), 4),
        })

    # Sort by avg_score descending (most positive first)
    result.sort(key=lambda x: x['avg_score'], reverse=True)
    return jsonify({'subreddits': result})


@app.route('/api/comments', methods=['GET'])
def comments():
    """
    Returns a paginated list of comments for the Comment Explorer table.

    Query params:
      ?page=1            (default: 1)
      ?per_page=8        (default: 8)
      ?search=keyword    (filter by keyword in comment text)
      ?sentiment=Positive/ Neutral / Negative
      ?subreddit=r/technology

    Response:
    {
      "total": 30,
      "page": 1,
      "per_page": 8,
      "total_pages": 4,
      "comments": [ { ... }, ... ]
    }
    """
    # Filters
    filtered = df.copy()
    search = request.args.get('search', '').strip().lower()
    sent_param = request.args.get('sentiment', '')
    sub_param = request.args.get('subreddit', '')
    sort_by = request.args.get('sort_by', 'upvotes')   # 'score' | 'upvotes'
    sort_dir = request.args.get('sort_dir', 'desc')     # 'asc' | 'desc'

    if search:
        filtered = filtered[
            filtered['comment'].str.lower().str.contains(search, na=False) |
            filtered['author'].str.lower().str.contains(search, na=False)
        ]
    if sent_param and sent_param != 'All':
        filtered = filtered[filtered['sentiment'] == sent_param]
    if sub_param and sub_param != 'All':
        filtered = filtered[filtered['subreddit'] == sub_param]

    # Sorting
    ascending = sort_dir == 'asc'
    if sort_by == 'score':
        filtered = filtered.sort_values('compound_score', ascending=ascending)
    elif sort_by == 'upvotes':
        filtered = filtered.sort_values('upvotes', ascending=ascending)

    # Counts (global, not filtered) for quick-stat chips
    global_counts = sentiment_counts(df)
    global_counts['total'] = len(df)

    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 8))
    total = len(filtered)
    total_pages = max(1, -(-total // per_page))  # ceiling division
    start = (page - 1) * per_page
    paginated = filtered.iloc[start:start + per_page]

    rows = []
    for _, row in paginated.iterrows():
        rows.append({
            'post_id': row['post_id'],
            'comment': row['comment'],
            'cleaned_comment': row['cleaned_comment'],
            'sentiment': row['sentiment'],
            'score': round(float(row['compound_score']), 4),
            'subreddit': row['subreddit'],
            'author': row['author'],
            'upvotes': int(row['upvotes']),
            'created_time': str(row['created_time']),
        })

    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
        'counts': global_counts,
        'comments': rows,
    })


@app.route('/api/trends', methods=['GET'])
def trends():
    """
    Returns sentiment scores grouped by date for the time-based trend chart.

    Response:
    {
      "trends": [
        { "date": "2024-01-02", "avg_score": 0.42, "positive": 3, "neutral": 1, "negative": 0 },
        ...
      ]
    }
    """
    df_copy = df.copy()
    df_copy['created_time'] = pd.to_datetime(df_copy['created_time'], errors='coerce')
    df_copy = df_copy.dropna(subset=['created_time'])

    # Apply date filters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if start_date:
        df_copy = df_copy[df_copy['created_time'] >= pd.to_datetime(start_date)]
    if end_date:
        df_copy = df_copy[df_copy['created_time'] <= pd.to_datetime(end_date)]

    df_copy['date'] = df_copy['created_time'].dt.strftime('%Y-%m-%d')

    grouped = df_copy.groupby('date')
    trend_rows = []
    for date, group in sorted(grouped, key=lambda x: x[0]):
        counts = sentiment_counts(group)
        trend_rows.append({
            'date': date,
            'avg_score': round(float(group['compound_score'].mean()), 4),
            'positive': counts['Positive'],
            'neutral': counts['Neutral'],
            'negative': counts['Negative'],
            'total': len(group),
        })

    return jsonify({'trends': trend_rows})


@app.route('/api/emotions', methods=['GET'])
def emotions():
    """
    Returns emotion distribution using a keyword-based approach on top of VADER scores.
    Maps comments to Joy / Anger / Fear / Sadness / Surprise / Neutral using lexicons.

    Response:
    {
      "radar": [ {"emotion": "Joy", "value": 0.42}, ... ],
      "heatmap": { "r/technology": { "Joy": 0.3, "Anger": 0.7, ... }, ... },
      "outliers": [ { comment, sentiment, score, author, subreddit, emotion, emotion_label }, ... ]
    }
    """
    # Simple keyword-based emotion lexicon (college-friendly, no external model needed)
    LEXICON = {
        'Joy':      ['love', 'amazing', 'great', 'happy', 'best', 'awesome', 'fantastic', 'excellent', 'excited', 'wonderful', 'glad', 'fun', 'brilliant'],
        'Anger':    ['hate', 'angry', 'furious', 'outrage', 'terrible', 'awful', 'unacceptable', 'cancel', 'disgusting', 'worst', 'ruin', 'disgrace'],
        'Fear':     ['scared', 'worried', 'fear', 'afraid', 'concern', 'danger', 'risk', 'threat', 'problem', 'crisis', 'warning', 'bad'],
        'Sadness':  ['sad', 'disappoint', 'unfortunate', 'sorry', 'miss', 'loss', 'fail', 'depressed', 'regret', 'tragic', 'hurt'],
        'Surprise': ['wow', 'unexpected', 'surprising', 'shocking', 'unbelievable', 'incredible', 'sudden', 'never thought', 'omg', 'what'],
    }

    def detect_emotion(text: str) -> str:
        text_lower = str(text).lower()
        scores = {e: sum(1 for kw in kws if kw in text_lower) for e, kws in LEXICON.items()}
        if max(scores.values()) == 0:
            return 'Neutral'
        return max(scores, key=scores.get)

    df_e = df.copy()
    df_e['emotion'] = df_e['cleaned_comment'].apply(detect_emotion)

    # Radar: overall emotion distribution
    emotion_counts = df_e['emotion'].value_counts()
    total = len(df_e)
    all_emotions = ['Joy', 'Anger', 'Fear', 'Sadness', 'Surprise', 'Neutral']
    radar = [
        {'emotion': e, 'value': round(int(emotion_counts.get(e, 0)) / total, 3)}
        for e in all_emotions
    ]

    # Heatmap: emotion distribution per subreddit
    heatmap = {}
    for sub in df_e['subreddit'].unique():
        sub_df = df_e[df_e['subreddit'] == sub]
        sub_total = len(sub_df)
        sub_counts = sub_df['emotion'].value_counts()
        heatmap[sub] = {
            e: round(int(sub_counts.get(e, 0)) / sub_total, 3)
            for e in all_emotions
        }

    # Outliers: top positive and top negative comments
    top_pos = df_e.nlargest(1, 'compound_score').iloc[0] if len(df_e) > 0 else None
    top_neg = df_e.nsmallest(1, 'compound_score').iloc[0] if len(df_e) > 0 else None
    outliers = []
    for row in [top_pos, top_neg]:
        if row is not None:
            outliers.append({
                'comment':   str(row['comment']),
                'sentiment': str(row['sentiment']),
                'score':     round(float(row['compound_score']), 4),
                'author':    str(row['author']),
                'subreddit': str(row['subreddit']),
                'emotion':   str(row['emotion']),
                'created_time': str(row['created_time']),
            })

    return jsonify({'radar': radar, 'heatmap': heatmap, 'outliers': outliers})


@app.route('/api/threads', methods=['GET'])
def threads():
    """
    Returns post-level data for the Reddit Threads page.
    Groups comments by post_id and subreddit to get top-level thread data.

    Query params:
      ?subreddit=r/technology   → filter by subreddit
      ?sort=hot|new|top         → sorting mode
      ?page=1, ?per_page=10

    Response:
    {
      "total": 15,
      "threads": [ { "id", "title", "subreddit", "author", "upvotes", "comments", "sentiment", "score", "time" }, ... ]
    }
    """
    sub_param  = request.args.get('subreddit', '')
    sort_param = request.args.get('sort', 'hot')     # hot | new | top
    page       = int(request.args.get('page', 1))
    per_page   = int(request.args.get('per_page', 10))

    # Group by post_id — one row per post
    grouped = df.groupby('post_id').agg(
        title     =('title',          'first'),
        subreddit =('subreddit',      'first'),
        author    =('author',         'first'),
        upvotes   =('upvotes',        'max'),
        comments  =('comment',        'count'),
        avg_score =('compound_score', 'mean'),
        created_time=('created_time', 'first'),
    ).reset_index()

    grouped['sentiment'] = grouped['avg_score'].apply(
        lambda s: 'Positive' if s >= 0.05 else ('Negative' if s <= -0.05 else 'Neutral')
    )
    grouped['avg_score'] = grouped['avg_score'].round(4)

    # Filter
    if sub_param and sub_param != 'All':
        grouped = grouped[grouped['subreddit'] == sub_param]

    # Sort
    if sort_param == 'top':
        grouped = grouped.sort_values('upvotes', ascending=False)
    elif sort_param == 'new':
        grouped = grouped.sort_values('created_time', ascending=False)
    else:  # hot: upvotes × comment count
        grouped = grouped.sort_values('upvotes', ascending=False)

    total = len(grouped)
    total_pages = max(1, -(-total // per_page))
    start = (page - 1) * per_page
    page_df = grouped.iloc[start:start + per_page]

    result = []
    for _, row in page_df.iterrows():
        result.append({
            'id':          str(row['post_id']),
            'title':       str(row['title']),
            'subreddit':   str(row['subreddit']),
            'author':      str(row['author']),
            'upvotes':     int(row['upvotes']),
            'comments':    int(row['comments']),
            'sentiment':   str(row['sentiment']),
            'score':       float(row['avg_score']),
            'time':        str(row['created_time']),
        })

    return jsonify({'total': total, 'total_pages': total_pages, 'threads': result})

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    Accepts raw text and returns sentiment analysis for the whole text 
    and for individual segments (lines).
    """
    data = request.get_json(force=True, silent=True)
    if not data or 'text' not in data:
        return jsonify({'ok': False, 'error': 'Request must include a JSON body with a "text" field.'}), 400

    raw_text = data['text'].strip()
    if not raw_text:
        return jsonify({'ok': False, 'error': 'Text cannot be empty.'}), 400

    # ── Initialize VADER ─────────────────────────────────────────────────────
    vader = SentimentIntensityAnalyzer()

    def vader_label(compound: float) -> str:
        if compound >= 0.05:  return 'Positive'
        if compound <= -0.05: return 'Negative'
        return 'Neutral'

    def score_text(txt: str) -> dict:
        cleaned = clean_text(txt)
        scores = vader.polarity_scores(cleaned or txt)
        return {
            'score': round(scores['compound'], 4),
            'label': vader_label(scores['compound']),
            'pos':   round(scores['pos'], 3),
            'neu':   round(scores['neu'], 3),
            'neg':   round(scores['neg'], 3),
        }

    # ── Score the overall text ────────────────────────────────────────────────
    overall_sentiment = score_text(raw_text)

    # ── Split into segments (lines/paragraphs) and score ──────────────────────
    # Filter out empty lines
    segments = [s.strip() for s in raw_text.split('\n') if s.strip()]
    
    # Cap at 100 segments to prevent performance issues
    segments = segments[:100]

    segment_sentiments = []
    summary = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
    
    for seg in segments:
        result = score_text(seg)
        segment_sentiments.append({
            'text':  seg[:200], # truncate for front-end
            'label': result['label'],
            'score': result['score'],
        })
        summary[result['label']] += 1

    return jsonify({
        'ok':                True,
        'title':             'Custom Text Analysis',
        'body':              raw_text[:1000], # first 1000 chars
        'post_sentiment':    overall_sentiment,
        'segments_analyzed': len(segment_sentiments),
        'segment_sentiments': segment_sentiments,
        'summary':           summary,
    })


@app.route('/api/analyze-url', methods=['POST'])
def analyze_url():
    """
    Accepts a Reddit post URL and returns full sentiment analysis.

    Request body (JSON):
      { "url": "https://www.reddit.com/r/..." }

    Response:
    {
      "ok": true,
      "post_id": "abc123",
      "subreddit": "r/technology",
      "title": "Post title",
      "body": "Post body text...",
      "upvotes": 4200,
      "post_sentiment": { "label": "Positive", "score": 0.82, "pos": 0.4, "neu": 0.5, "neg": 0.1 },
      "comments_analyzed": 50,
      "comment_sentiments": [ { "text": "...", "label": "Positive", "score": 0.72 }, ... ],
      "summary": { "Positive": 28, "Neutral": 15, "Negative": 7 }
    }
    """
    data = request.get_json(force=True, silent=True)
    if not data or 'url' not in data:
        return jsonify({'ok': False, 'error': 'Request must include a JSON body with a "url" field.'}), 400

    url = data['url'].strip()
    if not url:
        return jsonify({'ok': False, 'error': 'URL cannot be empty.'}), 400

    # ── Fetch from Reddit via PRAW ────────────────────────────────────────────
    fetched = fetch_post_data(url, comment_limit=50)
    if not fetched['ok']:
        return jsonify({'ok': False, 'error': fetched['error']}), 422

    # ── Initialize VADER ─────────────────────────────────────────────────────
    vader = SentimentIntensityAnalyzer()

    def vader_label(compound: float) -> str:
        if compound >= 0.05:  return 'Positive'
        if compound <= -0.05: return 'Negative'
        return 'Neutral'

    def score_text(raw_text: str) -> dict:
        cleaned = clean_text(raw_text)
        scores = vader.polarity_scores(cleaned or raw_text)
        return {
            'score': round(scores['compound'], 4),
            'label': vader_label(scores['compound']),
            'pos':   round(scores['pos'], 3),
            'neu':   round(scores['neu'], 3),
            'neg':   round(scores['neg'], 3),
        }

    # ── Score the post itself ────────────────────────────────────────────────
    post_text = (fetched['title'] + ' ' + fetched['body']).strip()
    post_sentiment = score_text(post_text)

    # ── Score each comment ───────────────────────────────────────────────────
    comment_sentiments = []
    summary = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
    for comment_text in fetched['comments']:
        result = score_text(comment_text)
        comment_sentiments.append({
            'text':  comment_text[:200],   # truncate for front-end
            'label': result['label'],
            'score': result['score'],
        })
        summary[result['label']] += 1

    return jsonify({
        'ok':                True,
        'post_id':           fetched['post_id'],
        'subreddit':         fetched['subreddit'],
        'title':             fetched['title'],
        'body':              fetched['body'][:500],   # first 500 chars
        'upvotes':           fetched['upvotes'],
        'post_sentiment':    post_sentiment,
        'comments_analyzed': len(comment_sentiments),
        'comment_sentiments': comment_sentiments,
        'summary':           summary,
    })


# ─── RUN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "="*50)
    print("  Reddit Sentiment Analysis — Flask API")
    print("  Server: http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
