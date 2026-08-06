import type { Metadata } from 'next';
import AdminChat from '@/components/admin/AdminChat';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard — Pempek CMS',
    template: '%s — Pempek CMS',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AdminChat />
    </>
  );
}
