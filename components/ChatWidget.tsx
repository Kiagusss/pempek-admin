'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text: string, admin: boolean) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          admin,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Terjadi kesalahan.');
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: data.reply! },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    // Jika belum mode admin dan teks pendek (kemungkinan PIN), coba verifikasi
    // agar PIN bisa langsung diketik di kolom chat tanpa tombol "Admin".
    if (!adminUnlocked && text.length <= 20) {
      setLoading(true);
      try {
        const res = await fetch('/api/chat/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: text }),
        });
        if (res.ok) {
          setAdminUnlocked(true);
          setShowPin(false);
          setPin('');
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content:
                '✅ Mode admin aktif. Kamu sekarang bisa bertanya tentang seluruh data situs: penjualan, stok, pesanan, produk, artikel, dan lainnya.',
            },
          ]);
          return;
        }
      } catch {
        // abaikan — lanjut kirim sebagai mode publik
      } finally {
        setLoading(false);
      }
    }

    void send(text, adminUnlocked);
  };

  const handlePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pinBusy) return;
    setPinBusy(true);
    setError('');
    try {
      const res = await fetch('/api/chat/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'PIN salah.');
      }
      setAdminUnlocked(true);
      setShowPin(false);
      setPin('');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '✅ Mode admin aktif. Kamu sekarang bisa bertanya tentang seluruh data situs: penjualan, stok, pesanan, produk, artikel, dan lainnya.',
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PIN salah.');
    } finally {
      setPinBusy(false);
    }
  };

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Tutup chat' : 'Buka chat'}
        className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-all duration-[var(--dur-normal)] hover:bg-[var(--color-accent-hover)] hover:scale-105"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chatbot"
          className="fixed bottom-24 right-5 z-[90] flex h-[32rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-paper-3)] bg-[var(--color-accent)] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                🐟
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Dia Pempek</p>
                <p className="text-[11px] text-white/80">{adminUnlocked ? 'Mode Admin' : 'Mode Publik'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!adminUnlocked && (
                <button
                  onClick={() => setShowPin((s) => !s)}
                  className="rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/20"
                >
                  Admin
                </button>
              )}
              {adminUnlocked && (
                <button
                  onClick={() => {
                    setAdminUnlocked(false);
                    setMessages([]);
                  }}
                  className="rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/20"
                >
                  Keluar
                </button>
              )}
            </div>
          </div>

          {/* PIN prompt */}
          {showPin && !adminUnlocked && (
            <form onSubmit={handlePin} className="border-b border-[var(--color-paper-3)] bg-[var(--color-paper-2)] p-3">
              <p className="mb-2 text-xs font-medium text-[var(--color-ink-2)]">
                Masukkan PIN admin untuk mengakses data internal (pesanan, stok, penjualan):
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]"
                />
                <button
                  type="submit"
                  disabled={pinBusy || !pin.trim()}
                  className="shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                >
                  {pinBusy ? '...' : 'Buka'}
                </button>
              </div>
            </form>
          )}

          {/* Messages */}
          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-paper-2)] p-4">
            {messages.length === 0 && (
              <p className="text-sm leading-relaxed text-[var(--color-ink-3)]">
                Halo! 👋 Saya bisa bantu soal menu, harga, paket, dan cara pemesanan pempek.
                {adminUnlocked && ' (Mode admin aktif.)'}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto w-fit max-w-[85%] rounded-[var(--radius-lg)] bg-[var(--color-accent)] px-3 py-2 text-sm text-white'
                    : 'w-fit max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm text-[var(--color-ink-2)]'
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="w-fit rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm text-[var(--color-ink-3)]">
                Mengetik…
              </div>
            )}
            {error && <p className="text-xs font-medium text-[var(--color-danger)]">{error}</p>}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[var(--color-paper-3)] bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={adminUnlocked ? 'Tanya data internal…' : 'Tanya menu/harga… (Admin: ketik PIN)'}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Kirim"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
