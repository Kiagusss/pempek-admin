import Image from 'next/image';
import { WHATSAPP_LINK } from '@/constants';
import type { Banner } from '@/types';

export default function Hero({ banners }: { banners: Banner[] }) {
  const activeBanner = banners.find((b) => b.status === 'active');
  if (!activeBanner) return null;

  return (
    <section
      id="beranda"
      className="relative overflow-hidden bg-[var(--color-paper)] pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text — left side */}
          <div className="animate-fade-up">
            {/* Trust badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-4 py-1.5 text-sm text-[var(--color-ink-2)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
              Fresh dibuat setiap hari
            </div>

            <h1
              className="text-[length:var(--text-display)] font-extrabold leading-[1.08] tracking-tight"
              style={{ color: 'var(--color-ink)' }}
            >
              {activeBanner.title}
              <br />
              <span className="text-[var(--color-accent)]">{activeBanner.subtitle}</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-2)] max-w-lg sm:text-xl">
              Dibuat fresh setiap hari menggunakan ikan pilihan dengan resep turun-temurun.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <a
                href={activeBanner.buttonLink || WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-accent)] px-7 py-3.5 text-base font-semibold text-white transition-all duration-[var(--dur-normal)] hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
              >
                {activeBanner.buttonText || 'Pesan Sekarang'}
              </a>
              <a
                href="#produk"
                className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white px-7 py-3.5 text-base font-semibold text-[var(--color-ink)] transition-all duration-[var(--dur-normal)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:scale-[0.98]"
              >
                Lihat Menu
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8 border-t border-[var(--color-paper-3)] pt-8">
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">10+</p>
                <p className="text-sm text-[var(--color-ink-3)]">Tahun Pengalaman</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">6</p>
                <p className="text-sm text-[var(--color-ink-3)]">Varian Menu</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">100%</p>
                <p className="text-sm text-[var(--color-ink-3)]">Bahan Alami</p>
              </div>
            </div>
          </div>

          {/* Image — right side */}
          <div className="animate-fade-up delay-2 relative">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-paper-2)]">
              <Image
                src={activeBanner.backgroundImage}
                alt="Pempek asli Palembang — kapal selam, lenjer, dan adaan disajikan dengan cuko dan timun"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative accent card */}
            <div className="absolute -bottom-4 -left-4 rounded-[var(--radius-xl)] bg-white p-4 shadow-[var(--shadow-lg)] sm:-bottom-6 sm:-left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-light)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">Halal & Higienis</p>
                  <p className="text-xs text-[var(--color-ink-3)]">Tersertifikasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
