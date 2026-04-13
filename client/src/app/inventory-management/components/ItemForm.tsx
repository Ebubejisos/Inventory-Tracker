'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { InventoryItem, FormValues } from './InventoryDashboard';

interface ItemFormProps {
  editingItem: InventoryItem | null;
  loading: boolean;
  onSubmit: (values: FormValues) => void;
  onClose: () => void;
}

export default function ItemForm({ editingItem, loading, onSubmit, onClose }: ItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      quantity: 0,
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        quantity: editingItem.quantity,
        brand: editingItem.brand,
        expiry_date: editingItem.expiry_date, // Format for date input
      });
    } else {
      reset({ name: '', quantity: 0, brand: '', expiry_date: '' });
    }
  }, [editingItem, reset]);

  const isEdit = Boolean(editingItem);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEdit ? 'Edit Item' : 'Add New Item'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? `Updating "${editingItem?.name}"` : 'Add a new product to your inventory'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-6 py-5 space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="item-name" className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-1.5">
                Enter the full product name and strength where necessary{' '}
              </p>
              <input
                id="item-name"
                type="text"
                autoFocus
                placeholder="e.g. Amlodipine 10mg"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${
                  errors.name
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-slate-300 focus:border-blue-400'
                }`}
                {...register('name', {
                  required: 'Product name is required.',
                  minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                  maxLength: { value: 100, message: 'Name must be under 100 characters.' },
                })}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            {/* brand name for item */}
            <div>
              <label htmlFor="item-brand" className="block text-sm font-medium text-slate-700 mb-1">
                Brand Name
              </label>
              <input
                id="item-brand"
                type="text"
                placeholder="e.g. Novartis"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${
                  errors.brand
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-slate-300 focus:border-blue-400'
                }`}
                {...register('brand', {
                  maxLength: { value: 100, message: 'Brand name must be under 100 characters.' },
                })}
              />
              {errors.brand && (
                <p className="mt-1.5 text-xs text-red-600">{errors.brand.message}</p>
              )}
            </div>

            {/* Quantity + Price row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label
                  htmlFor="item-quantity"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Quantity <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-1.5">Units in stock</p>
                <input
                  id="item-quantity"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors tabular-nums ${
                    errors.quantity
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-slate-300 focus:border-blue-400'
                  }`}
                  {...register('quantity', {
                    required: 'Quantity is required.',
                    min: { value: 0, message: 'Quantity cannot be negative.' },
                    max: { value: 999999, message: 'Quantity seems too large.' },
                    valueAsNumber: true,
                  })}
                />
                {errors.quantity && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.quantity.message}</p>
                )}
              </div>
            </div>
            {/* expiry date */}
            <div>
              <label
                htmlFor="item-expiry"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Expiry Date
              </label>
              <input
                id="item-expiry"
                type="date"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${
                  errors.expiry_date
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-slate-300 focus:border-blue-400'
                }`}
                {...register('expiry_date', {
                  validate: (value) => {
                    if (!value) return 'Expiry date is required.';
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                      return 'Expiry date cannot be in the past.';
                    }
                    return true;
                  },
                })}
              />
              {errors.expiry_date && (
                <p className="mt-1.5 text-xs text-red-600">{errors.expiry_date.message}</p>
              )}
            </div>

            {/* Required legend */}
            <p className="text-xs text-slate-400">
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 w-36 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {isEdit ? 'Saving…' : 'Adding…'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
