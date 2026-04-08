import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'kit-vibe-edu-ai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
