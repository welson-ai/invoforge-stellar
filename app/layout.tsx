import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Invoforge - Tokenized Code Ownership Platform',
  description: 'A modern platform for tokenized code ownership on the Stellar blockchain',
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