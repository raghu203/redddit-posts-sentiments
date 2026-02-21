# Reddit Sentiment Analysis — Python Backend 🐍

This is the backend server for the Reddit Alytics dashboard. It handles data cleaning, sentiment analysis using VADER, and serves the results via a Flask REST API.

## 🛠 Project Workflow

The backend operates in three distinct stages:

1.  **Data Extraction & Cleaning (`clean.py`)**:
    *   Takes raw Reddit data (CSV).
    *   Removes URLs, special characters, and "noise" from the text.
    *   Standardizes text for the NLP model.
2.  **Sentiment Processing (`analyze.py`)**:
    *   Applies the **VADER** model to the cleaned text.
    *   Generates `compound`, `pos`, `neu`, and `neg` scores.
    *   Categorizes comments into Positive, Neutral, or Negative labels.
    *   Saves the results to `analyzed_output.csv`.
3.  **API Delivery (`app.py`)**:
    *   Initializes a Flask server.
    *   Provides endpoints for the dashboard to fetch KPIs, trends, and specific comment data.
    *   Includes a **Live Text Analyzer** endpoint for real-time custom analysis.

---

## 🚀 How to Run

### 1. Install Dependencies
Ensure you have Python 3.8+ installed.
```bash
pip install -r requirements.txt
```

### 2. Process Data (One-time or when CSV changes)
Run the analysis pipeline to generate the `analyzed_output.csv` used by the dashboard:
```bash
python analyze.py
```

### 3. Start the Server
Run the Flask API:
```bash
python app.py
```
*   **Base URL**: `http://localhost:5000`

---

## 📡 API Endpoints

### Data Discovery
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/overview` | High-level KPI statistics (Total count, Avg score). |
| `GET` | `/api/sentiment` | Full distribution data for pie and bar charts. |
| `GET` | `/api/subreddits` | Sentiment breakdown grouped by subreddit. |
| `GET` | `/api/trends` | Sentiment scores grouped by date for time-series charts. |
| `GET` | `/api/comments` | Paginated and searchable list of all comments. |

### Real-time Analysis
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze-text` | Analyzes a block of text split by newlines into segments. |
| `POST` | `/api/analyze-url` | Fetches and analyzes live Reddit thread data (requires PRAW). |

---

## 🧪 Technology Stack
*   **Flask**: REST API framework.
*   **Pandas**: Data manipulation and CSV processing.
*   **VADER (NLTK)**: Rule-based sentiment analysis optimized for social media.
*   **Flash-CORS**: Handles Cross-Origin Resource Sharing for the Next.js frontend.
