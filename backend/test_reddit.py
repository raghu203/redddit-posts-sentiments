import praw
import os
from dotenv import load_dotenv

# 1. Load your .env file
load_dotenv()

client_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")
user_agent = os.getenv("REDDIT_USER_AGENT", "testscript")

print("--- Reddit API Test ---")
print(f"Client ID present: {bool(client_id)}")
print(f"Client Secret present: {bool(client_secret)}")
print(f"User Agent: {user_agent}")
print("Connecting...")

try:
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent
    )
    reddit.read_only = True

    print("\nFetching top 5 posts from r/technology:")
    for post in reddit.subreddit("technology").hot(limit=5):
        print(f"✅ FOUND: {post.title[:60]}...")
    
    print("\n🎉 SUCCESS! Your Reddit credentials are working.")
    print("If you see titles above, the problem is not in your API keys.")

except Exception as e:
    print(f"\n❌ FAILED! Error: {e}")
    print("\nCheck your .env file and ensure values are correct.")
