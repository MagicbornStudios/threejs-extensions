import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'R3F Phase One Playground',
  description: 'A fallback-friendly Next.js + R3F scene with upload support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
