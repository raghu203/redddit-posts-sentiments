"""
scheduler.py — NEAR REAL-TIME POLLING ENGINE (DEBUG MODE)
=========================================================
1-minute Reddit polling with full verbose logging.
Falls back to synthetic data if no credentials.
"""

import os
import random
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler
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
    'interval_seconds': 10,
    'cycle_count': 0,
    'posts_inserted': 0,
    'error': None
}

# ── Config ──────────────────────────────────────────────────────────────────
INTERVAL_SECONDS = 10
SUBREDDITS = ["technology", "science", "worldnews", "Python", "space"]

# ────────────────────────────────────────────────────────────────────────────
def fetch_reddit_data():
    """
    Primary polling job — runs every INTERVAL_SECONDS.
    Decides between LIVE (PRAW) and SIMULATION mode.
    """
    global sync_state
    print("\n" + "="*40)
    print(f"🚀 SCHEDULER CYCLE #{sync_state['cycle_count'] + 1} AT {datetime.now().strftime('%H:%M:%S')}")
    print("="*40)

    client_id     = os.getenv("REDDIT_CLIENT_ID", "").strip()
    client_secret = os.getenv("REDDIT_CLIENT_SECRET", "").strip()
    user_agent    = os.getenv("REDDIT_USER_AGENT", "RedditAlytics/1.0").strip()

    print(f"[debug] Client ID: {client_id[:5]}... (length: {len(client_id)})")

    inserted = 0
    try:
        # Check if we have valid credentials
        is_live = client_id and client_id != "your_client_id_here" and len(client_id) > 10
        
        if is_live:
            print("[mode] 🟢 ENTERING LIVE REDDIT FETCH")
            inserted = _fetch_live_reddit(client_id, client_secret, user_agent)
            sync_state['mode'] = 'live'
        else:
            print("[mode] 🔄 ENTERING SIMULATION (NO CREDENTIALS)")
            inserted = _generate_synthetic_data()
            sync_state['mode'] = 'simulation'

        sync_state['last_update']    = datetime.now().isoformat()
        sync_state['cycle_count']   += 1
        sync_state['posts_inserted'] = inserted
        sync_state['error']          = None
        print(f"[result] ✅ Cycle complete: {inserted} rows added to SQLite")

    except Exception as e:
        import traceback
        err_msg = str(e)
        print(f"[error] ❌ CRITICAL FAILURE: {err_msg}")
        traceback.print_exc()
        sync_state['error'] = err_msg
        sync_state['mode']  = 'error'

# ────────────────────────────────────────────────────────────────────────────
def _fetch_live_reddit(c_id, c_secret, agent) -> int:
    """Fetch hot posts from Reddit via PRAW. Returns number inserted."""
    import praw
    print("[praw] Connecting to Reddit...")
    try:
        reddit = praw.Reddit(client_id=c_id, client_secret=c_secret, user_agent=agent)
        reddit.read_only = True

        inserted = 0
        for sub_name in SUBREDDITS:
            print(f"[praw] Scanning r/{sub_name}...")
            try:
                subreddit = reddit.subreddit(sub_name)
                # Force list conversion to trigger the network request here
                posts = list(subreddit.hot(limit=5)) 
                print(f"[praw]   Found {len(posts)} posts in r/{sub_name}")
                
                for post in posts:
                    print(f"   [post] Processing: {post.title[:50]}...")
                    ok = _process_and_insert(
                        p_id=post.id,
                        sub=f"r/{sub_name}",
                        title=post.title,
                        author=str(post.author) if post.author else "[deleted]",
                        upvotes=post.score,
                        created_utc=post.created_utc,
                    )
                    if ok: inserted += 1
            except Exception as e:
                print(f"[praw]   ⚠️ Subreddit Error (r/{sub_name}): {e}")
        return inserted
    except Exception as e:
        print(f"[praw] ❌ Connection failed: {e}")
        raise e

# ────────────────────────────────────────────────────────────────────────────
def _generate_synthetic_data() -> int:
    """Generate realistic fake posts to simulate a live Reddit stream."""
    print("[sim] Generating mock data batch...")
    topics = {
        "Python":     ["New PEP 750 released!", "Why Python is still #1 in AI", "Scraping with Playwright 2026", "Mojo vs Python performance", "Django 5.0 is out!"],
        "technology": ["Nvidia CEO announces H200", "Apple Vision Pro 3 leaks", "Solid-state batteries are here", "The AI bubble debate", "Waymo expands to NYC"],
        "science":    ["New exoplanet found", "Fusion energy milestone", "Ancient DNA sequence", "Ocean cooling anomaly", "CRISPR breakthrough"],
        "news":       ["Global market rally", "Election results update", "Inflation drops to 2%", "New climate accord signed", "Tech stocks soar"],
        "gaming":     ["GTA VI trailer analysis", "Elden Ring DLC announced", "Steam concurrent user record", "PS5 Pro specs leaked", "Indie game goes viral"]
    }

    inserted = 0
    # Pick 2-4 random subreddits each cycle
    active_subs = random.sample(list(topics.keys()), random.randint(2, 4))
    
    for sub in active_subs:
        titles = topics[sub]
        # Pick 2-5 random threads per active sub
        for title in random.sample(titles, random.randint(2, min(5, len(titles)))):
            print(f"   [sim] Creating: {title[:50]}...")
            ok = _process_and_insert(
                p_id=f"synth_{random.randint(100000, 999999)}",
                sub=f"r/{sub}",
                title=title,
                author=f"u/tester_{random.randint(1, 999)}",
                upvotes=random.randint(10, 5000),
                created_utc=datetime.now().timestamp(),
            )
            if ok: inserted += 1
    return inserted

# ────────────────────────────────────────────────────────────────────────────
def _process_and_insert(p_id, sub, title, author, upvotes, created_utc) -> bool:
    """Run VADER analysis and insert into SQLite. Returns True if successful."""
    try:
        cleaned = clean_text(title) or title
        scores = analyzer.polarity_scores(cleaned)
        comp = round(scores["compound"], 4)
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
            'vader_pos': round(scores["pos"], 3),
            'vader_neu': round(scores["neu"], 3),
            'vader_neg': round(scores["neg"], 3),
            'upvotes': int(upvotes),
            'created_time': datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat(),
        }
        insert_post(post_data)
        return True
    except Exception as e:
        # User requested explicitly to see errors here
        print(f"      ❌ INSERT ERROR for '{title[:30]}': {e}")
        return False

# ────────────────────────────────────────────────────────────────────────────
def start_scheduler():
    """Start the background scheduler."""
    sched = BackgroundScheduler()
    # First run immediately
    sched.add_job(fetch_reddit_data, 'date', run_date=datetime.now())
    # Then every 10 seconds
    sched.add_job(fetch_reddit_data, 'interval', seconds=INTERVAL_SECONDS)
    sched.start()
    print(f"[scheduler] 🚨 STARTED — Polling every {INTERVAL_SECONDS}s")
    return sched
