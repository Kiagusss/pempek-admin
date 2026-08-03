'use client';

import { useState, useRef } from 'react';
import { createProduct } from '@/lib/actions/products';
import Button from '@/components/ui/Button';

interface ProductFormProps {
  categories: { id: string; name: string }[];
  onSave: () => void;
  onCancel: () => void;
}

export function ProductForm({ categories, onSave, onCancel }: ProductFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    priceStrikethrough: undefined as number | undefined,
    categoryId: categories[0]?.id || '',
    shortDescription: '',
    fullDescription: '',
    composition: '',
    stock: 10,
    weight: 100,
    status: 'active' as const,
    isBestSeller: false,
    isFeatured: false,
    order: 1,
    thumbnail: '/images/hero-pempek.png',
    images: [] as string[],
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper untuk mengupload ke Supabase Storage dan kembalikan URL publik
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupload gambar');
    }
    const { url } = await response.json();
    return url;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);
      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setImages((prev) => [...prev, ...filesArray]);
      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      // Upload semua file yang dipilih ke storage
      const uploadedUrls: string[] = [];
      for (const file of images) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      // Gabungkan dengan existing images
      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        ...formData,
        images: allImages,
      };

      await createProduct(payload);
      onSave();
    } catch (error) {
      console.error('Gagal menyimpan produk:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Nama Produk</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Harga</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Harga Coret (Diskon)</label>
          <input
            type="number"
            value={formData.priceStrikethrough || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, priceStrikethrough: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Kategori</label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
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
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Deskripsi Pendek</label>
        <textarea
          required
          value={formData.shortDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
          rows={2}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Deskripsi Lengkap</label>
        <textarea
          required
          value={formData.fullDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullDescription: e.target.value }))}
          rows={4}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Komposisi</label>
        <input
          type="text"
          required
          value={formData.composition}
          onChange={(e) => setFormData((prev) => ({ ...prev, composition: e.target.value }))}
          placeholder="Contoh: Ikan tenggiri, sagu, garam..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
        />
      </div>

      {/* Upload Gambar Drag-and-Drop */}
      <div>
        <label className="block text-sm font-semibold text-[var(--color-ink)] mb-2">Gambar Produk</label>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[var(--color-paper-3)] rounded-[var(--radius-md)] p-6 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-3)]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-sm text-[var(--color-ink-2)]">
              <span className="font-semibold text-[var(--color-accent)]">Klik untuk upload</span> atau seret & lepaskan
            </p>
            <p className="text-xs text-[var(--color-ink-3)]">PNG, JPG, WEBP (maksimal 5MB per file)</p>
          </div>
        </div>

        {/* Preview Gambar yang Sudah Diupload */}
        {(imagePreviews.length > 0 || existingImages.length > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img src={img} alt={`Gambar ${index + 1}`} className="w-full h-24 object-cover rounded-[var(--radius-md)]" />
                <button
                  type="button"
                  onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                <span className="text-xs block mt-1 text-center text-[var(--color-ink-2)]">Existing</span>
              </div>
            ))}
            {imagePreviews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative group">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-[var(--radius-md)]" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                <span className="text-xs block mt-1 text-center text-[var(--color-ink-2)]">New</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-6 border-t border-[var(--color-paper-3)]">
        <Button type="button" onClick={onCancel} variant="secondary" size="sm">
          Batal
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          Simpan Produk
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;