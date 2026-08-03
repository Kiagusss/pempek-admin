'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import { getOrder, updateOrder } from '@/lib/actions/orders';
import type { Order } from '@/types';
import Button from '@/components/ui/Button';

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const data = await getOrder(id);
      if (data) {
        setOrder(data);
        setName(data.name);
        setWhatsapp(data.whatsapp);
        setNotes(data.notes);
      }
    })();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateOrder(params.id, { name, whatsapp, notes });
      router.push('/admin/pesanan');
    });
  };

  if (!order) return <AdminShell>Memuat...</AdminShell>;

  return (
    <AdminShell>
      <PageHeader title="Edit Pesanan" />
      <form onSubmit={handleSave} className="max-w-xl bg-white p-6 rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Nama</label>
          <input className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">WhatsApp</label>
          <input className="w-full border p-2 rounded" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Catatan</label>
          <textarea className="w-full border p-2 rounded" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <Button type="submit" loading={isPending}>Simpan Perubahan</Button>
      </form>
    </AdminShell>
  );
}