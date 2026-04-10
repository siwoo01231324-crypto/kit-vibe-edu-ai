import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seeya!',
  description: '교실 모두의 시야를 넓혀주는 AI 파트너',
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
