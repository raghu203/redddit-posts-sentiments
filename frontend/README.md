# Reddit Alytics — Personal Sentiment Dashboard 📊

This is the frontend application for the Reddit Sentiment Analysis project. Built with **Next.js 14**, it provides a modern, interactive dashboard to visualize public opinion trends across various subreddits.

## ✨ Features

*   **Live Overview**: Instant KPIs including total volume and average sentiment scores.
*   **Sentiment Deep Dive**: Distribution charts (Pie/Bar) for positive, neutral, and negative comments.
*   **Emotion Radar**: Keyword-based emotional tone analysis (Joy, Anger, Fear, etc.).
*   **Segment Analyzer**: Real-time analysis of custom pasted text blocks.
*   **Comment Explorer**: A searchable, sortable database of individual Reddit comments.
*   **Trend Tracking**: Historical sentiment graphs to track brand/topic perception over time.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Endpoint
The frontend expects the backend to be running at `http://localhost:5000`. You can find the API configuration in:
*   `app/overview/page.tsx`
*   `app/sentiment/page.tsx`
*   (and other page files)

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 📂 Project Structure

*   `/app`: Contains all dashboard pages (Overview, Sentiment, Emotion, etc.).
*   `/components`: Reusable UI components (Sidebar, Charts, Stat Cards).
*   `/public`: Static assets and icons.
*   `tailwind.config.ts`: Visual styling and theme configuration.

---

## 🛠 Tech Stack

*   **Next.js 14**: React framework for the modern web.
*   **TypeScript**: Static typing for robust code.
*   **Tailwind CSS**: Utility-first styling for a premium look.
*   **Recharts**: Composable charting library for data visualization.
*   **Lucide React**: Beautifully simple icons.
