import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteShell } from '@/components/layout/site-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://handymanja.com'),
  title: { default: 'HandyManJa', template: '%s | HandyManJa' },
  description: 'Jamaica\'s on-demand workforce and property services network.',
  openGraph: {
    title: 'HandyManJa',
    description: 'Verified help. Dispatched fast. Managed end-to-end.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
