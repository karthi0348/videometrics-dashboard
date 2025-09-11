import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ClientAuthHandler from '../lib/ClientAuthHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VideoMetrics.ai - Dashboard',
  description: 'Advanced video analytics and metrics dashboard',
  keywords: ['video', 'analytics', 'dashboard', 'metrics'],
  authors: [{ name: 'VideoMetrics.ai' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-100">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1976d2" />
      </head>
      <body className={`${inter.className} h-100`}>
        {/* Client side auth handler */}
        <ClientAuthHandler />
        <ToastContainer containerId={'TR'} />
        <ToastContainer containerId={'BC'} />
        <div id="root" className="h-100">
          {children}
        </div>
        {/* Bootstrap JS for interactive components */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
          crossOrigin="anonymous"
          async
        />
      </body>
    </html>
  );
}
