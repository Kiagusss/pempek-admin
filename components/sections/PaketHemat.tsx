import Section, { SectionHeader } from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import { CURRENCY_FORMAT, WHATSAPP_NUMBER } from '@/constants';
import type { Package } from '@/types';

export default function PaketHemat({ packages }: { packages: Package[] }) {
  const featured = packages.filter((p) => p.isFeatured);
  return (
    <Section>
      <SectionHeader
        title="Paket Hemat"
        subtitle="Pilih paket yang sesuai kebutuhan Anda — lebih hemat dan lebih praktis."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg, index) => {
          const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Halo, saya ingin memesan ${pkg.name} (${CURRENCY_FORMAT.format(pkg.price)})`
          )}`;
          const isFeatured = index === 0;
          const rawItems: unknown = typeof pkg.items === 'string' ? JSON.parse(pkg.items) : pkg.items;
          const items: { name: string; quantity: number }[] = Array.isArray(rawItems) ? rawItems : [];

          return (
            <div
              key={pkg.id}
              className={[
                'relative flex flex-col rounded-[var(--radius-xl)] border p-6 transition-all',
                `duration-[var(--dur-slow)]`,
                'hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5',
                isFeatured
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                  : 'border-[var(--color-paper-3)] bg-white',
              ].join(' ')}
            >
              {pkg.badge && (
                <div className="absolute -top-3 left-5">
                  <Badge variant={isFeatured ? 'accent' : 'default'}>
                    {pkg.badge}
                  </Badge>
                </div>
              )}

              <h3 className="text-xl font-bold text-[var(--color-ink)]">
                {pkg.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-ink-2)] leading-relaxed">
                {pkg.description}
              </p>

              {/* Items list */}
              <ul className="mt-5 space-y-2 flex-1">
                {items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center gap-2 text-sm text-[var(--color-ink-2)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item.quantity}x {item.name}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--color-ink)]">
                  {CURRENCY_FORMAT.format(pkg.price)}
                </span>
                {pkg.originalPrice && (
                  <span className="text-sm text-[var(--color-ink-3)] line-through">
                    {CURRENCY_FORMAT.format(pkg.originalPrice)}
                  </span>
                )}
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  'mt-5 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] py-3 text-sm font-semibold transition-all',
                  `duration-[var(--dur-normal)]`,
                  'active:scale-[0.98]',
                  isFeatured
                    ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                    : 'border border-[var(--color-paper-3)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                ].join(' ')}
              >
                Pesan Paket
              </a>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
