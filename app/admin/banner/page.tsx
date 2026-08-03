'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/lib/actions/banners';
import type { Banner } from '@/types';

export default function BannerAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('/images/hero-pempek.png');
  const [status, setStatus] = useState<Banner['status']>('active');

  const loadData = () => {
    startTransition(async () => {
      const list = await getBanners();
      setBanners(list);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditBanner(null);
    setTitle('');
    setSubtitle('');
    setButtonText('');
    setButtonLink('');
    setBackgroundImage('/images/hero-pempek.png');
    setStatus('active');
    setIsOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setButtonText(b.buttonText);
    setButtonLink(b.buttonLink);
    setBackgroundImage(b.backgroundImage);
    setStatus(b.status);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, subtitle, buttonText, buttonLink, backgroundImage, status };

    startTransition(async () => {
      if (editBanner) {
        await updateBanner(editBanner.id, payload);
      } else {
        await createBanner(payload);
      }
      setIsOpen(false);
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus banner ini?')) {
      startTransition(async () => {
        await deleteBanner(id);
        loadData();
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader
        title="Banner Promosi"
        description="Kelola hero banner, gambar latar belakang, judul promosi, serta tombol pendaftaran/pemesanan."
        action={
          <Button onClick={openAddModal} variant="primary" size="sm">
            + Tambah Banner
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
              <th className="px-6 py-4">Judul Banner</th>
              <th className="px-6 py-4">Subtitle</th>
              <th className="px-6 py-4">Tombol</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
            {banners.map((b) => (
              <tr key={b.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={b.backgroundImage} alt="" className="h-8 w-12 object-cover rounded-[var(--radius-md)] bg-[var(--color-paper-2)] shrink-0" />
                    <span className="font-semibold text-[var(--color-ink)] truncate max-w-xs">{b.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 truncate max-w-xs">{b.subtitle}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs border border-[var(--color-paper-3)] px-2 py-1 rounded">
                    {b.buttonText || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={b.status === 'active' ? 'success' : 'default'}>
                    {b.status === 'active' ? 'Aktif' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                      aria-label="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
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
          <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] flex flex-col p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">
              {editBanner ? 'Edit Banner' : 'Tambah Banner'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Judul Banner</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Subtitle</label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Teks Tombol</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Link Tombol</label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">URL Gambar Latar Belakang</label>
                  <input
                    type="text"
                    required
                    value={backgroundImage}
                    onChange={(e) => setBackgroundImage(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Banner['status'])}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                >
                  <option value="active">Aktif</option>
                  <option value="draft">Draft</option>
                </select>
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
