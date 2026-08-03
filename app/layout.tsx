import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Pempek Palembang — Pempek Asli Palembang, Lezat & Fresh Setiap Hari',
    template: '%s | Pempek Palembang',
  },
  description:
    'Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan dengan resep turun-temurun. Pesan sekarang via WhatsApp — pengiriman cepat ke seluruh Indonesia.',
  keywords: [
    'pempek palembang',
    'pempek asli',
    'pempek kapal selam',
    'pempek frozen',
    'makanan khas palembang',
    'pempek online',
  ],
  authors: [{ name: 'Pempek Palembang' }],
  creator: 'Pempek Palembang',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://pempekpalembang.com',
    siteName: 'Pempek Palembang',
    title: 'Pempek Palembang — Pempek Asli Palembang, Lezat & Fresh Setiap Hari',
    description:
      'Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan. Pesan via WhatsApp.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pempek Palembang — Pempek Asli Palembang',
    description:
      'Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://pempekpalembang.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
