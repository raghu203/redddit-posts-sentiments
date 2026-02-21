"""
clean.py — DATA CLEANING / PREPROCESSING MODULE
================================================
This module handles the "noise removal" step in the project flow:

    Raw Reddit Data → Data Cleaning → Sentiment Analysis

What this does:
- Removes URLs (http://, www., etc.)
- Converts text to lowercase
- Removes punctuation and special characters
- Removes stopwords (is, the, an, a, ...)
- Removes empty/null comments
- Returns a cleaned pandas DataFrame ready for analysis

In your VIVA, explain this as: "We remove noise from raw Reddit text
so the sentiment model gets clean, meaningful words to analyze."
"""

import re
import string
import pandas as pd


# Common English stopwords (subset — your prof will see you know NLP)
STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that',
    'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'shall', 'may', 'might', 'can', 'a', 'an', 'the',
    'and', 'but', 'or', 'if', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'then', 'than', 'so', 'yet',
    'both', 'nor', 'just', 'because', 'as', 'until', 'while', 'after',
    'before', 'during', 'above', 'below', 'between', 'each', 'more',
}


def remove_urls(text: str) -> str:
    """Remove all URLs from text (http, https, www)."""
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'www\.\S+', '', text)
    return text


def remove_punctuation(text: str) -> str:
    """Remove all punctuation characters."""
    return text.translate(str.maketrans('', '', string.punctuation))


def remove_stopwords(text: str) -> str:
    """Remove common English stopwords from text."""
    words = text.split()
    filtered = [w for w in words if w not in STOPWORDS]
    return ' '.join(filtered)


def clean_text(text: str) -> str:
    """
    Full cleaning pipeline for a single comment string.
    Steps:
      1. Handle missing / non-string values
      2. Remove URLs
      3. Lowercase
      4. Remove punctuation
      5. Remove stopwords
      6. Remove extra whitespace
    """
    if not isinstance(text, str) or text.strip() == '':
        return ''

    text = remove_urls(text)           # Step 1: URLs gone
    text = text.lower()                # Step 2: lowercase
    text = remove_punctuation(text)    # Step 3: no punctuation
    text = remove_stopwords(text)      # Step 4: stopwords removed
    text = re.sub(r'\s+', ' ', text)   # Step 5: collapse spaces
    return text.strip()


def load_and_clean(csv_path: str = 'reddit_data.csv') -> pd.DataFrame:
    """
    Load the raw CSV dataset and clean every comment in it.

    Returns a DataFrame with both the original 'comment' column
    and a new 'cleaned_comment' column.
    """
    print(f"[clean.py] Loading data from: {csv_path}")
    df = pd.read_csv(csv_path)

    print(f"[clean.py] Loaded {len(df)} rows.")

    # Drop rows where comment is empty/null
    original_count = len(df)
    df = df.dropna(subset=['comment'])
    df = df[df['comment'].str.strip() != '']
    print(f"[clean.py] Removed {original_count - len(df)} empty rows. {len(df)} rows remain.")

    # Apply the cleaning pipeline to each comment
    df['cleaned_comment'] = df['comment'].apply(clean_text)

    # Drop rows where cleaning resulted in empty string
    df = df[df['cleaned_comment'] != '']

    print(f"[clean.py] Cleaning complete. {len(df)} valid comments ready for analysis.")
    return df


# ─── STANDALONE TEST ─────────────────────────────────────────────────────────
if __name__ == '__main__':
    # Run: python clean.py
    # This lets you test the cleaner on its own during development
    sample_texts = [
        "This is INCREDIBLE!!! Check out https://openai.com for more info.",
        "The new API pricing changes are absolutely devastating for developers.",
        "I don't know... it's okay I guess. Nothing special.",
        "   ",  # empty
        None,   # null
    ]

    print("\n=== DATA CLEANING DEMO ===\n")
    for t in sample_texts:
        cleaned = clean_text(str(t) if t else '')
        print(f"  ORIGINAL : {t}")
        print(f"  CLEANED  : {cleaned}")
        print()
