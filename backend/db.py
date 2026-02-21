import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'reddit.db')

def init_db():
    """Initialize the SQLite database and create the posts table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        subreddit TEXT,
        title TEXT,
        author TEXT,
        comment TEXT,
        cleaned_comment TEXT,
        sentiment_score REAL,
        sentiment_label TEXT,
        vader_pos REAL,
        vader_neu REAL,
        vader_neg REAL,
        upvotes INTEGER,
        created_time TEXT
    )
    """)
    conn.commit()
    conn.close()
    print(f"[db.py] Database initialized at {DB_PATH}")

def insert_post(post_data: dict):
    """Insert a single analyzed post/comment into the database. Ignores duplicates."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT OR IGNORE INTO posts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            post_data['id'],
            post_data['subreddit'],
            post_data['title'],
            post_data['author'],
            post_data['comment'],
            post_data['cleaned_comment'],
            post_data['sentiment_score'],
            post_data['sentiment_label'],
            post_data['vader_pos'],
            post_data['vader_neu'],
            post_data['vader_neg'],
            post_data['upvotes'],
            post_data['created_time']
        ))
        conn.commit()
    except Exception as e:
        print(f"[db.py] Error inserting post {post_data.get('id')}: {e}")
    finally:
        conn.close()

def get_all_posts(limit=1000):
    """Fetch all posts from the database, sorted by time descending."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts ORDER BY created_time DESC LIMIT ?", (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def get_stats():
    """Calculate aggregate sentiment statistics from the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM posts")
    total = cursor.fetchone()[0]
    
    if total == 0:
        return {
            'total_posts': 0,
            'positive_count': 0,
            'negative_count': 0,
            'neutral_count': 0,
            'average_sentiment': 0
        }
    
    cursor.execute("SELECT COUNT(*) FROM posts WHERE sentiment_label = 'Positive'")
    pos = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM posts WHERE sentiment_label = 'Negative'")
    neg = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM posts WHERE sentiment_label = 'Neutral'")
    neu = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(sentiment_score) FROM posts")
    avg_score = cursor.fetchone()[0]
    
    conn.close()
    return {
        'total_posts': total,
        'positive_count': pos,
        'negative_count': neg,
        'neutral_count': neu,
        'average_sentiment': round(float(avg_score or 0), 4)
    }

if __name__ == "__main__":
    init_db()
