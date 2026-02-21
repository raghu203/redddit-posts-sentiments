'use client';

import { usePathname } from "next/navigation";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/forgot-password', '/contact-sales'].includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <title>RedditAlytics – Reddit Sentiment Dashboard</title>
      </head>
      <body suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar />
        <main style={{
          marginLeft: isAuthPage ? '0' : 'var(--sidebar-width)',
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          transition: 'margin-left 0.3s ease',
        }}>
          {!isAuthPage && <Header />}
          {children}
        </main>
      </body>
    </html>
  );
}

