import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BottomNav from '@/components/layout/bottom-nav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--font-playfair' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: '500', variable: '--font-dm-mono' });

export const metadata: Metadata = {
  title: {
    default: 'Elimu Africa - AI-Powered Learning Platform',
    template: '%s | Elimu Africa',
  },
  description:
    'Learn anything with AI-powered interactive classrooms. Free courses and Pro master classes with multi-agent AI teachers.',
  keywords: ['online learning', 'AI education', 'interactive classrooms', 'courses', 'e-learning', 'Africa'],
  openGraph: {
    title: 'Elimu Africa - AI-Powered Learning Platform',
    description: 'Learn anything with AI-powered interactive classrooms.',
    type: 'website',
    siteName: 'Elimu Africa',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a6b3c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${dmMono.variable} font-sans`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <div className="hidden md:block">
              <Footer />
            </div>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
