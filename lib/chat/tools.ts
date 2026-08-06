// Tool eksekusi untuk chatbot admin — hanya dipanggil dari API route saat mode admin aktif.
import { createOrder, updateOrderStatus } from '@/lib/actions/orders';
import { getProducts, updateProduct } from '@/lib/actions/products';

export type ToolResult = { ok: boolean; result: string };

// Definisi tool untuk OpenAI-compatible API (function calling)
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_order',
      description:
        'Buat pesanan baru (mengurangi stok otomatis). productName harus persis nama produk yang ada di data. Hanya jalankan setelah admin mengonfirmasi detail pesanan.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama pemesan' },
          whatsapp: { type: 'string', description: 'Nomor WhatsApp pemesan (opsional)' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productName: { type: 'string', description: 'Nama produk persis seperti di data' },
                quantity: { type: 'integer', description: 'Jumlah', minimum: 1 },
              },
              required: ['productName', 'quantity'],
            },
          },
          notes: { type: 'string', description: 'Catatan pesanan (opsional)' },
        },
        required: ['name', 'items'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_order_status',
      description: 'Ubah status pesanan. Hanya jalankan setelah admin mengonfirmasi.',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'ID pesanan' },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'cancelled'],
          },
        },
        required: ['orderId', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_product_stock',
      description: 'Ubah nilai stok produk (set langsung). Hanya jalankan setelah admin mengonfirmasi.',
      parameters: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Nama produk persis seperti di data' },
          stock: { type: 'integer', description: 'Nilai stok baru (>= 0)', minimum: 0 },
        },
        required: ['productName', 'stock'],
      },
    },
  },
];

async function findProductByName(name: string) {
  const products = await getProducts();
  const q = name.trim().toLowerCase();
  return (
    products.find((p) => p.name.toLowerCase() === q) ||
    products.find((p) => p.name.toLowerCase().includes(q))
  );
}

export async function executeTool(name: string, args: unknown): Promise<ToolResult> {
  try {
    const a = (args ?? {}) as Record<string, unknown>;

    if (name === 'create_order') {
      const items = Array.isArray(a.items) ? a.items : [];
      if (!a.name || items.length === 0) {
        return { ok: false, result: 'Parameter tidak lengkap: butuh name dan items.' };
      }
      const resolved: { productId: string; productName: string; quantity: number; price: number }[] = [];
      for (const it of items) {
        const item = it as { productName?: string; quantity?: number };
        const p = await findProductByName(item.productName ?? '');
        if (!p) {
          const products = await getProducts();
          return {
            ok: false,
            result: `Produk "${item.productName}" tidak ditemukan. Produk yang tersedia: ${products.map((x) => x.name).join(', ')}`,
          };
        }
        resolved.push({
          productId: String(p.id),
          productName: p.name,
          quantity: Math.max(1, Number(item.quantity) || 1),
          price: p.price,
        });
      }
      const order = await createOrder({
        name: String(a.name),
        whatsapp: a.whatsapp ? String(a.whatsapp) : '',
        products: resolved,
        notes: a.notes ? String(a.notes) : '',
      });
      return {
        ok: true,
        result: `Pesanan #${order.id} atas nama ${order.name} berhasil dibuat (status: ${order.status}). Stok produk sudah dikurangi.`,
      };
    }

    if (name === 'update_order_status') {
      const order = await updateOrderStatus(String(a.orderId), a.status as never);
      if (!order) return { ok: false, result: `Pesanan #${a.orderId} tidak ditemukan.` };
      return { ok: true, result: `Pesanan #${order.id} status diubah menjadi "${order.status}".` };
    }

    if (name === 'update_product_stock') {
      const p = await findProductByName(String(a.productName ?? ''));
      if (!p) {
        const products = await getProducts();
        return {
          ok: false,
          result: `Produk "${a.productName}" tidak ditemukan. Produk yang tersedia: ${products.map((x) => x.name).join(', ')}`,
        };
      }
      const stock = Math.max(0, Number(a.stock) || 0);
      const updated = await updateProduct(String(p.id), { stock });
      return { ok: true, result: `Stok ${updated?.name ?? p.name} diubah menjadi ${stock}.` };
    }

    return { ok: false, result: `Tool "${name}" tidak dikenal.` };
  } catch (err) {
    return { ok: false, result: `Gagal eksekusi: ${err instanceof Error ? err.message : 'unknown'}` };
  }
}
