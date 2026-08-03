'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/lib/actions/faq';
import type { FAQItem } from '@/types';

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [editFaq, setEditFaq] = useState<FAQItem | null>(null);

  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState(1);
  const [status, setStatus] = useState<FAQItem['status']>('active');

  const loadData = () => {
    startTransition(async () => {
      const list = await getFAQs();
      setFaqs(list);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditFaq(null);
    setQuestion('');
    setAnswer('');
    setOrder(1);
    setStatus('active');
    setIsOpen(true);
  };

  const openEditModal = (f: FAQItem) => {
    setEditFaq(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setOrder(f.order);
    setStatus(f.status);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { question, answer, order, status };

    startTransition(async () => {
      if (editFaq) {
        await updateFAQ(editFaq.id, payload);
      } else {
        await createFAQ(payload);
      }
      setIsOpen(false);
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) {
      startTransition(async () => {
        await deleteFAQ(id);
        loadData();
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader
        title="FAQ (Pertanyaan Umum)"
        description="Kelola pertanyaan dan jawaban yang tampil pada halaman depan website toko Pempek Anda."
        action={
          <Button onClick={openAddModal} variant="primary" size="sm">
            + Tambah FAQ
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
              <th className="px-6 py-4">Pertanyaan</th>
              <th className="px-6 py-4">Jawaban</th>
              <th className="px-6 py-4">Urutan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
            {faqs.map((faq) => (
              <tr key={faq.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                <td className="px-6 py-4 font-semibold text-[var(--color-ink)] max-w-xs truncate">{faq.question}</td>
                <td className="px-6 py-4 max-w-sm truncate">{faq.answer}</td>
                <td className="px-6 py-4 tabular-nums">{faq.order}</td>
                <td className="px-6 py-4">
                  <Badge variant={faq.status === 'active' ? 'success' : 'default'}>
                    {faq.status === 'active' ? 'Aktif' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(faq)}
                      className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                      aria-label="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-red-500 hover:text-red-500 transition-all"
                      aria-label="Hapus"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] flex flex-col p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4">
              {editFaq ? 'Edit FAQ' : 'Tambah FAQ'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Pertanyaan</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Jawaban</label>
                <textarea
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-ink)] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FAQItem['status'])}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                  >
                    <option value="active">Aktif</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-paper-3)] flex justify-end gap-3">
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
