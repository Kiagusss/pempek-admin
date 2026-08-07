'use client';

import { useEffect, useRef } from 'react';

// Kirim 1 ping ke /api/track saat halaman dibuka.
// sendBeacon → tidak memblokir render & tetap jalan saat user menutup tab.
export default function VisitorTracker({ path = '/' }: { path?: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const payload = JSON.stringify({ path });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
    }
  }, [path]);

  return null;
}
