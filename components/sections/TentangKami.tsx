import Image from 'next/image';
import Section, { SectionHeader } from '@/components/ui/Section';

export default function TentangKami() {
  return (
    <Section id="tentang">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image — left */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--color-paper-2)]">
            <Image
              src="/images/hero-pempek.png"
              alt="Proses pembuatan pempek asli Palembang"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Accent line */}
          <div
            className="absolute -right-3 top-6 bottom-6 w-1 rounded-[var(--radius-full)] bg-[var(--color-accent)] hidden lg:block"
            aria-hidden="true"
          />
        </div>

        {/* Text — right */}
        <div>
          <SectionHeader
            title="Warisan Rasa dari Palembang"
            subtitle="Lebih dari sekadar makanan — ini adalah warisan kuliner yang kami jaga dengan penuh dedikasi."
          />

          <div className="space-y-5 text-[var(--color-ink-2)] leading-relaxed">
            <p>
              Berawal dari resep keluarga yang diwariskan selama tiga generasi, kami memulai usaha pempek ini dengan satu keyakinan sederhana: bahan terbaik menghasilkan rasa terbaik.
            </p>
            <p>
              Setiap hari, kami memilih ikan tenggiri segar langsung dari pasar ikan Palembang. Tanpa pengawet, tanpa pewarna buatan — hanya bahan alami yang kami percaya akan memberikan cita rasa autentik.
            </p>
            <p>
              Proses pembuatan kami mengikuti cara tradisional: ikan digiling halus, dicampur dengan sagu pilihan, lalu dibentuk dan dimasak dengan teknik yang telah teruji puluhan tahun.
            </p>
          </div>

          {/* Values */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'Resep Turun-Temurun', value: '3 Generasi' },
              { label: 'Bahan Alami', value: '100%' },
              { label: 'Produksi Harian', value: 'Fresh' },
              { label: 'Kepuasan Pelanggan', value: 'Prioritas' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] p-4"
              >
                <p className="text-lg font-bold text-[var(--color-accent)]">
                  {item.value}
                </p>
                <p className="text-sm text-[var(--color-ink-3)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
