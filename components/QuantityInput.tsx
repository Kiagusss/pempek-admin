type QuantityInputProps = {
  quantity: number; // quantity item saat ini di keranjang (0 = belum ada)
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function QuantityInput({ quantity, onAdd, onIncrement, onDecrement }: QuantityInputProps) {
  if (quantity === 0) {
    return (
      <button
        onClick={onAdd}
        className="mt-1 flex w-full items-center justify-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[var(--color-accent-dark)]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Tambah
      </button>
    );
  }

  return (
    <div className="mt-1 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-paper-3)] bg-[var(--color-paper)] px-1 py-1">
      <button
        onClick={onDecrement}
        aria-label="Kurangi"
        className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-sm font-bold text-[var(--color-ink-2)] transition-colors hover:bg-white"
      >
        −
      </button>
      <span className="text-sm font-bold tabular-nums text-[var(--color-ink)]">{quantity}</span>
      <button
        onClick={onIncrement}
        aria-label="Tambah"
        className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-sm font-bold text-[var(--color-ink-2)] transition-colors hover:bg-white"
      >
        +
      </button>
    </div>
  );
}
