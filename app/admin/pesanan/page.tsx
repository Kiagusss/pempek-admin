'use client';

import { useEffect, useState, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageHeader from '@/components/admin/PageHeader';
import { getOrders, updateOrder, deleteOrder } from '@/lib/actions/orders';
import type { Order } from '@/types';
import { CURRENCY_FORMAT } from '@/constants';
import EditOrderModal from '@/components/admin/EditOrderModal';

const statusLabels: Record<Order['status'], string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Batal',
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = () => {
    startTransition(async () => {
      const list = await getOrders();
      setOrders(list);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (id: string, newStatus: Order['status']) => {
    startTransition(async () => {
      await updateOrder(id, { status: newStatus });
      loadData();
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini dari arsip?')) {
      startTransition(async () => {
        await deleteOrder(id);
        loadData();
      });
    }
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleModalSave = async (id: string, data: any) => {
    await updateOrder(id, data);
    setEditModalOpen(false);
    loadData();
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.whatsapp.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminShell>
      <PageHeader
        title="Daftar Pesanan"
        description="Pantau pesanan WhatsApp masuk, perbarui status proses pengiriman, dan kelola catatan pelanggan."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama atau WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="processing">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Batal</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
              <th className="px-6 py-4">Pelanggan</th>
              <th className="px-6 py-4">Menu & Jumlah</th>
              <th className="px-6 py-4">Total Harga</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
            {isPending && orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-ink-3)]">
                  Memuat pesanan...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-ink-3)]">
                  Tidak ada pesanan ditemukan.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const total = order.products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
                return (
                  <tr key={order.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-[var(--color-ink)] block">
                          {order.name}
                        </span>
                        {order.whatsapp && (
                          <a
                            href={`https://wa.me/${order.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--color-accent)] hover:underline mt-0.5 block"
                          >
                            +{order.whatsapp}
                          </a>
                        )}
                        <time className="text-xs text-[var(--color-ink-3)] block mt-0.5">
                          #{order.id.slice(-6).toUpperCase()}
                        </time>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="space-y-0.5">
                        {order.products.map((p, idx) => (
                          <li key={idx} className="text-xs">
                            {p.productName} <span className="text-[var(--color-ink-3)]">x{p.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      {order.notes && (
                        <span className="mt-1 block text-xs bg-amber-50 text-amber-800 rounded px-1.5 py-0.5 w-fit">
                          Ket: {order.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--color-ink)] tabular-nums">
                      {CURRENCY_FORMAT.format(total)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-2 py-1 text-xs"
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(order)}
                          className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-2 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 hover:border-red-500 hover:text-red-500 transition-all"
                          aria-label="Hapus"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          isOpen={editModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </AdminShell>
  );
}