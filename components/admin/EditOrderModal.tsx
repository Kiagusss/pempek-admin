import React, { useState } from 'react';
import { Order } from '@/types';

// Modal component for Order Editing
const EditOrderModal = ({ order, isOpen, onClose, onSave }: { order: Order, isOpen: boolean, onClose: () => void, onSave: (id: string, data: any) => void }) => {
  const [formData, setFormData] = useState({
    name: order.name,
    whatsapp: order.whatsapp,
    notes: order.notes,
    status: order.status
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] bg-[var(--color-paper-1)] p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-ink)]">Edit Pesanan #{order.id.slice(-6).toUpperCase()}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink-2)]">Nama Pelanggan</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink-2)]">WhatsApp</label>
            <input 
              type="text" 
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-ink-2)]">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-paper-3)] p-2 text-sm"
            >
              <option value="pending">Menunggu</option>
              <option value="processing">Diproses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Batal</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-paper-2)]">Batal</button>
          <button 
            onClick={() => onSave(order.id, formData)} 
            className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;