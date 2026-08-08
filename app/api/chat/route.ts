import { NextRequest, NextResponse } from 'next/server';
import { buildSiteContext } from '@/lib/chat/context';
import { TOOLS, executeTool } from '@/lib/chat/tools';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PIN = process.env.CHAT_ADMIN_PIN;
const API_KEY = process.env.DEEPSEEK_API_KEY;
// Endpoint & model dapat diubah lewat env (default: endpoint 9Router + combo "gratis")
const BASE_URL = (process.env.CHAT_API_BASE || 'https://rzgwipd.abc-tunnel.us/v1').replace(/\/$/, '');
const MODEL = process.env.CHAT_MODEL || 'gratis';

const PUBLIC_SYSTEM = `Kamu adalah asisten virtual "Dia Pempek" untuk situs Pempek Palembang (pempek-depok.vercel.app).
Kamu menjawab pertanyaan pengunjung seputar menu, harga, paket, cara pemesanan, pengiriman, artikel, dan FAQ.
Gunakan Bahasa Indonesia yang ramah. Jawab singkat dan jelas (maksimal ~150 kata kecuali diminta detail).
Jika jawaban tidak ada di data situs, katakan jujur bahwa kamu tidak tahu dan arahkan ke WhatsApp resmi.`;

const INTERNAL_SYSTEM = `Kamu adalah asisten internal admin situs Pempek Palembang.
Kamu bisa membaca SELURUH data situs (produk, stok, paket, artikel, FAQ, testimoni, banner, galeri, kategori, pesanan, pengaturan, SEO) yang disertakan di bawah.
Tugasmu membantu admin: menganalisis penjualan, mengecek stok, merangkum pesanan, memberi saran produk/harga, dll.
Kamu JUGA bisa mengubah database via tools: membuat pesanan, mengubah status pesanan, mengubah stok produk.
Aturan penggunaan tools:
- Panggil tool hanya jika data yang diperlukan (mis. nama produk) sudah pasti dan admin sudah mengonfirmasi niatnya.
- Sebelum membuat pesanan, pastikan nama produk persis dengan yang ada di data.
- Setelah tool selesai, sampaikan hasilnya ke admin dengan ringkas.
Gunakan Bahasa Indonesia yang jelas dan ringkas.
JANGAN pernah menampilkan data pribadi pelanggan (nama lengkap, alamat, nomor WhatsApp) secara mentah — cukup ringkasan/statistik.
Jika diminta sesuatu di luar data yang tersedia, jawab dengan jujur.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: unknown;
  tool_call_id?: string;
}

export async function POST(req: NextRequest) {
  // Rate limit: publik 20 pesan/menit per IP, admin 60/menit (admin via PIN).
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const body = (await req.json().catch(() => null)) as
    | { messages?: ChatMessage[]; admin?: boolean }
    | null;

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'Pesan kosong.' }, { status: 400 });
  }

  const isAdmin = Boolean(body.admin);
  const rl = rateLimit(isAdmin ? `chat-admin:${ip}` : `chat-pub:${ip}`, isAdmin ? 60 : 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak pesan. Coba lagi dalam ${rl.retryAfterSec} detik.` },
      { status: 429 },
    );
  }

  if (isAdmin && (!PIN || !API_KEY)) {
    return NextResponse.json(
      { error: 'Mode admin belum dikonfigurasi (CHAT_ADMIN_PIN / DEEPSEEK_API_KEY belum diset).' },
      { status: 503 },
    );
  }

  let system = PUBLIC_SYSTEM;
  if (isAdmin) {
    const context = await buildSiteContext().catch(() => '');
    system = `${INTERNAL_SYSTEM}\n\n--- DATA SITUS SAAT INI ---\n${context || '(data kosong)'}`;
  }

  if (!API_KEY) {
    // Fallback tanpa API key: jawaban berbasis data lokal agar tidak error.
    const siteData = await buildSiteContext().catch(() => '');
    const last = body.messages[body.messages.length - 1].content.slice(0, 500);
    return NextResponse.json({
      reply: `[Mode demo — DEEPSEEK_API_KEY belum diset]\n\nPertanyaanmu: "${last}"\n\nData situs:\n${siteData ? siteData.slice(0, 1200) : '(kosong)'}`,
    });
  }

  const messages: ChatMessage[] = [{ role: 'system', content: system }, ...body.messages];

  // Parsing respons yang bisa berupa JSON biasa atau SSE (gateway tertentu).
  async function parseCompletion(text: string) {
    try {
      return JSON.parse(text) as {
        choices?: { message?: { role?: string; content?: string; tool_calls?: unknown } }[];
      };
    } catch {
      const lines = text.split('\n').filter((l) => l.startsWith('data:'));
      for (const line of lines.reverse()) {
        const chunk = line.slice(5).trim();
        if (!chunk || chunk === '[DONE]') continue;
        try {
          return JSON.parse(chunk) as {
            choices?: { message?: { role?: string; content?: string; tool_calls?: unknown } }[];
          };
        } catch {
          // lanjut ke baris data: sebelumnya
        }
      }
      return null;
    }
  }

  async function callModel(msgs: ChatMessage[], withTools: boolean) {
    const body: Record<string, unknown> = {
      model: MODEL,
      messages: msgs,
      temperature: 0.4,
      max_tokens: 1024,
      stream: false,
    };
    if (withTools) body.tools = TOOLS;
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      throw new Error(`API error ${upstream.status}: ${detail.slice(0, 300)}`);
    }
    const parsed = await parseCompletion(await upstream.text());
    return parsed?.choices?.[0]?.message ?? null;
  }

  try {
    const msg = await callModel(messages, isAdmin);

    // Agent loop: jika model memanggil tool, eksekusi lalu lanjutkan percakapan.
    if (isAdmin && msg && Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
      const toolMessages: ChatMessage[] = [
        ...messages,
        {
          role: msg.role === 'assistant' ? 'assistant' : 'assistant',
          content: msg.content ?? '',
          tool_calls: msg.tool_calls as never,
        } as ChatMessage,
      ];
      for (const call of msg.tool_calls as { id?: string; function?: { name?: string; arguments?: string } }[]) {
        const fnName = call.function?.name ?? '';
        let args: unknown = {};
        try {
          args = JSON.parse(call.function?.arguments ?? '{}');
        } catch {
          args = { raw: call.function?.arguments };
        }
        const { ok, result } = await executeTool(fnName, args);
        toolMessages.push({
          role: 'tool',
          tool_call_id: call.id ?? '',
          content: ok ? result : `ERROR: ${result}`,
        } as ChatMessage);
      }
      const final = await callModel(toolMessages, true);
      const reply = final?.content?.trim() || 'Selesai.';
      return NextResponse.json({ reply });
    }

    const reply = msg?.content?.trim() || 'Maaf, tidak ada jawaban.';
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: `Gagal menghubungi API chat: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 502 },
    );
  }
}
