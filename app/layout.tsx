import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { SITE_NAME, SITE_URL, DEFAULT_SEO } from '@/lib/seo';
import { CartProvider } from '@/components/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CartToast from '@/components/CartToast';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_SEO.metaTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO.metaDescription,
  keywords: DEFAULT_SEO.keywords.split(',').map((k) => k.trim()),
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  verification: DEFAULT_SEO.googleVerification
    ? { google: DEFAULT_SEO.googleVerification }
    : undefined,
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: DEFAULT_SEO.canonicalUrl,
    siteName: SITE_NAME,
    title: DEFAULT_SEO.metaTitle,
    description: DEFAULT_SEO.metaDescription,
    images: [{ url: DEFAULT_SEO.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SEO.metaTitle,
    description: DEFAULT_SEO.metaDescription,
    images: [DEFAULT_SEO.ogImage],
  },
  robots: {
    index: DEFAULT_SEO.robots.includes('index'),
    follow: DEFAULT_SEO.robots.includes('follow'),
  },
  alternates: {
    canonical: DEFAULT_SEO.canonicalUrl,
  },
  icons: {
    icon: DEFAULT_SEO.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}
