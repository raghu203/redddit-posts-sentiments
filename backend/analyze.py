"""
analyze.py — SENTIMENT ANALYSIS MODULE (CORE LOGIC 🔥)
=======================================================
This is the HEART of the project, as stated in the spec.

Project Flow position:
    Data Cleaning → Sentiment Analysis → Store Results

What this module does:
1. Takes the cleaned DataFrame from clean.py
2. Applies VADER (Valence Aware Dictionary and sEntiment Reasoner)
   — specifically designed for social media / Reddit-style text
3. Optionally cross-checks with TextBlob for comparison
4. Assigns each comment:
   - A compound sentiment score (-1.0 = most negative, +1.0 = most positive)
   - A sentiment label: Positive / Neutral / Negative
5. Saves the final analyzed data to analyzed_output.csv

VIVA TIP: "We are NOT training a machine learning model.
We are using a pre-trained NLP model (VADER) that understands
the emotional weight of words, slang, capitalization,
and punctuation typical of social media text."

Why VADER over other models?
- Built specifically for social media text (Reddit, Twitter)
- Understands slang, ALL CAPS emphasis, and punctuation like "!!!"
- No training required — works out of the box

Scoring Rules (VADER compound score thresholds):
- compound >= +0.05  → Positive 😊
- compound <= -0.05  → Negative 😠
- anything in between → Neutral 😐
"""

import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from clean import load_and_clean

# ─── CONSTANTS ────────────────────────────────────────────────────────────────
POSITIVE_THRESHOLD = 0.05
NEGATIVE_THRESHOLD = -0.05
OUTPUT_FILE = 'analyzed_output.csv'


def get_vader_sentiment(text: str, analyzer: SentimentIntensityAnalyzer) -> dict:
    """
    Run VADER on a single text string.

    Returns a dict with:
      - neg:      proportion of negative sentiment (0–1)
      - neu:      proportion of neutral sentiment (0–1)
      - pos:      proportion of positive sentiment (0–1)
      - compound: overall score (-1 to +1) — this is the main score we use
    """
    scores = analyzer.polarity_scores(text)
    return scores


def label_sentiment(compound_score: float) -> str:
    """
    Convert a numeric compound score to a human-readable label.

    Positive  >= +0.05
    Negative  <= -0.05
    Neutral   everything in between
    """
    if compound_score >= POSITIVE_THRESHOLD:
        return 'Positive'
    elif compound_score <= NEGATIVE_THRESHOLD:
        return 'Negative'
    else:
        return 'Neutral'


def analyze(csv_path: str = 'reddit_data.csv') -> pd.DataFrame:
    """
    Full Sentiment Analysis pipeline.

    Steps:
      1. Load & clean data (via clean.py)
      2. Initialize VADER analyzer
      3. Score each comment
      4. Assign labels
      5. Save to analyzed_output.csv
      6. Return the enriched DataFrame
    """

    # ── Step 1: Load and clean data ──────────────────────────────────────────
    df = load_and_clean(csv_path)

    # ── Step 2: Initialize VADER ─────────────────────────────────────────────
    print("[analyze.py] Initializing VADER SentimentIntensityAnalyzer...")
    analyzer = SentimentIntensityAnalyzer()

    # ── Step 3: Compute scores ───────────────────────────────────────────────
    print("[analyze.py] Analyzing sentiment for each comment...")

    vader_results = df['cleaned_comment'].apply(
        lambda text: get_vader_sentiment(text, analyzer)
    )

    df['vader_neg']      = vader_results.apply(lambda r: r['neg'])
    df['vader_neu']      = vader_results.apply(lambda r: r['neu'])
    df['vader_pos']      = vader_results.apply(lambda r: r['pos'])
    df['compound_score'] = vader_results.apply(lambda r: round(r['compound'], 4))

    # ── Step 4: Assign sentiment labels ──────────────────────────────────────
    df['sentiment'] = df['compound_score'].apply(label_sentiment)

    # ── Step 5: Save output ──────────────────────────────────────────────────
    output_cols = [
        'post_id', 'subreddit', 'title', 'author', 'comment',
        'cleaned_comment', 'compound_score', 'sentiment',
        'vader_pos', 'vader_neu', 'vader_neg',
        'upvotes', 'created_time'
    ]
    df[output_cols].to_csv(OUTPUT_FILE, index=False)
    print(f"[analyze.py] Results saved to: {OUTPUT_FILE}")

    # ── Step 6: Print summary ─────────────────────────────────────────────────
    total = len(df)
    pos = (df['sentiment'] == 'Positive').sum()
    neu = (df['sentiment'] == 'Neutral').sum()
    neg = (df['sentiment'] == 'Negative').sum()

    print(f"\n{'='*40}")
    print(f"  SENTIMENT ANALYSIS RESULTS")
    print(f"{'='*40}")
    print(f"  Total Comments Analyzed : {total}")
    print(f"  Positive  😊            : {pos}  ({pos/total*100:.1f}%)")
    print(f"  Neutral   😐            : {neu}  ({neu/total*100:.1f}%)")
    print(f"  Negative  😠            : {neg}  ({neg/total*100:.1f}%)")
    print(f"  Avg Compound Score      : {df['compound_score'].mean():.4f}")
    print(f"{'='*40}\n")

    return df


# ─── STANDALONE TEST ─────────────────────────────────────────────────────────
if __name__ == '__main__':
    # Run: python analyze.py
    df = analyze('reddit_data.csv')

    print("SAMPLE OUTPUT (first 5 rows):")
    print(df[['comment', 'sentiment', 'compound_score']].head(5).to_string())

    print("\nSUBREDDIT BREAKDOWN:")
    breakdown = df.groupby(['subreddit', 'sentiment']).size().unstack(fill_value=0)
    print(breakdown.to_string())
