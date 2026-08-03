'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getPackages, createPackage, updatePackage, deletePackage } from '@/lib/actions/packages';
import type { Package } from '@/types';

interface ItemRow {
  id: string;
  name: string;
  quantity: number;
}

function parseItems(raw: Package['items'] | string): ItemRow[] {
  if (Array.isArray(raw)) {
    return raw.map((x, i) => ({ id: String(i), name: String(x.name ?? ''), quantity: Number(x.quantity ?? 0) }));
  }
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x === 'object')
      .map((x, i) => ({ id: String(i), name: String(x.name ?? ''), quantity: Number(x.quantity ?? 0) }));
  } catch {
    return [];
  }
}

export default function PaketAdminPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [badge, setBadge] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const loadData = () => {
    startTransition(async () => {
      const list = await getPackages();
      setPackages(list);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditPkg(null);
    setName('');
    setDescription('');
    setItems([{ id: '0', name: '', quantity: 1 }]);
    setPrice(0);
    setOriginalPrice(undefined);
    setBadge('');
    setIsFeatured(false);
    setIsOpen(true);
  };

  const openEditModal = (p: Package) => {
    setEditPkg(p);
    setName(p.name);
    setDescription(p.description);
    setItems(parseItems(p.items));
    setPrice(p.price);
    setOriginalPrice(p.originalPrice);
    setBadge(p.badge ?? '');
    setIsFeatured(p.isFeatured);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = items
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name.trim(), quantity: i.quantity }));
    const payload = {
      name,
      description,
      items: cleanItems,
      price,
      originalPrice,
      badge: badge || undefined,
      isFeatured,
    };

    startTransition(async () => {
      if (editPkg) {
        await updatePackage(editPkg.id, payload);
      } else {
        await createPackage(payload);
      }
      setIsOpen(false);
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
      startTransition(async () => {
        await deletePackage(id);
        loadData();
      });
    }
  };

  const updateItem = (id: string, patch: Partial<ItemRow>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  return (
    <AdminShell>
      <PageHeader
        title="Paket Hemat"
        description="Kelola paket hemat, promo, dan bundling produk toko Pempek Anda."
        action={
          <Button onClick={openAddModal} variant="primary" size="sm">
            + Tambah Paket
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
              <th className="px-6 py-4">Nama Paket</th>
              <th className="px-6 py-4">Isi</th>
              <th className="px-6 py-4">Harga</th>
              <th className="px-6 py-4">Badge</th>
              <th className="px-6 py-4">Unggulan</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
            {packages.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                <td className="px-6 py-4 font-semibold text-[var(--color-ink)]">{p.name}</td>
                <td className="px-6 py-4 max-w-sm">
                  <p className="truncate">{p.description}</p>
                </td>
                <td className="px-6 py-4 tabular-nums">
                  <span className="font-semibold text-[var(--color-accent)]">
                    Rp {p.price.toLocaleString('id-ID')}
                  </span>
                  {p.originalPrice != null && (
                    <span className="ml-2 text-xs text-[var(--color-ink-3)] line-through">
                      Rp {p.originalPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {p.badge ? <Badge variant="accent">{p.badge}</Badge> : <span className="text-[var(--color-ink-3)]">—</span>}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={p.isFeatured ? 'success' : 'default'}>
                    {p.isFeatured ? 'Ya' : 'Tidak'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                      aria-label="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-red-500 hover:text-red-500 transition-all"
                      aria-label="Hapus"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] flex flex-col p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">
              {editPkg ? 'Edit Paket' : 'Tambah Paket'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Deskripsi</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Isi Paket</label>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nama produk (mis. Pempek Lenjer)"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        className="w-20 rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                      />
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 text-[var(--color-ink-3)] hover:border-red-500 hover:text-red-500 transition-all"
                        aria-label="Hapus item"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setItems((prev) => [...prev, { id: String(Date.now()), name: '', quantity: 1 }])}
                    className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                  >
                    + Tambah item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Harga Coret (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice ?? ''}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="mis. HEMAT"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Unggulan</label>
                  <select
                    value={isFeatured ? 'yes' : 'no'}
                    onChange={(e) => setIsFeatured(e.target.value === 'yes')}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    <option value="no">Tidak</option>
                    <option value="yes">Ya</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-paper-3)] flex justify-end gap-3">
                <Button type="button" onClick={() => setIsOpen(false)} variant="secondary" size="sm">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={isPending}>
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
