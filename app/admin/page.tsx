'use client';

import { useEffect, useState, useMemo, useTransition } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import StatsCard from '@/components/admin/StatsCard';
import PageHeader from '@/components/admin/PageHeader';
import Badge from '@/components/ui/Badge';
import { getDashboardStats, getOrders } from '@/lib/actions/orders';
import { CURRENCY_FORMAT } from '@/constants';
import type { Order, DashboardStats } from '@/types';
import Link from 'next/link';

type TimeRange = 'today' | 'month' | 'year';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ orderCount: 0, productCount: 0, totalRevenue: 0, visitorCount: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [search, setSearch] = useState('');

  const fetchData = (range: TimeRange) => {
    startTransition(async () => {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        getDashboardStats(range),
        getOrders()
      ]);
      setStats(statsData);
      setRecentOrders(ordersData);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  const filteredRecentOrders = useMemo(() => {
    return recentOrders
      .filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5);
  }, [recentOrders, search]);

  const statusLabels: Record<Order['status'], string> = {
    pending: 'Menunggu',
    processing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Batal',
  };

  return (
    <AdminShell>
      <PageHeader title="Dashboard" description="Ringkasan data toko Anda." />

      <div className="mb-4 flex items-center gap-2">
        {(['today', 'month', 'year'] as TimeRange[]).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
              timeRange === range
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)] border border-[var(--color-paper-3)]'
            }`}
          >
            {range === 'today' ? 'Hari Ini' : range === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          label="Total Produk"
          value={stats.productCount}
          icon={<span>📦</span>}
        />
        <StatsCard
          label={`Pesanan`}
          value={stats.orderCount}
          icon={<span>🛍️</span>}
        />
        <StatsCard
          label={`Pendapatan Selesai`}
          value={CURRENCY_FORMAT.format(stats.totalRevenue)}
          icon={<span>💰</span>}
        />
        <StatsCard
          label="Pengunjung"
          value={stats.visitorCount}
          icon={<span>👁️</span>}
        />
      </div>

      <div className="mt-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Pesanan Terbaru</h2>
             <div className="w-full sm:w-64 mt-2 sm:mt-0">
                <input
                    type="text"
                    placeholder="Cari nama pelanggan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-4 py-2 text-sm focus-visible:outline-[var(--color-focus)]"
                />
            </div>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] font-semibold text-[var(--color-ink)]">
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-paper-3)] text-[var(--color-ink-2)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-ink-3)]">Memuat data...</td>
                </tr>
              ) : filteredRecentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-ink-3)]">Tidak ada pesanan ditemukan.</td>
                </tr>
              ) : (
                filteredRecentOrders.map((order) => {
                  const total = order.products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
                  return (
                    <tr key={order.id} className="hover:bg-[var(--color-paper-2)] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[var(--color-ink)] block">{order.name}</span>
                        <span className="text-xs text-[var(--color-ink-3)]">#{order.id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--color-ink)] tabular-nums">{CURRENCY_FORMAT.format(total)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'default' : 'accent'}>
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/admin/pesanan">
                           <span className="cursor-pointer text-xs font-semibold text-[var(--color-accent)] hover:underline">Detail</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}