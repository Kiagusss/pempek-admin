'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Gambar',
  bucket = 'images',
  folder = 'uploads',
  maxSizeMB = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File terlalu besar! Maksimal ${maxSizeMB}MB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    setUploading(true);
    try {
      if (!supabase) {
        setError('Supabase belum dikonfigurasi. Cek .env.local');
        return;
      }
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(pub.publicUrl);
    } catch (e: any) {
      setError(e.message || 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt="preview"
            className="h-14 w-20 rounded-[var(--radius-md)] border border-[var(--color-paper-3)] object-cover bg-[var(--color-paper-2)] shrink-0"
          />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all disabled:opacity-50"
        >
          {uploading ? 'Mengupload...' : value ? 'Ganti Gambar' : 'Upload Gambar'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--color-ink-3)]">Maksimal {maxSizeMB}MB. Format: JPG, PNG, WebP.</p>
      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
      {/* Keep URL visible for manual override */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL gambar (opsional — bisa diisi manual)"
        className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-1.5 text-xs focus-visible:outline-[var(--color-focus)]"
      />
    </div>
  );
}
