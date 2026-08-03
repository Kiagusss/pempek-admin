import type { NavLink } from '@/types';

export const SITE_NAME = 'Pempek Palembang';
export const SITE_TAGLINE = 'Pempek Asli Palembang';
export const WHATSAPP_NUMBER = '6281234567890';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo, saya ingin memesan Pempek Palembang.')}`;
export const INSTAGRAM_URL = 'https://instagram.com/pempekpalembang';
export const FACEBOOK_URL = 'https://facebook.com/pempekpalembang';
export const TIKTOK_URL = 'https://tiktok.com/@pempekpalembang';
export const EMAIL = 'info@pempekpalembang.com';
export const ADDRESS = 'Jl. Merdeka No. 123, Palembang, Sumatera Selatan 30129';
export const OPERATING_HOURS = 'Senin - Minggu, 08.00 - 21.00 WIB';
export const GOOGLE_MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.3!2d104.7!3d-2.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTQnMDAuMCJTIDEwNMKwNDInMDAuMCJF!5e0!3m2!1sid!2sid!4v1';

export const NAV_LINKS: NavLink[] = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Menu', href: '#produk' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Artikel', href: '#artikel' },
];

export const CURRENCY_FORMAT = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
