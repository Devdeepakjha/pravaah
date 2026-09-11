import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PRAVAAH - Landslide Intelligence & Early-Warning Platform',
  description: 'AI-Powered Landslide Intelligence and Authority Command Center for Northeast India',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} min-h-full w-full`}>
      <body className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-slate-100 font-sans text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
