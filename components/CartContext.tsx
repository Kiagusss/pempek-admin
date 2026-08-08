'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface CartItemInput {
  id: string;
  name: string;
  price: number;
  thumbnail?: string;
  stock?: number;
}

export interface CartItem extends CartItemInput {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItemInput, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  toast: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'pempek_cart_v2';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load dari localStorage saat mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage tidak tersedia / corrupt → mulai kosong
    }
    setHydrated(true);
  }, []);

  // Simpan ke localStorage setiap perubahan (setelah hydrated)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota exceeded / private mode → abaikan
    }
  }, [items, hydrated]);

  // Tampilkan toast lalu sembunyikan otomatis
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // Dengarkan event add-to-cart dari tombol "Pesan" / "Pesan Paket"
  // (event bus lintas boundary RSC — context tidak menembus server-rendered children).
  useEffect(() => {
    const onAdd = (e: Event) => {
      const item = (e as CustomEvent<CartItemInput>).detail;
      if (item) {
        setItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) =>
              i.id === item.id
                ? { ...i, quantity: Math.min(i.quantity + 1, item.stock || 99) }
                : i,
            );
          }
          return [...prev, { ...item, quantity: 1 }];
        });
        showToast(`✓ ${item.name} masuk keranjang`);
      }
    };
    window.addEventListener('pempek:add-to-cart', onAdd);
    return () => window.removeEventListener('pempek:add-to-cart', onAdd);
  }, [showToast]);

  const addItem = useCallback(
    (item: CartItemInput, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, item.stock || 99) }
              : i,
          );
        }
        return [...prev, { ...item, quantity: Math.min(quantity, item.stock || 99) }];
      });
      showToast(`✓ ${item.name} masuk keranjang`);
    },
    [showToast],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, isOpen, openCart, closeCart, addItem, removeItem, setQuantity, clearCart, total, count, toast }),
    [items, isOpen, openCart, closeCart, addItem, removeItem, setQuantity, clearCart, total, count, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}
