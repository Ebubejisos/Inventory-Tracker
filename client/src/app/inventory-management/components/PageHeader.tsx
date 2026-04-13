import React from 'react';
import { Plus, Package } from 'lucide-react';

interface PageHeaderProps {
  onAddItem: () => void;
}

export default function PageHeader({ onAddItem }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Package size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 leading-tight">Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your stock levels and expiries all in one place
          </p>
        </div>
      </div>

      <button
        onClick={onAddItem}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-150 active:scale-95 shadow-sm flex-shrink-0"
      >
        <Plus size={16} />
        Add Item
      </button>
    </div>
  );
}
