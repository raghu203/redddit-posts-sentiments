"""
rt_fetch.py — REAL-TIME DATA INGESTION MODULE
===============================================
This module runs as a background thread alongside Flask.
It periodically fetches fresh Reddit data and re-analyses it using VADER,
updating the shared in-memory DataFrame that powers all API endpoints.

Two operating modes:
  1. LIVE MODE  — PRAW credentials are present in .env
                  Fetches the newest posts from target subreddits,
                  appends them to analyzed_output.csv, and updates df.

  2. SIMULATION MODE — No credentials / PRAW not installed
                  Re-runs sentiment analysis on the existing CSV every
                  REFRESH_INTERVAL seconds to keep the in-memory data fresh.
                  (Great for demos and offline development.)

Usage (called from app.py):
    from rt_fetch import start_background_sync
    state = start_background_sync(df_container, OUTPUT_FILE, interval=120)
    # df_container is a mutable dict: { 'df': pd.DataFrame }
    # state is a dict with 'last_update', 'mode', 'error', 'cycle_count'
"""

import os
import threading
import time
import traceback
from datetime import datetime, timezone

import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── CONFIG ──────────────────────────────────────────────────────────────────

# Subreddits to monitor in LIVE mode
TARGET_SUBREDDITS = [
    "technology", "science", "space", "worldnews", "Python",
    "ArtificialIntelligence", "MachineLearning",
]

# How many new posts to fetch per subreddit cycle
POSTS_PER_SUBREDDIT = 5

# ─── HELPERS ─────────────────────────────────────────────────────────────────

analyzer = SentimentIntensityAnalyzer()


def _label(score: float) -> str:
    if score >= 0.05:
        return "Positive"
    if score <= -0.05:
        return "Negative"
    return "Neutral"


def _score(text: str) -> dict:
    s = analyzer.polarity_scores(str(text))
    return {
        "compound_score": round(s["compound"], 4),
        "sentiment": _label(s["compound"]),
        "vader_pos": round(s["pos"], 3),
        "vader_neu": round(s["neu"], 3),
        "vader_neg": round(s["neg"], 3),
    }


def _clean(text: str) -> str:
    """Minimal inline text cleaning so we don't import from clean.py."""
    import re
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)           # remove URLs
    text = re.sub(r"[^a-z0-9\s]", "", text)       # keep alphanumeric
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ─── LIVE MODE: fetch via PRAW ────────────────────────────────────────────────

def _try_live_fetch(output_file: str, existing_df: pd.DataFrame) -> pd.DataFrame | None:
    """
    Attempt to fetch fresh Reddit posts using PRAW.
    Returns an updated DataFrame, or None if PRAW is unavailable / creds missing.
    """
    try:
        import praw
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        return None

    client_id = os.getenv("REDDIT_CLIENT_ID", "")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET", "")
    user_agent = os.getenv("REDDIT_USER_AGENT", "RedditSentimentDashboard/1.0")

    # Bail out if credentials are still placeholder values
    if not client_id or client_id == "your_client_id_here":
        return None
    if not client_secret or client_secret == "your_client_secret_here":
        return None

    try:
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent,
        )
        reddit.read_only = True

        known_ids = set(existing_df["post_id"].astype(str)) if "post_id" in existing_df.columns else set()
        new_rows = []

        for sub_name in TARGET_SUBREDDITS:
            subreddit = reddit.subreddit(sub_name)
            for post in subreddit.new(limit=POSTS_PER_SUBREDDIT):
                post.comments.replace_more(limit=0)
                for comment in post.comments[:10]:
                    cid = f"{post.id}_{comment.id}"
                    if cid in known_ids:
                        continue
                    text = getattr(comment, "body", "").strip()
                    if not text or text in ("[deleted]", "[removed]"):
                        continue
                    cleaned = _clean(text)
                    scores = _score(cleaned)
                    new_rows.append({
                        "post_id": post.id,
                        "subreddit": f"r/{sub_name}",
                        "title": post.title[:200],
                        "author": str(comment.author) if comment.author else "[deleted]",
                        "comment": text[:500],
                        "cleaned_comment": cleaned[:500],
                        "compound_score": scores["compound_score"],
                        "sentiment": scores["sentiment"],
                        "vader_pos": scores["vader_pos"],
                        "vader_neu": scores["vader_neu"],
                        "vader_neg": scores["vader_neg"],
                        "upvotes": post.score,
                        "created_time": datetime.fromtimestamp(
                            post.created_utc, tz=timezone.utc
                        ).strftime("%Y-%m-%d %H:%M:%S"),
                    })
                    known_ids.add(cid)

        if not new_rows:
            # No new data but PRAW worked fine — return existing
            return existing_df

        new_df = pd.DataFrame(new_rows)
        updated_df = pd.concat([existing_df, new_df], ignore_index=True)
        # Keep last 1000 rows to prevent unbounded growth
        updated_df = updated_df.tail(1000).reset_index(drop=True)
        updated_df.to_csv(output_file, index=False)
        print(f"[rt_fetch] 🟢 LIVE: added {len(new_rows)} new comments. Total: {len(updated_df)}")
        return updated_df

    except Exception as exc:
        print(f"[rt_fetch] ⚠️  PRAW error: {exc}")
        traceback.print_exc()
        return None


# ─── SIMULATION MODE: re-analyse CSV ─────────────────────────────────────────

def _simulate_refresh(output_file: str) -> pd.DataFrame | None:
    """
    Re-reads analyzed_output.csv and re-runs VADER scoring.
    Simulates "live" data by ensuring the in-memory df is always
    backed by the latest on-disk state (useful if data is added externally).
    """
    try:
        df = pd.read_csv(output_file)
        # Re-score every row to reflect any lexicon updates
        results = df["cleaned_comment"].apply(lambda t: pd.Series(_score(str(t))))
        df["compound_score"] = results["compound_score"]
        df["sentiment"] = results["sentiment"]
        df["vader_pos"] = results["vader_pos"]
        df["vader_neu"] = results["vader_neu"]
        df["vader_neg"] = results["vader_neg"]
        df.to_csv(output_file, index=False)
        print(f"[rt_fetch] 🔄 SIMULATION: re-analysed {len(df)} rows from {output_file}")
        return df
    except Exception as exc:
        print(f"[rt_fetch] ⚠️  Simulation error: {exc}")
        return None


# ─── BACKGROUND THREAD ────────────────────────────────────────────────────────

def _sync_loop(df_container: dict, output_file: str, state: dict, interval: int):
    """
    Runs forever (daemon thread). Each cycle:
      1. Try LIVE fetch via PRAW.
      2. Fall back to simulation re-analysis.
      3. Update df_container['df'] in place.
      4. Update state dict for /api/status endpoint.
    """
    print(f"[rt_fetch] 🚀 Background sync started — interval: {interval}s")

    while True:
        time.sleep(interval)
        state["cycle_count"] += 1
        print(f"[rt_fetch] ⏱ Cycle #{state['cycle_count']} starting...")

        try:
            existing_df = df_container["df"].copy()

            # Try live first
            updated = _try_live_fetch(output_file, existing_df)
            if updated is not None:
                state["mode"] = "live"
            else:
                # Fall back to simulation
                updated = _simulate_refresh(output_file)
                state["mode"] = "simulation"

            if updated is not None:
                df_container["df"] = updated

            state["last_update"] = datetime.now(timezone.utc).isoformat()
            state["error"] = None
            print(f"[rt_fetch] ✅ Cycle #{state['cycle_count']} complete. Mode: {state['mode']}")

        except Exception as exc:
            state["error"] = str(exc)
            print(f"[rt_fetch] ❌ Cycle #{state['cycle_count']} failed: {exc}")
            traceback.print_exc()


def start_background_sync(
    df_container: dict,
    output_file: str,
    interval: int = 120,
) -> dict:
    """
    Starts the background sync thread.

    Args:
        df_container: Mutable dict {'df': pd.DataFrame} — updated in place.
        output_file:  Path to analyzed_output.csv.
        interval:     Seconds between sync cycles (default: 120).

    Returns:
        state dict with keys: last_update, mode, error, cycle_count.
        Expose this dict via /api/status.
    """
    state = {
        "last_update": None,
        "mode": "starting",
        "error": None,
        "cycle_count": 0,
        "interval_seconds": interval,
    }

    thread = threading.Thread(
        target=_sync_loop,
        args=(df_container, output_file, state, interval),
        daemon=True,   # Dies when Flask dies — no cleanup needed
        name="rt-sync",
    )
    thread.start()
    return state
