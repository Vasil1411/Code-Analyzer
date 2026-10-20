import type { Metadata } from 'next';
import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'SaaS Code Analyzer',
  description: 'Static analysis platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" />
      </head>
      <body>
        <div className="app">
          <Sidebar />
          <Topbar />
          <main className="app__main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}