import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import './globals.css';
import '@/lib/pdfjs-worker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scancontract - AI-Powered Contract Analysis',
  description: 'Analyze and validate contracts with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}