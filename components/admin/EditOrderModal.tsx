'use client';

import { useState, useTransition } from 'react';
import { Order } from '@/types';
import { CURRENCY_FORMAT } from '@/constants';

const statusLabels: Record<Order['status'], string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Batal',
};

type Props = {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Order>) => void;
};

export default function EditOrderModal({ order, isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState(order.name);
  const [whatsapp, setWhatsapp] = useState(order.whatsapp);
  const [notes, setNotes] = useState(order.notes);
  const [status, setStatus] = useState<Order['status']>(order.status);
  const [products, setProducts] = useState(order.products.map((p) => ({ ...p })));
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const total = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, quantity } : p)));
  };

  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    startTransition(async () => {
      onSave(order.id, { name, whatsapp, notes, status, products });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--color-paper-3)] bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">
            Edit Pesanan #{order.id.slice(-6).toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[var(--color-paper-2)]"
            aria-label="Tutup"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink-2)] mb-1">
                Nama Pelanggan
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink-2)] mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="628123456789"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink-2)] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink-2)] mb-1">
              Catatan Pesanan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Catatan tambahan dari pelanggan..."
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink-2)] mb-2">
              Daftar Pesanan
            </label>
            {products.length === 0 ? (
              <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-paper-3)] p-4 text-center text-sm text-[var(--color-ink-3)]">
                Tidak ada produk dalam pesanan ini.
              </p>
            ) : (
              <div className="space-y-2">
                {products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-[var(--color-paper-1)] p-3"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-[var(--color-ink)]">{p.productName}</div>
                      <div className="text-xs text-[var(--color-ink-3)]">
                        {CURRENCY_FORMAT.format(p.price)} / item
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, p.quantity - 1)}
                        disabled={p.quantity <= 1}
                        className="h-7 w-7 rounded border border-[var(--color-paper-3)] text-sm hover:bg-[var(--color-paper-2)] disabled:opacity-50"
                        aria-label="Kurangi jumlah"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {p.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, p.quantity + 1)}
                        className="h-7 w-7 rounded border border-[var(--color-paper-3)] text-sm hover:bg-[var(--color-paper-2)]"
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right text-sm font-bold tabular-nums">
                      {CURRENCY_FORMAT.format(p.price * p.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(idx)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      aria-label="Hapus produk"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[var(--color-paper-3)] pt-3">
                  <span className="text-sm font-semibold text-[var(--color-ink-2)]">Total</span>
                  <span className="text-base font-bold text-[var(--color-ink)] tabular-nums">
                    {CURRENCY_FORMAT.format(total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--color-paper-3)] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-paper-2)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}