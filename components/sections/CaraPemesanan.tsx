import Section, { SectionHeader } from '@/components/ui/Section';

const orderSteps = [
  {
    step: 1,
    title: 'Pilih Menu',
    description: 'Pilih pempek dan paket favorit Anda dari daftar menu kami.',
  },
  {
    step: 2,
    title: 'Hubungi WhatsApp',
    description: 'Kirim pesanan Anda melalui WhatsApp dengan format yang mudah.',
  },
  {
    step: 3,
    title: 'Pembayaran',
    description: 'Lakukan pembayaran via transfer bank atau e-wallet.',
  },
  {
    step: 4,
    title: 'Pengiriman',
    description: 'Pesanan diproses dan dikirim langsung ke alamat Anda.',
  },
];

const stepIcons = [
  // 1. Pilih Menu
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>,
  // 2. WhatsApp
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>,
  // 3. Pembayaran
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>,
  // 4. Pengiriman
  <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>,
];

export default function CaraPemesanan() {
  return (
    <Section background="gray">
      <SectionHeader
        title="Cara Pemesanan"
        subtitle="Pesan pempek favorit Anda dalam 4 langkah mudah."
        className="text-center mx-auto"
      />

      <div className="mx-auto max-w-3xl">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-px bg-[var(--color-paper-3)] sm:left-8"
            aria-hidden="true"
          />

          <div className="space-y-8">
            {orderSteps.map((step, index) => (
              <div key={step.step} className="relative flex gap-5 sm:gap-6">
                {/* Step number circle */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)] sm:h-16 sm:w-16">
                  {stepIcons[index]}
                </div>

                {/* Content */}
                <div className="flex-1 rounded-[var(--radius-xl)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--color-accent)] tabular-nums">
                      LANGKAH {step.step}
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--color-ink-2)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
