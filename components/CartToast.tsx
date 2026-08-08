'use client';

import { useCart } from '@/components/CartContext';

// Notifikasi kecil "masuk keranjang" — muncul di tengah bawah layar,
// hilang otomatis setelah 2.5 detik.
export default function CartToast() {
  const { toast, openCart } = useCart();

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4">
      <button
        onClick={openCart}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)] transition-transform active:scale-[0.97]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {toast}
        <span className="ml-1 text-white/60">· Lihat keranjang</span>
      </button>
    </div>
  );
}
