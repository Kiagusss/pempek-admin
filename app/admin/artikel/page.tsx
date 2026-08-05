'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getArticles, createArticle, updateArticle, deleteArticle } from '@/lib/actions/articles';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Article } from '@/types';

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('/images/hero-pempek.png');
  const [category, setCategory] = useState('Resep');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Tim Pempek Palembang');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Article['status']>('published');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  const loadData = () => {
    startTransition(async () => {
      const list = await getArticles();
      setArticles(list);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditArticle(null);
    setTitle('');
    setThumbnail('/images/hero-pempek.png');
    setCategory('Resep');
    setContent('');
    setAuthor('Tim Pempek Palembang');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('published');
    setSeoTitle('');
    setSeoDescription('');
    setMetaKeywords('');
    setIsOpen(true);
  };

  const openEditModal = (a: Article) => {
    setEditArticle(a);
    setTitle(a.title);
    setThumbnail(a.thumbnail);
    setCategory(a.category);
    setContent(a.content);
    setAuthor(a.author);
    setDate(a.date);
    setStatus(a.status);
    setSeoTitle(a.seoTitle || '');
    setSeoDescription(a.seoDescription || '');
    setMetaKeywords(a.metaKeywords || '');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      thumbnail,
      category,
      content,
      author,
      date,
      status,
      seoTitle,
      seoDescription,
      metaKeywords,
    };

    startTransition(async () => {
      if (editArticle) {
        await updateArticle(editArticle.id, payload);
      } else {
        await createArticle(payload);
      }
      setIsOpen(false);
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      startTransition(async () => {
        await deleteArticle(id);
        loadData();
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader
        title="Artikel Blog"
        description="Kelola artikel SEO Friendly untuk meningkatkan jangkauan organik website Anda."
        action={
          <Button onClick={openAddModal} variant="primary" size="sm">
            + Tambah Artikel
          </Button>
        }
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
              <th className="px-6 py-4">Judul Artikel</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Penulis</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={article.thumbnail} alt="" className="h-10 w-16 object-cover rounded-[var(--radius-md)] bg-[var(--color-paper-2)] shrink-0" />
                    <span className="font-semibold text-[var(--color-ink)] line-clamp-1">{article.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{article.category}</td>
                <td className="px-6 py-4">{article.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.date}</td>
                <td className="px-6 py-4">
                  <Badge variant={article.status === 'published' ? 'success' : 'default'}>
                    {article.status === 'published' ? 'Terbit' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(article)}
                      className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                      aria-label="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <Link href={`/admin/artikel/${article.slug}/preview`}>
                      <button
                        type="button"
                        className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                        aria-label="Preview SEO"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17l5-5 5 5M7 12h10M12 7v10"/></svg>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl bg-white shadow-[var(--shadow-xl)] flex flex-col animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-paper-3)] px-6">
              <h2 className="text-lg font-bold text-[var(--color-ink)]">
                {editArticle ? 'Edit Artikel' : 'Tambah Artikel'}
              </h2>
              <button onClick={() => setIsOpen(false)} className="rounded-[var(--radius-md)] p-1 hover:bg-[var(--color-paper-2)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Judul Artikel</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    <option value="Sejarah">Sejarah</option>
                    <option value="Tips">Tips</option>
                    <option value="Resep">Resep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Article['status'])}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    <option value="published">Terbitkan</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Penulis</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Gambar Artikel</label>
                <ImageUpload
                  value={thumbnail}
                  onChange={setThumbnail}
                  bucket="images"
                  folder="articles"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Konten</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-paper-3)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--color-ink)]">Optimasi SEO Halaman</h3>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-1.5 text-xs focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1">SEO Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-1.5 text-xs focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-2)] mb-1">Meta Keywords</label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="resep, sejarah, tips"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-1.5 text-xs focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--color-paper-3)] flex justify-end gap-3">
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