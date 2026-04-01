'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  itemName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  itemName,
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 animate-fadeIn">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Delete Item</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-medium text-slate-800">&ldquo;{itemName}&rdquo;</span> from
                inventory? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-32 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete Item'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
