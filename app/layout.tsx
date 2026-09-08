import type { Metadata, Viewport } from 'next';
import {
  Playfair_Display,
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
} from 'next/font/google';
import { SITE } from '@/lib/site';
import './globals.css';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * The wordmark.
 *
 * Set in the manner of a royal institution's mark: Roman capitals, light on
 * the page, widely letterspaced, with fine hairline serifs. The weight and
 * the tracking do as much work here as the typeface — the same face set bold
 * and tight reads as a shout rather than as an institution, which is exactly
 * what earlier attempts got wrong.
 *
 * Cormorant Garamond carries the high stroke contrast and the delicate
 * serifs that treatment needs, and its capitals are drawn generously enough
 * to hold a long name across one line.
 */
const wordmark = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal'],
  variable: '--font-wordmark',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  alternates: { canonical: '/' },
  title: 'Nana Oyeadieyie Barima Essoun I, Nkosuo Hene of Adrobaa',
  description:
    'Official site of Nana Oyeadieyie Barima Essoun I, Development Chief of Adrobaa in Tano North, Ahafo. Appearances, development projects and press resources.',
  keywords: [
    'Nana Oyeadieyie Barima Essoun',
    'Nkosuo Hene',
    'Adrobaa',
    'Tano North',
    'Ahafo Region',
    'Ghana traditional leadership',
    'DeoMetals',
  ],
  authors: [{ name: 'The Palace of Adrobaa' }],
  openGraph: {
    type: 'profile',
    locale: 'en_GH',
    url: SITE,
    siteName: 'Nana Oyeadieyie Barima Essoun I',
    title: 'Nana Oyeadieyie Barima Essoun I, Nkosuo Hene of Adrobaa',
    description:
      'Development Chief of Adrobaa, Tano North. Preserving heritage, funding progress.',
    images: [
      {
        url: '/img/hero-poster-v2.jpg',
        width: 1920,
        height: 1080,
        alt: 'Nana Oyeadieyie Barima Essoun I in adinkra regalia beneath the royal umbrella',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nana Oyeadieyie Barima Essoun I, Nkosuo Hene of Adrobaa',
    description:
      'Development Chief of Adrobaa, Tano North. Preserving heritage, funding progress.',
    images: ['/img/hero-poster-v2.jpg'],
  },
  icons: {
    /* Portrait of the chief, cropped to the head and set in the gold ring.
       No SVG is listed: browsers prefer SVG over PNG regardless of size, so
       leaving the old crest here would silently win over the photograph.
       The crest is kept at /crest.svg if it is ever wanted back. */
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GH" className={`${display.variable} ${sans.variable} ${wordmark.variable}`}>
      {/* No <link rel="preload"> for the hero still. The <picture> in Hero
          carries fetchPriority="high" and sits at the top of the document, so
          the preload scanner finds it and resolves <source media> itself.
          Preload links were tried here and fetched BOTH orientations despite
          their media attributes, which is the exact waste they were meant to
          prevent. */}
      <body className="font-sans antialiased bg-ebony text-ivory">
        <a href="#main" className="skip-link inline-flex min-h-[44px] items-center rounded-lg bg-gold px-200 py-100 text-sm font-semibold text-ebony">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
