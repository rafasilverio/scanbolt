import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scancontract - AI-Powered Contract Analysis',
  description: 'Analyze Any Contract in Seconds with AI Precision. Never sign a bad contract again. Our AI scans, detects risks, and suggests fair clauses – no legal expertise required.',
  icons: {
    icon: [
      { url: '/scan-favicon.png', sizes: 'any' }
    ],
    shortcut: '/scan-favicon.png',
    apple: '/scan-favicon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/scan-favicon.png" />
        <link rel="shortcut icon" href="/scan-favicon.png" />
        <link rel="apple-touch-icon" href="/scan-favicon.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}