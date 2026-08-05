'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/admin/ImageUpload';
import { getSEOSettings, updateSEOSettings } from '@/lib/actions/seo';

export default function SEOAdminPage() {
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [robots, setRobots] = useState('');
  const [googleVerification, setGoogleVerification] = useState('');
  const [schemaJsonLd, setSchemaJsonLd] = useState('');
  const [favicon, setFavicon] = useState('');

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  useEffect(() => {
    startTransition(async () => {
      const seo = await getSEOSettings();
      setMetaTitle(seo.metaTitle);
      setMetaDescription(seo.metaDescription);
      setKeywords(seo.keywords);
      setOgImage(seo.ogImage);
      setCanonicalUrl(seo.canonicalUrl);
      setRobots(seo.robots);
      setGoogleVerification(seo.googleVerification);
      setSchemaJsonLd(seo.schemaJsonLd);
      setFavicon(seo.favicon);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      await updateSEOSettings({
        metaTitle,
        metaDescription,
        keywords,
        ogImage,
        canonicalUrl,
        robots,
        googleVerification,
        schemaJsonLd,
        favicon,
      });
      setMessage('Pengaturan SEO berhasil diperbarui!');
    });
  };

  return (
    <AdminShell>
      <PageHeader
        title="Optimasi SEO"
        description="Kelola metadata global, indexing bot pencari (Google), favicon, verifikasi kepemilikan, dan skema JSON-LD untuk mempermudah perayapan mesin pencari."
      />

      <div className="max-w-3xl rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6 sm:p-8">
        {message && (
          <div className="mb-6 rounded-[var(--radius-lg)] bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Global Meta Title</label>
            <input
              type="text"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Global Meta Description</label>
            <textarea
              required
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Global Keywords (pisahkan dengan koma)</label>
            <input
              type="text"
              required
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">URL OG Image (Social Share Image)</label>
              <ImageUpload
                value={ogImage}
                onChange={setOgImage}
                bucket="images"
                folder="seo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Favicon</label>
              <ImageUpload
                value={favicon}
                onChange={setFavicon}
                bucket="images"
                folder="seo"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Canonical URL</label>
              <input
                type="text"
                required
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://domainanda.com"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Robots Meta Directive</label>
              <input
                type="text"
                required
                value={robots}
                onChange={(e) => setRobots(e.target.value)}
                placeholder="index, follow"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Google Site Verification Code</label>
            <input
              type="text"
              value={googleVerification}
              onChange={(e) => setGoogleVerification(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Skema Tambahan JSON-LD (Script Tag)</label>
            <textarea
              value={schemaJsonLd}
              onChange={(e) => setSchemaJsonLd(e.target.value)}
              rows={5}
              placeholder='{"@context": "https://schema.org", ...}'
              className="w-full font-mono rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-xs focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div className="pt-6 border-t border-[var(--color-paper-3)] flex justify-end">
            <Button type="submit" variant="primary" loading={isPending}>
              Simpan Optimasi SEO
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
