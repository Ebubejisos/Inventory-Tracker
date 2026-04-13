'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { InventoryItem } from './InventoryDashboard';

interface ItemRowProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        Out of Stock
      </span>
    );
  }
  if (quantity < 10) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      In Stock
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ItemRow({ item, onEdit, onDelete }: ItemRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`border-b border-slate-100 transition-colors duration-100 ${hovered ? 'bg-slate-50' : 'bg-white'}`}
    >
      <td className="px-4 py-3.5">
        <span className="font-medium text-slate-800">{item.name}</span>
      </td>
      {/* brand */}
      <td className="px-4 py-3.5">
        <span className="font-medium text-slate-800">{item.brand}</span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`tabular-nums font-medium ${item.quantity === 0 ? 'text-red-600' : item.quantity < 10 ? 'text-amber-600' : 'text-slate-700'}`}
        >
          {item.quantity}
        </span>
      </td>
      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
        {formatDate(item.expiry_date)}
      </td>
      <td className="px-4 py-3.5">
        <StockBadge quantity={item.quantity} />
      </td>
      <td className="px-4 py-3.5">
        <div
          className={`flex items-center justify-end gap-1 transition-opacity duration-100 ${hovered ? 'md:opacity-100' : 'md:opacity-0'}`}
        >
          <button
            onClick={() => onEdit(item)}
            title="Edit this item"
            // re-write tailwind transition to work only in large screen size
            className="p-1.5 md:text-slate-400 text-blue-600  md:hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors "
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(item)}
            title="Delete this item — cannot be undone"
            className="p-1.5 md:text-slate-400 text-red-600  hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
