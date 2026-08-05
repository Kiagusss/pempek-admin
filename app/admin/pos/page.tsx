'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import AdminShell from '@/components/admin/AdminShell';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { createOrder } from '@/lib/actions/orders';
import { CURRENCY_FORMAT } from '@/constants';
import type { Product, Category } from '@/types';
import QuantityInput from '@/components/QuantityInput';

type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  thumbnail: string;
};

const CATEGORIES_TABS = ['Semua', 'Makanan', 'Minuman', 'Lainnya'];

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods.filter((p) => p.status === 'active'));
        setCategories(cats);
      } catch (e) {
        setMessage({ kind: 'error', text: 'Gagal memuat produk' });
      }
    })();
  }, []);

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const catName = categoryNameById.get(p.categoryId) ?? '';
      const matchesTab =
        activeTab === 'Semua' ||
        (activeTab === 'Makanan' && /pempek|goreng|gorengan|makanan/i.test(catName)) ||
        (activeTab === 'Minuman' && /minuman|drink/i.test(catName)) ||
        (activeTab === 'Lainnya' && catName && !/pempek|gorengan|makanan|minuman|drink/i.test(catName));
      return matchesSearch && matchesTab;
    });
  }, [products, search, activeTab, categoryNameById]);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          productId: p.id,
          productName: p.name,
          price: p.price,
          quantity: 1,
          thumbnail: p.thumbnail,
        },
      ];
    });
  };

  const cartQty = (productId: string) => cart.find((i) => i.productId === productId)?.quantity ?? 0;

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [cart],
  );
  const serviceTax = 0; // pajak layanan — 0% default
  const total = subtotal + serviceTax;

  const handleMakeOrder = () => {
    if (!customer.trim()) {
      setMessage({ kind: 'error', text: 'Nama pelanggan wajib diisi' });
      return;
    }
    if (cart.length === 0) {
      setMessage({ kind: 'error', text: 'Keranjang kosong' });
      return;
    }
    startTransition(async () => {
      try {
        await createOrder({
          name: customer.trim(),
          whatsapp: whatsapp.trim(),
          products: cart.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          })),
          notes: paymentMethod !== 'Tunai' ? `Metode: ${paymentMethod}` : '',
        });
        setMessage({ kind: 'success', text: `Pesanan untuk ${customer} berhasil dibuat` });
        setCart([]);
        setCustomer('');
        setWhatsapp('');
        setPaymentMethod('Tunai');
      } catch (e) {
        setMessage({ kind: 'error', text: 'Gagal membuat pesanan' });
      }
    });
  };

  return (
    <AdminShell>
      <div className="-m-5 sm:-m-8 flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
        {/* Main — Sales Transaction */}
        <section className="relative flex flex-1 flex-col overflow-hidden border-r border-[var(--color-paper-3)] bg-[var(--color-paper-2)]">
          <header className="flex flex-col gap-3 border-b border-[var(--color-paper-3)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h1 className="text-base font-bold text-[var(--color-ink)] sm:text-xl">Sales Transaction</h1>
              <p className="text-xs text-[var(--color-ink-3)]">
                {new Date().toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-3)]"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari menu..."
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] py-2 pl-9 pr-3 text-sm focus-visible:outline-[var(--color-focus)] sm:w-72"
                />
              </div>
            </div>
          </header>

          {/* Tabs */}
          <nav className="flex gap-2 overflow-x-auto border-b border-[var(--color-paper-3)] bg-white px-4 py-3 sm:px-6">
            {CATEGORIES_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  activeTab === tab
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-paper-2)] text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]',
                ].join(' ')}
              >
                {tab === 'Semua' ? 'All Product' : tab === 'Makanan' ? 'Foods' : tab === 'Minuman' ? 'Beverage' : 'Other'}
              </button>
            ))}
          </nav>

          {/* Grid produk */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 sm:p-6 sm:pb-6">
            {filteredProducts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-[var(--color-ink-3)]">
                <p className="text-sm">Tidak ada produk di kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-sm"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-paper-2)]">
                      <Image
                        src={p.thumbnail || '/images/hero-pempek.png'}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      {p.priceStrikethrough && p.priceStrikethrough > p.price && (
                        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {Math.round(((p.priceStrikethrough - p.price) / p.priceStrikethrough) * 100)}% Off
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <h3 className="line-clamp-2 text-xs font-semibold text-[var(--color-ink)]">{p.name}</h3>
                      <div className="mt-auto flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[var(--color-ink)]">
                          {CURRENCY_FORMAT.format(p.price)}
                        </span>
                        {p.priceStrikethrough && p.priceStrikethrough > p.price && (
                          <span className="text-[10px] text-[var(--color-ink-3)] line-through">
                            {CURRENCY_FORMAT.format(p.priceStrikethrough)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-ink-3)]">Stok: {p.stock}</p>
                      <QuantityInput
                        quantity={cartQty(p.id)}
                        onAdd={() => addToCart(p)}
                        onIncrement={() => updateQty(p.id, 1)}
                        onDecrement={() => updateQty(p.id, -1)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile bottom cart bar */}
          <div className="sticky bottom-0 left-0 right-0 border-t border-[var(--color-paper-3)] bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setShowCart(true)}
              className="flex w-full items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-white"
            >
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cart.length} item
              </span>
              <span>{CURRENCY_FORMAT.format(total)}</span>
            </button>
          </div>
        </section>

        {/* Order Panel — kanan (desktop) / slide-up (mobile) */}
        <>
          {/* Desktop panel */}
          <aside className="hidden w-[360px] flex-col overflow-hidden bg-white xl:w-[400px] lg:flex">
            <header className="border-b border-[var(--color-paper-3)] px-5 py-4">
              <h2 className="text-base font-bold text-[var(--color-ink)]">Detail Order</h2>
              <p className="mt-0.5 text-xs text-[var(--color-ink-3)]">
                {cart.length} item dalam keranjang
              </p>
            </header>

            {/* Customer info */}
            <div className="space-y-3 border-b border-[var(--color-paper-3)] px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--color-ink-2)]">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Contoh: Hanin Dhiya"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--color-ink-2)]">
                  WhatsApp <span className="text-[var(--color-ink-3)]">(opsional)</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--color-ink-2)]">
                  Catatan Pesanan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan (opsional)"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-3 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-[var(--color-ink-3)]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="mb-2 opacity-50"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p className="text-xs">Belum ada item dipilih</p>
                  <p className="text-[10px]">Klik produk untuk menambah</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-paper-2)]">
                        <Image
                          src={item.thumbnail || '/images/hero-pempek.png'}
                          alt={item.productName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-xs font-semibold text-[var(--color-ink)]">
                          {item.productName}
                        </h4>
                        <p className="text-[11px] text-[var(--color-ink-3)]">
                          {CURRENCY_FORMAT.format(item.price)}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(item.productId, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-[var(--color-paper-3)] text-xs font-bold text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]"
                            aria-label="Kurangi"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.productId, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-[var(--color-paper-3)] text-xs font-bold text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]"
                            aria-label="Tambah"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-[var(--color-ink-3)] hover:text-red-500"
                          aria-label="Hapus"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          </svg>
                        </button>
                        <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
                          {CURRENCY_FORMAT.format(item.price * item.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-[var(--color-paper-3)] px-5 py-4">
              <dl className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-ink-3)]">Subtotal</dt>
                  <dd className="font-semibold text-[var(--color-ink-2)] tabular-nums">
                    {CURRENCY_FORMAT.format(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-ink-3)]">Pajak Layanan</dt>
                  <dd className="font-semibold text-[var(--color-ink-2)] tabular-nums">
                    {CURRENCY_FORMAT.format(serviceTax)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-[var(--color-paper-3)] pt-1.5">
                  <dt className="text-sm font-bold text-[var(--color-ink)]">Total Pembayaran</dt>
                  <dd className="text-base font-bold text-[var(--color-ink)] tabular-nums">
                    {CURRENCY_FORMAT.format(total)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-[var(--color-ink-2)]">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                >
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="WhatsApp">Pesanan via WhatsApp</option>
                </select>
              </div>

              {message && (
                <div
                  className={[
                    'mt-3 rounded-[var(--radius-md)] px-3 py-2 text-xs',
                    message.kind === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700',
                  ].join(' ')}
                >
                  {message.text}
                </div>
              )}

              <button
                onClick={handleMakeOrder}
                disabled={isPending || cart.length === 0}
                className="mt-4 w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Memproses...' : 'Make Order'}
              </button>
            </div>
          </aside>

          {/* Mobile slide-up cart overlay */}
          {showCart && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
              <div className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--color-paper-3)] px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-ink)]">Detail Order</h2>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      {cart.length} item dalam keranjang
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCart(false)}
                    className="rounded-md p-1 hover:bg-[var(--color-paper-2)]"
                    aria-label="Tutup"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {/* Customer info */}
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      placeholder="Nama Pelanggan"
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2.5 text-sm focus-visible:outline-[var(--color-focus)]"
                    />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="WhatsApp (opsional)"
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2.5 text-sm focus-visible:outline-[var(--color-focus)]"
                    />
                  </div>

                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--color-ink-3)]">
                      <p className="text-sm">Belum ada item dipilih</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {cart.map((item) => (
                        <li
                          key={item.productId}
                          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-3"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-paper-2)]">
                            <Image
                              src={item.thumbnail || '/images/hero-pempek.png'}
                              alt={item.productName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-sm font-semibold text-[var(--color-ink)]">
                              {item.productName}
                            </h4>
                            <p className="text-xs text-[var(--color-ink-3)]">
                              {CURRENCY_FORMAT.format(item.price)}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => updateQty(item.productId, -1)}
                                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--color-paper-3)] text-sm font-bold hover:bg-[var(--color-paper-2)]"
                                aria-label="Kurangi"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(item.productId, 1)}
                                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--color-paper-3)] text-sm font-bold hover:bg-[var(--color-paper-2)]"
                                aria-label="Tambah"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="ml-auto text-[var(--color-ink-3)] hover:text-red-500"
                                aria-label="Hapus"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                              {CURRENCY_FORMAT.format(item.price * item.quantity)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Summary & checkout */}
                <div className="border-t border-[var(--color-paper-3)] px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[var(--color-ink-2)]">Total</span>
                    <span className="text-lg font-bold text-[var(--color-ink)] tabular-nums">
                      {CURRENCY_FORMAT.format(total)}
                    </span>
                  </div>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-3 w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2.5 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="WhatsApp">Pesanan via WhatsApp</option>
                  </select>

                  {message && (
                    <div
                      className={[
                        'mb-3 rounded-[var(--radius-md)] px-3 py-2 text-xs',
                        message.kind === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700',
                      ].join(' ')}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    onClick={handleMakeOrder}
                    disabled={isPending || cart.length === 0}
                    className="w-full rounded-[var(--radius-md)] bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Memproses...' : 'Make Order'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
    </AdminShell>
  );
}