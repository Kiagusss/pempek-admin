'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/lib/actions/gallery';
import type { GalleryItem } from '@/types';
import ImageUpload from '@/components/admin/ImageUpload';

export default function GalleryAdminPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);

  // Form states
  const [imageUrl, setImageUrl] = useState('/images/hero-pempek.png');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Pempek');

  const loadData = () => {
    startTransition(async () => {
      const list = await getGallery();
      setGallery(list);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setImageUrl('/images/hero-pempek.png');
    setCaption('');
    setCategory('Pempek');
    setIsOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditItem(item);
    setImageUrl(item.images[0] || '/images/hero-pempek.png');
    setCaption(item.caption);
    setCategory(item.category);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { images: [imageUrl], caption, category };

    startTransition(async () => {
      if (editItem) {
        await updateGalleryItem(editItem.id, payload);
      } else {
        await createGalleryItem(payload);
      }
      setIsOpen(false);
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus foto galeri ini?')) {
      startTransition(async () => {
        await deleteGalleryItem(id);
        loadData();
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader
        title="Galeri Foto"
        description="Kelola koleksi foto portofolio, proses produksi, acara, maupun menu toko Pempek Anda."
        action={
          <Button onClick={openAddModal} variant="primary" size="sm">
            + Tambah Foto
          </Button>
        }
      />

      {/* Grid of gallery cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white shadow-sm transition-all duration-[var(--dur-normal)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="relative aspect-[4/3] bg-[var(--color-paper-2)] overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="rounded-[var(--radius-md)] bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-2)]">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4 flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-[var(--color-ink)] line-clamp-2">{item.caption}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(item)}
                  className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                  aria-label="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-1.5 hover:border-red-500 hover:text-red-500 transition-all"
                  aria-label="Hapus"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] flex flex-col p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">
              {editItem ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Kategori Galeri</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                >
                  <option value="Pempek">Pempek</option>
                  <option value="Proses">Proses</option>
                  <option value="Acara">Acara</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Gambar</label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  bucket="images"
                  folder="gallery"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Caption / Keterangan</label>
                <textarea
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
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
