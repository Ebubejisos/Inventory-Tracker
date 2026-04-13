'use client';

import React, { useState } from 'react';
import { Search, Filter, RefreshCw, PackageOpen } from 'lucide-react';
import ItemRow from './ItemRow';
import { InventoryItem } from './InventoryDashboard';
import { StockStatus } from '@/interfaces/products';

interface ItemListProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  search: string;
  stockFilter: StockStatus;
  onSearchChange: (v: string) => void;
  onStockFilterChange: (v: StockStatus) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onRetry: () => void;
}

const FILTER_OPTIONS: {
  value: StockStatus;
  label: string;
}[] = [
  { value: StockStatus.ALL, label: 'All Items' },
  { value: StockStatus.CLOSE_TO_EXPIRY, label: 'Close to expiry' },
  { value: StockStatus.LOW_STOCK, label: 'Low Stock' },
  { value: StockStatus.OUT_OF_STOCK, label: 'Out of Stock' },
];

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, k) => (
        <tr key={k} className="animate-pulse border-b border-slate-100">
          <td className="px-4 py-3.5">
            <div className="h-3.5 w-36 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3.5">
            <div className="h-3.5 w-12 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3.5">
            <div className="h-3.5 w-16 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3.5">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
          </td>
          <td className="px-4 py-3.5">
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
          </td>
          <td className="px-4 py-3.5">
            <div className="flex gap-2">
              <div className="h-7 w-7 bg-slate-200 rounded" />
              <div className="h-7 w-7 bg-slate-200 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ItemList({
  items,
  loading,
  error,
  search,
  stockFilter,
  onSearchChange,
  onStockFilterChange,
  onEdit,
  onDelete,
  onRetry,
}: ItemListProps) {
  const [sortField, setSortField] = useState<keyof InventoryItem>('expiry_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const handleSort = (field: keyof InventoryItem) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sorted = [...items].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  const SortIcon = ({ field }: { field: keyof InventoryItem }) => (
    <span
      className={`ml-1 inline-block transition-colors ${sortField === field ? 'text-blue-600' : 'text-slate-300'}`}
    >
      {sortField === field && sortDir === 'desc' ? '↓' : '↑'}
    </span>
  );

  const pageNumbers: number[] = [];
  const delta = 2;
  for (let i = Math.max(1, safePage - delta); i <= Math.min(totalPages, safePage + delta); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 border-b border-slate-100">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setPage(1);
            }}
            placeholder="Search items by name…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Stock Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={`filter-${opt.value}`}
              onClick={() => {
                onStockFilterChange(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-100 ${
                stockFilter === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onRetry}
            title="Refresh inventory"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
          <span className="font-medium">⚠️ Backend unreachable</span>
          <span className="text-amber-700">— {error} Showing mock data.</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        {/* include a new table row to include brand from inventory item */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {[
                { key: 'name', label: 'Product Name' },
                { key: 'brand', label: 'Brand' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'expiry_date', label: 'Expiry Date' },
              ].map((col) => (
                <th
                  key={`th-${col.key}`}
                  onClick={() => handleSort(col.key as keyof InventoryItem)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                >
                  {col.label}
                  <SortIcon field={col.key as keyof InventoryItem} />
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <PackageOpen size={36} className="text-slate-300" />
                    <p className="text-slate-500 font-medium">No inventory items found</p>
                    <p className="text-slate-400 text-xs max-w-xs">
                      {search || stockFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Add your first product using the "Add Item" button above.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <ItemRow key={`row-${item.id}`} item={item} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={`pp-${n}`} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              of <span className="font-medium text-slate-700">{sorted.length}</span> items
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {pageNumbers.map((n) => (
              <button
                key={`page-${n}`}
                onClick={() => setPage(n)}
                className={`w-8 h-7 text-xs rounded-md transition-colors ${
                  n === safePage
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
