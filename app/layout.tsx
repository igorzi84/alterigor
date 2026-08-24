import type { Metadata } from 'next';

import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  description: site.description,
  title: site.title,
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
