"""
scheduler.py — BACKGROUND TASK SCHEDULER (FIXED)
================================================
Uses APScheduler to periodically fetch and analyze Reddit data.
The results are stored in SQLite (reddit.db).
"""

import os
import random
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler
import praw
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv

from db import insert_post
from clean import clean_text

load_dotenv()

analyzer = SentimentIntensityAnalyzer()

# Shared state for health monitoring (reported via /api/status)
sync_state = {
    'last_update': None,
    'mode': 'starting',
    'interval_seconds': 300,
    'cycle_count': 0,
    'error': None
}

# Configuration
INTERVAL_MINUTES = 1
SUBREDDITS = ["technology", "science", "space", "worldnews", "Python"]

def fetch_reddit_data():
    """
    Primary job to fetch data. 
    If credentials exist, it pulls from Reddit.
    Otherwise, it generates synthetic data so the dashboard stays live.
    """
    global sync_state
    
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "RedditSentimentDashboard/1.0")

    try:
        if not client_id or client_id == "your_client_id_here":
            # 🔄 SYNTHETIC MODE
            _generate_synthetic_data()
            sync_state['mode'] = 'simulation'
        else:
            # 🟢 LIVE MODE
            _fetch_live_reddit(client_id, client_secret, user_agent)
            sync_state['mode'] = 'live'
        
        sync_state['last_update'] = datetime.now().isoformat()
        sync_state['cycle_count'] += 1
        sync_state['error'] = None
    except Exception as e:
        print(f"[scheduler.py] ❌ Sync Error: {e}")
        sync_state['error'] = str(e)

def _fetch_live_reddit(c_id, c_secret, agent):
    """Real Reddit API fetch using PRAW."""
    reddit = praw.Reddit(client_id=c_id, client_secret=c_secret, user_agent=agent)
    reddit.read_only = True
    
    print(f"[scheduler.py] 🔄 Starting REAL fetch at {datetime.now().isoformat()}")
    for sub_name in SUBREDDITS:
        subreddit = reddit.subreddit(sub_name)
        for post in subreddit.hot(limit=5):
            _process_and_insert(post.id, f"r/{sub_name}", post.title, str(post.author), post.score, post.created_utc)
    print(f"[scheduler.py] ✅ Real fetch cycle complete.")

def _generate_synthetic_data():
    """Simulates a live fetch with realistic generated data."""
    print(f"[scheduler.py] ℹ️ Generating synthetic live data...")
    topics = {
        "Python": ["New PEP released for async patterns!", "Why Python is still #1 in AI", "Best libraries for web scraping 2026", "Python 3.14 alpha testing"],
        "technology": ["Nvidia announces new quantum chip", "The future of AR glasses", "Why solid state batteries are winning", "Apple Vision Pro 3 leaked specs"],
        "science": ["New habitable exoplanet found", "Breakthrough in fusion energy stability", "Ancient DNA sequence mapped", "Climate study reveals ocean cooling"],
    }
    
    for sub, titles in topics.items():
        for title in random.sample(titles, 2):
            score_utc = datetime.now().timestamp()
            _process_and_insert(f"synth_{random.randint(10000, 99999)}", f"r/{sub}", title, f"user_{random.randint(1, 999)}", random.randint(10, 5000), score_utc)
    print(f"[scheduler.py] ✅ Synthetic cycle complete.")

def _process_and_insert(p_id, sub, title, author, upvotes, created_utc):
    """Helper to analyze text and push to DB."""
    cleaned = clean_text(title)
    sentiment = analyzer.polarity_scores(cleaned or title)
    comp = round(sentiment["compound"], 4)
    label = "Positive" if comp >= 0.05 else ("Negative" if comp <= -0.05 else "Neutral")
    
    post_data = {
        'id': p_id,
        'subreddit': sub,
        'title': title,
        'author': author,
        'comment': "",
        'cleaned_comment': cleaned,
        'sentiment_score': comp,
        'sentiment_label': label,
        'vader_pos': round(sentiment["pos"], 3),
        'vader_neu': round(sentiment["neu"], 3),
        'vader_neg': round(sentiment["neg"], 3),
        'upvotes': upvotes,
        'created_time': datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat()
    }
    insert_post(post_data)

def start_scheduler():
    """Start the background scheduler."""
    scheduler = BackgroundScheduler()
    # Run once on startup
    scheduler.add_job(fetch_reddit_data, 'date', run_date=datetime.now())
    # Then run every fixed interval
    scheduler.add_job(fetch_reddit_data, 'interval', minutes=INTERVAL_MINUTES)
    scheduler.start()
    print(f"[scheduler.py] 🚀 Scheduler started (Interval: {INTERVAL_MINUTES}m)")
    return scheduler
