import Section, { SectionHeader } from '@/components/ui/Section';
import Accordion from '@/components/ui/Accordion';
import type { FAQItem } from '@/types';

export default function FAQ({ faqItems }: { faqItems: FAQItem[] }) {
  const activeItems = faqItems
    .filter((item) => item.status === 'active')
    .sort((a, b) => a.order - b.order);

  return (
    <Section id="faq" background="gray">
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          title="Pertanyaan Umum"
          subtitle="Temukan jawaban untuk pertanyaan yang sering diajukan."
          className="text-center mx-auto"
        />

        <Accordion
          items={activeItems.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))}
          className="rounded-[var(--radius-xl)] bg-white p-2 sm:p-4"
        />
      </div>
    </Section>
  );
}
