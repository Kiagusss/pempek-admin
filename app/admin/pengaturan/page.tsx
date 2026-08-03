'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import { getSettings, updateSettings } from '@/lib/actions/settings';

export default function SettingsAdminPage() {
  const [logo, setLogo] = useState('');
  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [googleMapsEmbed, setGoogleMapsEmbed] = useState('');
  const [email, setEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [footerText, setFooterText] = useState('');
  const [aboutUs, setAboutUs] = useState('');

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  useEffect(() => {
    startTransition(async () => {
      const s = await getSettings();
      setLogo(s.logo);
      setSiteName(s.siteName);
      setAddress(s.address);
      setWhatsapp(s.whatsapp);
      setInstagram(s.instagram);
      setFacebook(s.facebook);
      setTiktok(s.tiktok);
      setGoogleMapsEmbed(s.googleMapsEmbed);
      setEmail(s.email);
      setOperatingHours(s.operatingHours);
      setFooterText(s.footerText);
      setAboutUs(s.aboutUs);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    startTransition(async () => {
      await updateSettings({
        logo,
        siteName,
        address,
        whatsapp,
        instagram,
        facebook,
        tiktok,
        googleMapsEmbed,
        email,
        operatingHours,
        footerText,
        aboutUs,
      });
      setMessage('Pengaturan berhasil diperbarui!');
    });
  };

  return (
    <AdminShell>
      <PageHeader
        title="Pengaturan Website"
        description="Kelola metadata inti website toko Pempek, kontak WhatsApp, jam operasional, media sosial, dan data peta lokasi."
      />

      <div className="max-w-3xl rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white p-6 sm:p-8">
        {message && (
          <div className="mb-6 rounded-[var(--radius-lg)] bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Nama Website</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Email Kontak</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Logo URL</label>
              <input
                type="text"
                required
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="628123456789"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Jam Operasional</label>
              <input
                type="text"
                required
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Teks Hak Cipta Footer</label>
              <input
                type="text"
                required
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Alamat Kantor / Toko</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Tentang Kami (Profil Halaman Depan)</label>
            <textarea
              required
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              rows={4}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Username Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Username Facebook</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Username TikTok</label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Google Maps Embed URL</label>
            <input
              type="text"
              value={googleMapsEmbed}
              onChange={(e) => setGoogleMapsEmbed(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div className="pt-6 border-t border-[var(--color-paper-3)] flex justify-end">
            <Button type="submit" variant="primary" loading={isPending}>
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
