"""
app.py — REAL-TIME FLASK API (SQLITE BACKED)
============================================
The central backend server for the Reddit Alytics Dashboard.
Now 100% Real-Time:
- Removes all CSV dependencies.
- Uses SQLite (reddit.db) for data persistence.
- Uses APScheduler to automatically fetch and analyze new Reddit data.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime

# Local imports
from db import init_db, get_all_posts, get_stats
import scheduler # Import whole module to access its global sync_state
from clean import clean_text
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── INIT ────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()

# Start the background scheduler (Pulls from Reddit every 5 mins)
engine = scheduler.start_scheduler()

vader = SentimentIntensityAnalyzer()

# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Reddit Alytics API is running in Real-Time mode.'})

@app.route('/api/status', methods=['GET'])
def status():
    """Returns real-time sync status (Legacy endpoint for LiveSyncBadge)."""
    stats = get_stats()
    # Read directly from the scheduler's shared state
    return jsonify({
        'status': 'ok',
        'total_rows': stats['total_posts'],
        'last_update': scheduler.sync_state['last_update'],
        'sync_mode': scheduler.sync_state['mode'],
        'sync_interval_seconds': scheduler.sync_state['interval_seconds'],
        'cycle_count': scheduler.sync_state['cycle_count'],
        'error': scheduler.sync_state['error']
    })

# 🎯 NEW REQUIRED ENDPOINTS

@app.route('/posts', methods=['GET'])
def posts_list():
    """Returns all stored posts from the SQLite database."""
    return jsonify(get_all_posts())

@app.route('/stats', methods=['GET'])
def posts_stats():
    """Returns aggregate summary statistics."""
    return jsonify(get_stats())

# 📊 ADAPTED GRANULAR ENDPOINTS (For existing individual dashboard pages)

@app.route('/api/overview', methods=['GET'])
def overview():
    db_posts = get_all_posts(limit=2000)
    if not db_posts:
        return jsonify({ 'total_comments': 0, 'total_subreddits': 0, 'avg_sentiment_score': 0, 'sentiment_counts': { 'Positive': 0, 'Neutral': 0, 'Negative': 0 } })
    
    df = pd.DataFrame(db_posts)
    counts = df['sentiment_label'].value_counts().to_dict()
    
    return jsonify({
        'total_comments': len(df),
        'total_subreddits': df['subreddit'].nunique(),
        'avg_sentiment_score': round(float(df['sentiment_score'].mean()), 4),
        'sentiment_counts': {
            'Positive': int(counts.get('Positive', 0)),
            'Neutral':  int(counts.get('Neutral', 0)),
            'Negative': int(counts.get('Negative', 0))
        },
        'most_active_subreddit': df['subreddit'].value_counts().idxmax() if not df.empty else "N/A"
    })

@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    db_posts = get_all_posts(limit=2000)
    if not db_posts:
        return jsonify({'error': 'No data'}, 404)
    
    df = pd.DataFrame(db_posts)
    counts = df['sentiment_label'].value_counts().to_dict()
    total = len(df)
    
    return jsonify({
        'total': total,
        'counts': {
            'Positive': int(counts.get('Positive', 0)),
            'Neutral':  int(counts.get('Neutral', 0)),
            'Negative': int(counts.get('Negative', 0))
        },
        'percentages': {
            'Positive': round(counts.get('Positive', 0) / total * 100, 1),
            'Neutral': round(counts.get('Neutral', 0) / total * 100, 1),
            'Negative': round(counts.get('Negative', 0) / total * 100, 1),
        },
        'avg_score': round(float(df['sentiment_score'].mean()), 4)
    })

@app.route('/api/subreddits', methods=['GET'])
def subreddits():
    db_posts = get_all_posts(limit=2000)
    if not db_posts: return jsonify({'subreddits': []})
    
    df = pd.DataFrame(db_posts)
    result = []
    for sub in df['subreddit'].unique():
        sub_df = df[df['subreddit'] == sub]
        counts = sub_df['sentiment_label'].value_counts()
        result.append({
            'name': sub,
            'total': len(sub_df),
            'positive': int(counts.get('Positive', 0)),
            'neutral': int(counts.get('Neutral', 0)),
            'negative': int(counts.get('Negative', 0)),
            'avg_score': round(float(sub_df['sentiment_score'].mean()), 4)
        })
    return jsonify({'subreddits': result})

@app.route('/api/comments', methods=['GET'])
def comments():
    db_posts = get_all_posts(limit=500)
    rows = []
    for row in db_posts:
        rows.append({
            'post_id': row['id'],
            'comment': row['title'], # In this mode, we treat titles as primary text
            'sentiment': row['sentiment_label'],
            'score': row['sentiment_score'],
            'subreddit': row['subreddit'],
            'author': row['author'],
            'upvotes': row['upvotes'],
            'created_time': row['created_time']
        })
    return jsonify({ 'total': len(rows), 'comments': rows })

@app.route('/api/trends', methods=['GET'])
def trends():
    db_posts = get_all_posts(limit=2000)
    if not db_posts: return jsonify({'trends': []})
    
    df = pd.DataFrame(db_posts)
    df['date'] = pd.to_datetime(df['created_time']).dt.strftime('%Y-%m-%d')
    grouped = df.groupby('date')
    
    trend_rows = []
    for date, group in sorted(grouped, key=lambda x: x[0]):
        counts = group['sentiment_label'].value_counts()
        trend_rows.append({
            'date': date,
            'avg_score': round(float(group['sentiment_score'].mean()), 4),
            'positive': int(counts.get('Positive', 0)),
            'neutral': int(counts.get('Neutral', 0)),
            'negative': int(counts.get('Negative', 0)),
            'total': len(group)
        })
    return jsonify({'trends': trend_rows})

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    data = request.get_json(force=True, silent=True)
    raw_text = data.get('text', '').strip()
    if not raw_text: return jsonify({'ok': False, 'error': 'Text is empty'}), 400
    
    scores = vader.polarity_scores(clean_text(raw_text) or raw_text)
    score = round(scores['compound'], 4)
    label = "Positive" if score >= 0.05 else ("Negative" if score <= -0.05 else "Neutral")
    
    return jsonify({
        'ok': True,
        'post_sentiment': { 'score': score, 'label': label, 'pos': scores['pos'], 'neu': scores['neu'], 'neg': scores['neg'] }
    })

# ─── RUN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "="*50)
    print("  RedditAlytics REAL-TIME Engine (SQLite)")
    print("  Sync: APScheduler (5-minute interval)")
    print("  API: http://localhost:5000")
    print("="*50 + "\n")
    # use_reloader=False is mandatory to avoid double triggering the APScheduler thread
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
