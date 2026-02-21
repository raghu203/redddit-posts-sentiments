# Reddit Sentiment Analysis — Python Backend 🐍

Real-time backend for the RedditAlytics dashboard. Uses **APScheduler** to poll Reddit every 1 minute, analyzes posts with **VADER**, and persists results in **SQLite** — all without a single CSV file.

---

## ⚙️ Architecture

```
Reddit API (PRAW)
      ↓  [every 1 min]
   scheduler.py  →  VADER Analysis  →  sqlite3 (reddit.db)
                                              ↓
                                       Flask REST API
                                              ↓
                                    Next.js Frontend (30s refresh)
```

**Two modes:**
- 🟢 **LIVE**: Polls Reddit API using PRAW credentials (set in `.env`)
- 🔄 **SIMULATION**: Generates synthetic posts if no credentials found — dashboard stays active

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Reddit API (optional for Live Mode)
```bash
cp .env.example .env
# Edit .env with your Reddit API credentials
```

> [!NOTE]
> Without credentials the backend runs in Simulation Mode and generates realistic data automatically. No credentials are required to demo the dashboard.

### 3. Start the Server
```bash
python app.py
```
- API: `http://localhost:5000`
- The scheduler starts automatically on boot.

---

## 📡 API Endpoints

### Core
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/posts` | All stored posts (raw) |
| `GET` | `/stats` | Aggregate sentiment stats |
| `GET` | `/api/status` | Live sync health (used by header badge) |

### Dashboard Pages
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/overview` | KPI stats (total, avg score, sentiment counts) |
| `GET` | `/api/sentiment` | Sentiment distribution |
| `GET` | `/api/subreddits` | Breakdown by subreddit |
| `GET` | `/api/trends` | Daily sentiment over time |
| `GET` | `/api/comments` | Paginated post list |
| `POST` | `/api/analyze-text` | Instant text sentiment analysis |

---

## 🧪 Tech Stack
- **Flask** + **Flask-CORS** — REST API
- **APScheduler** — 1-minute background polling
- **PRAW** — Reddit API client
- **VADER** — Sentiment analysis for social media text
- **SQLite** — Lightweight, zero-config persistence
