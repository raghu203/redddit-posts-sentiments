"""
api_fetch.py — LIVE REDDIT DATA FETCHER
========================================
Uses PRAW (Python Reddit API Wrapper) to fetch real Reddit posts
and their top-level comments from a user-supplied URL.

Project Flow position:
    User URL → [THIS MODULE] → clean.py → analyze.py → API Response

VIVA TIP:
  "PRAW is the official Python library for the Reddit API.
   It handles OAuth authentication automatically.
   We extract the post ID from the URL, then fetch
   the title, body, and top 50 comments in one API call."

Setup:
  1. Create a Reddit application at https://www.reddit.com/prefs/apps
     - Choose "Script" type
     - Set redirect URI to http://localhost:8080
  2. Create a file called .env in the backend/ folder with:
       REDDIT_CLIENT_ID=your_client_id
       REDDIT_CLIENT_SECRET=your_client_secret
       REDDIT_USER_AGENT=MyBot/1.0 by u/your_username
  3. Run: pip install praw python-dotenv
"""

import re
import os

# ─── OPTIONAL IMPORTS ────────────────────────────────────────────────────────
# These are only required for live fetching. If not installed,
# the module degrades gracefully and returns a useful error.

try:
    import praw
    PRAW_AVAILABLE = True
except ImportError:
    PRAW_AVAILABLE = False

try:
    from dotenv import load_dotenv
    load_dotenv()   # Reads from backend/.env
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def extract_post_id(url: str) -> str | None:
    """
    Extract the Reddit post ID from a full URL.

    Handles formats like:
      https://www.reddit.com/r/python/comments/abc123/some_title/
      https://reddit.com/r/space/comments/xyz789/...
      https://old.reddit.com/r/technology/comments/def456/...

    Returns the 6-character alphanumeric post ID, or None if not found.
    """
    pattern = r'reddit\.com/r/\w+/comments/([A-Za-z0-9]+)'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return None


def check_credentials() -> dict:
    """
    Check if Reddit API credentials are available in environment.
    Returns a dict with 'ok' (bool) and 'error' (str if not ok).
    """
    if not PRAW_AVAILABLE:
        return {'ok': False, 'error': 'praw not installed. Run: pip install praw python-dotenv'}

    client_id     = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    user_agent    = os.getenv('REDDIT_USER_AGENT', 'RedditSentimentDashboard/1.0')

    if not client_id or not client_secret:
        return {
            'ok': False,
            'error': (
                'Reddit API credentials not found. '
                'Create backend/.env with REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET. '
                'Get them at https://www.reddit.com/prefs/apps'
            )
        }
    return {'ok': True, 'client_id': client_id, 'client_secret': client_secret, 'user_agent': user_agent}


def fetch_post_data(url: str, comment_limit: int = 50) -> dict:
    """
    Fetch a Reddit post and its top-level comments.

    Args:
        url:           Full Reddit post URL.
        comment_limit: Max number of top-level comments to fetch (default: 50).

    Returns:
        {
          'ok': True,
          'post_id': 'abc123',
          'subreddit': 'r/technology',
          'title': 'Amazing discovery...',
          'body': 'The post text...',
          'upvotes': 4200,
          'comments': ['comment 1 text', 'comment 2 text', ...]
        }

        OR on failure:
        {
          'ok': False,
          'error': 'Human-readable error message'
        }
    """
    # ── 1. Validate URL format ────────────────────────────────────────────────
    post_id = extract_post_id(url)
    if not post_id:
        return {
            'ok': False,
            'error': (
                f'Could not extract a post ID from the URL: "{url}". '
                'Please use a full Reddit post URL like: '
                'https://www.reddit.com/r/subreddit/comments/postid/title/'
            )
        }

    # ── 2. Check credentials ──────────────────────────────────────────────────
    creds = check_credentials()
    if not creds['ok']:
        return {'ok': False, 'error': creds['error']}

    # ── 3. Authenticate with Reddit ───────────────────────────────────────────
    try:
        reddit = praw.Reddit(
            client_id=creds['client_id'],
            client_secret=creds['client_secret'],
            user_agent=creds['user_agent'],
        )
        # Note: read_only mode – we only read, never post
        reddit.read_only = True
    except Exception as e:
        return {'ok': False, 'error': f'Failed to authenticate with Reddit API: {str(e)}'}

    # ── 4. Fetch the submission (post) ────────────────────────────────────────
    try:
        submission = reddit.submission(id=post_id)
        # Force load — this triggers the API call
        title      = submission.title
        body       = submission.selftext or ''
        subreddit  = f'r/{submission.subreddit.display_name}'
        upvotes    = submission.score
    except Exception as e:
        return {'ok': False, 'error': f'Post not found or Reddit API error: {str(e)}'}

    # ── 5. Fetch top-level comments ───────────────────────────────────────────
    try:
        submission.comments.replace_more(limit=0)  # Skip "load more" buttons
        comments = []
        for comment in submission.comments[:comment_limit]:
            text = getattr(comment, 'body', '').strip()
            if text and text != '[deleted]' and text != '[removed]':
                comments.append(text)
    except Exception as e:
        return {'ok': False, 'error': f'Failed to fetch comments: {str(e)}'}

    return {
        'ok': True,
        'post_id': post_id,
        'subreddit': subreddit,
        'title': title,
        'body': body,
        'upvotes': upvotes,
        'comments': comments,
    }


# ─── STANDALONE TEST ─────────────────────────────────────────────────────────
if __name__ == '__main__':
    # Run: python api_fetch.py
    test_url = input('Enter a Reddit post URL to test: ').strip()
    result = fetch_post_data(test_url)
    if result['ok']:
        print(f"\n✅ Post: {result['title']}")
        print(f"   Subreddit: {result['subreddit']}")
        print(f"   Upvotes: {result['upvotes']}")
        print(f"   Comments fetched: {len(result['comments'])}")
        for c in result['comments'][:3]:
            print(f"   → {c[:80]}...")
    else:
        print(f"\n❌ Error: {result['error']}")
