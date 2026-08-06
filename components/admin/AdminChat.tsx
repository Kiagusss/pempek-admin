'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TEXT_EXT = ['txt', 'md', 'csv', 'json', 'js', 'ts', 'html', 'css', 'sql', 'xml', 'log'];

export default function AdminChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = '';
    const added: { name: string; content: string }[] = [];

    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`File ${f.name} terlalu besar (maks 5MB).`);
        continue;
      }
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (TEXT_EXT.includes(ext)) {
        added.push({ name: f.name, content: await f.text() });
      } else {
        // File non-teks: kirim nama & ukuran saja (model tidak bisa membaca biner).
        added.push({ name: f.name, content: `[File biner: ${f.name}, ${(f.size / 1024).toFixed(1)} KB — tidak bisa dibaca sebagai teks]` });
      }
    }
    if (added.length) {
      setFiles((prev) => [...prev, ...added]);
      setError('');
    }
  };

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const send = async (text: string, admin: boolean, attach: { name: string; content: string }[]) => {
    setLoading(true);
    setError('');
    // Sertakan isi file sebagai bagian dari pesan user agar model bisa membacanya.
    const content = attach.length
      ? `${text}\n\n--- LAMPIRAN ---\n${attach
          .map((f) => `=== ${f.name} ===\n${f.content.slice(0, 8000)}`)
          .join('\n\n')}`
      : text;

    // Optimistic: tampilkan pesan user langsung, tanpa menunggu jawaban AI.
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, files: attach.map((f) => f.name) },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          admin,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || 'Terjadi kesalahan.');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && files.length === 0) || loading) return;
    setInput('');

    // Jika belum mode admin dan teks pendek (kemungkinan PIN), coba verifikasi
    // agar PIN bisa langsung diketik di kolom chat tanpa tombol "Admin".
    if (!adminUnlocked && text.length <= 20 && files.length === 0) {
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

    void send(text, adminUnlocked, files);
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
        aria-label={open ? 'Tutup chat' : 'Buka chat AI'}
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
          aria-label="Chatbot AI"
          className="fixed bottom-24 right-5 z-[90] flex h-[70vh] max-h-[42rem] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-paper-3)] bg-[var(--color-accent)] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base font-bold">
                🐟
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-accent)] bg-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Dia Pempek AI</p>
                <p className="text-[11px] text-white/80">
                  {adminUnlocked ? 'Mode Admin · akses data internal' : 'Asisten admin'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!adminUnlocked && (
                <button
                  onClick={() => setShowPin((s) => !s)}
                  className="rounded-[var(--radius-md)] px-2 py-1 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/20"
                >
                  🔓 Admin
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
              <div className="mx-auto max-w-xs pt-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-2xl">
                  🐟
                </div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">Halo, Admin!</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-3)]">
                  Tanya soal penjualan, stok, pesanan, atau lampirkan file (txt, csv, md, json…) untuk dianalisis.
                </p>
                <p className="mt-3 text-[11px] text-[var(--color-ink-3)]">
                  {adminUnlocked ? 'Mode admin aktif ✓' : 'Klik "Admin" atau ketik PIN untuk akses data internal.'}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                {m.files && m.files.length > 0 && (
                  <div className="mb-1 flex max-w-[85%] flex-wrap justify-end gap-1">
                    {m.files.map((f) => (
                      <span key={f} className="rounded-full border border-[var(--color-paper-3)] bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink-2)]">
                        📎 {f}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  className={
                    m.role === 'user'
                      ? 'w-fit max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-lg)] rounded-br-sm bg-[var(--color-accent)] px-3 py-2 text-sm text-white'
                      : 'w-fit max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-lg)] rounded-bl-sm border border-[var(--color-paper-3)] bg-white px-3 py-2 text-sm text-[var(--color-ink-2)]'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 w-fit rounded-[var(--radius-lg)] border border-[var(--color-paper-3)] bg-white px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-accent)]" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-accent)]" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-accent)]" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            {error && <p className="text-xs font-medium text-[var(--color-danger)]">{error}</p>}
          </div>

          {/* Attached files bar */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-[var(--color-paper-3)] bg-white px-3 pt-2">
              {files.map((f) => (
                <span key={f.name} className="flex items-center gap-1 rounded-full border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink-2)]">
                  📎 {f.name}
                  <button
                    onClick={() => removeFile(f.name)}
                    className="text-[var(--color-ink-3)] hover:text-[var(--color-danger)]"
                    aria-label={`Hapus ${f.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[var(--color-paper-3)] bg-white p-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.json,.js,.ts,.html,.css,.sql,.xml,.log"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Lampirkan file"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-3)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-accent)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={adminUnlocked ? 'Tanya data internal…' : 'Tanya / ketik PIN admin…'}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && files.length === 0)}
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
