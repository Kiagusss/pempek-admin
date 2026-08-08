'use client';

import type { ReactNode } from 'react';
import { CartProvider } from '@/components/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CartToast from '@/components/CartToast';

// Wrapper client untuk halaman: memastikan Navbar & Produk berada dalam
// satu client tree dengan CartProvider (context lintas RSC boundary tidak
// menembus di Next.js App Router).
export default function HomeClient({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartToast />
    </CartProvider>
  );
}
