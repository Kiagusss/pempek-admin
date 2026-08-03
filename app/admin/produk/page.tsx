'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import type { Product, Category } from '@/types';
import { CURRENCY_FORMAT } from '@/constants';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [priceStrikethrough, setPriceStrikethrough] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [composition, setComposition] = useState('');
  const [stock, setStock] = useState(10);
  const [weight, setWeight] = useState(100);
  const [status, setStatus] = useState<Product['status']>('active');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(1);
  const [thumbnail, setThumbnail] = useState('/images/hero-pempek.png');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // State untuk upload gambar (ganti field thumbnail)
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const loadData = () => {
    startTransition(async () => {
      const prodList = await getProducts();
      const catList = await getCategories();
      setProducts(prodList);
      setCategories(catList);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setName('');
    setPrice(0);
    setPriceStrikethrough(undefined);
    setCategoryId(categories[0]?.id || '');
    setShortDescription('');
    setFullDescription('');
    setComposition('');
    setStock(10);
    setWeight(100);
    setStatus('active');
    setIsBestSeller(false);
    setIsFeatured(false);
    setOrder(1);
    setThumbnail('/images/hero-pempek.png');
    setSeoTitle('');
    setSeoDescription('');
    setMetaKeywords('');
    setIsOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setPrice(p.price);
    setPriceStrikethrough(p.priceStrikethrough);
    setCategoryId(p.categoryId);
    setShortDescription(p.shortDescription);
    setFullDescription(p.fullDescription);
    setComposition(p.composition);
    setStock(p.stock);
    setWeight(p.weight);
    setStatus(p.status);
    setIsBestSeller(p.isBestSeller);
    setIsFeatured(p.isFeatured);
    setOrder(p.order);
    setThumbnail(p.thumbnail);
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setMetaKeywords(p.metaKeywords || '');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price,
      priceStrikethrough,
      categoryId,
      shortDescription,
      fullDescription,
      composition,
      stock,
      weight,
      status,
      isBestSeller,
      isFeatured,
      order,
      thumbnail,
      images: [thumbnail],
      seoTitle,
      seoDescription,
      metaKeywords,
    };

    startTransition(async () => {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setIsOpen(false);
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      startTransition(async () => {
        await deleteProduct(id);
        loadData();
      });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminShell>
      <PageHeader
        title="Manajemen Produk"
        description="Kelola menu produk pempek Anda di sini."
        action={
          <Button onClick={openAddModal} variant="primary" size="sm">
            + Tambah Produk
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Harga</th>
              <th className="px-6 py-4">Stok</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
            {isPending && products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-ink-3)]">
                  Memuat produk...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-ink-3)]">
                  Tidak ada produk ditemukan.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const cat = categories.find((c) => c.id === product.categoryId);
                return (
                  <tr key={product.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-paper-2)]">
                          <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--color-ink)] block">
                            {product.name}
                          </span>
                          <span className="text-xs text-[var(--color-ink-3)]">
                            Urutan: {product.order}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{cat?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium text-[var(--color-ink)] tabular-nums">
                      {CURRENCY_FORMAT.format(product.price)}
                    </td>
                    <td className="px-6 py-4 tabular-nums">{product.stock}</td>
                    <td className="px-6 py-4">
                      <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                        {product.status === 'active' ? 'Aktif' : 'Draft'}
                      </Badge>
                      {product.isBestSeller && <Badge variant="accent" className="ml-1">Best</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                          aria-label="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-red-500 hover:text-red-500 transition-all"
                          aria-label="Hapus"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl bg-white shadow-[var(--shadow-xl)] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-[var(--color-paper-3)] px-6">
              <h2 className="text-lg font-bold text-[var(--color-ink)]">
                {editProduct ? 'Edit Produk' : 'Tambah Produk'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-[var(--radius-md)] p-1 hover:bg-[var(--color-paper-2)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Form Scroll Area */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Harga</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Harga Coret (Diskon)</label>
                  <input
                    type="number"
                    value={priceStrikethrough || ''}
                    onChange={(e) => setPriceStrikethrough(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Product['status'])}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    <option value="active">Aktif</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Stok</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Berat (gr)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Urutan</label>
                  <input
                    type="number"
                    required
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Deskripsi Pendek</label>
                <textarea
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Deskripsi Lengkap</label>
                <textarea
                  required
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Komposisi</label>
                <input
                  type="text"
                  required
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  placeholder="Contoh: Ikan tenggiri, sagu, garam..."
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Gambar Thumbnail</label>
                <input
                  type="text"
                  required
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded border-[var(--color-paper-3)]"
                  />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-[var(--color-paper-3)]"
                  />
                  Featured
                </label>
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
                    placeholder="kunci1, kunci2, kunci3"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-1.5 text-xs focus-visible:outline-[var(--color-focus)]"
                  />
                </div>
              </div>

              {/* Actions Footer */}
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
