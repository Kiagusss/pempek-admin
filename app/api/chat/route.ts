import { NextRequest, NextResponse } from 'next/server';
import { buildSiteContext } from '@/lib/chat/context';

export const runtime = 'nodejs';
export const maxDuration = 60;

const PIN = process.env.CHAT_ADMIN_PIN;
const API_KEY = process.env.DEEPSEEK_API_KEY;
// Endpoint & model dapat diubah lewat env (default: endpoint custom OpenCode/DeepSeek V4 Flash Free)
const BASE_URL = (process.env.CHAT_API_BASE || 'https://rzgwipd.abc-tunnel.us/v1').replace(/\/$/, '');
const MODEL = process.env.CHAT_MODEL || 'oc/deepseek-v4-flash-free';

const PUBLIC_SYSTEM = `Kamu adalah asisten virtual "Dia Pempek" untuk situs Pempek Palembang (pempek-depok.vercel.app).
Kamu menjawab pertanyaan pengunjung seputar menu, harga, paket, cara pemesanan, pengiriman, artikel, dan FAQ.
Gunakan Bahasa Indonesia yang ramah. Jawab singkat dan jelas (maksimal ~150 kata kecuali diminta detail).
Jika jawaban tidak ada di data situs, katakan jujur bahwa kamu tidak tahu dan arahkan ke WhatsApp resmi.`;

const INTERNAL_SYSTEM = `Kamu adalah asisten internal admin situs Pempek Palembang.
Kamu bisa membaca SELURUH data situs (produk, stok, paket, artikel, FAQ, testimoni, banner, galeri, kategori, pesanan, pengaturan, SEO) yang disertakan di bawah.
Tugasmu membantu admin: menganalisis penjualan, mengecek stok, merangkum pesanan, memberi saran produk/harga, dll.
Gunakan Bahasa Indonesia yang jelas dan ringkas.
JANGAN pernah menampilkan data pribadi pelanggan (nama lengkap, alamat, nomor WhatsApp) secara mentah — cukup ringkasan/statistik.
Jika diminta sesuatu di luar data yang tersedia, jawab dengan jujur.`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { messages?: ChatMessage[]; admin?: boolean }
    | null;

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'Pesan kosong.' }, { status: 400 });
  }

  const isAdmin = Boolean(body.admin);

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

  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 1024,
        stream: false,
      }),
      cache: 'no-store',
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return NextResponse.json(
        { error: `API error ${upstream.status}: ${detail.slice(0, 300)}` },
        { status: 502 },
      );
    }

    // Beberapa gateway mengembalikan SSE (diawali 'data:') walau diminta JSON biasa.
    const raw = await upstream.text();
    let data: { choices?: { message?: { content?: string } }[] } | null = null;
    try {
      data = JSON.parse(raw);
    } catch {
      const lines = raw.split('\n').filter((l) => l.startsWith('data:'));
      for (const line of lines.reverse()) {
        const chunk = line.slice(5).trim();
        if (!chunk || chunk === '[DONE]') continue;
        try {
          data = JSON.parse(chunk);
          break;
        } catch {
          // lanjut ke baris data: sebelumnya
        }
      }
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() || 'Maaf, tidak ada jawaban.';

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: `Gagal menghubungi API chat: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 502 },
    );
  }
}
