import type { Metadata } from 'next';

import { site, siteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  description: site.description,
  metadataBase: siteUrl,
  openGraph: {
    description: site.description,
    images: siteUrl ? [{ url: new URL('/og.png', siteUrl) }] : undefined,
    title: site.title,
    type: 'website',
  },
  title: site.title,
  twitter: {
    card: 'summary_large_image',
    description: site.description,
    images: siteUrl ? [new URL('/og.png', siteUrl)] : undefined,
    title: site.title,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
