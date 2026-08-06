// Helper SEO bersama — dipakai generateMetadata di server component & halaman admin.
// ponytail: values = hardcoded fallback sampai SEOSettings dikelola dari Supabase (ada di lib/actions/seo.ts);
//           upgrade: jadikan async + baca tabel `seo` saat data dari Supabase sudah dibutuhkan dinamis.
export const SITE_NAME = 'Pempek Palembang';
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://pempek-depok.vercel.app'
).replace(/\/$/, '');

export const DEFAULT_SEO = {
  metaTitle: 'Pempek Palembang — Pempek Asli Palembang, Lezat & Fresh Setiap Hari',
  metaDescription:
    'Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan dengan resep turun-temurun 3 generasi. Tanpa pengawet, pengiriman cepat ke seluruh Indonesia. Pesan via WhatsApp!',
  keywords:
    'pempek palembang, pempek asli palembang, pempek kapal selam, pempek lenjer, pempek adaan, pempek frozen, makanan khas palembang, oleh oleh palembang, pempek online, jual pempek',
  ogImage: `${SITE_URL}/images/hero-pempek.png`,
  canonicalUrl: SITE_URL,
  robots: 'index, follow',
  googleVerification: '',
  favicon: '/favicon.ico',
  schemaJsonLd: {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: 'Pempek Palembang',
    description:
      'Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan dengan resep turun-temurun.',
    image: `${SITE_URL}/images/hero-pempek.png`,
    servesCuisine: 'Pempek, Makanan Khas Palembang',
    priceRange: 'Rp 5.000 - Rp 100.000',
    telephone: '+6285711165969',
    email: 'info@pempekpalembang.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Merdeka No. 123',
      addressLocality: 'Palembang',
      addressRegion: 'Sumatera Selatan',
      postalCode: '30129',
      addressCountry: 'ID',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '08:00',
      closes: '21:00',
    },
    sameAs: [
      'https://instagram.com/pempekpalembang',
      'https://facebook.com/pempekpalembang',
      'https://tiktok.com/@pempekpalembang',
    ],
  },
};

export type SEOValues = typeof DEFAULT_SEO;
