'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { Toaster, toast } from 'sonner';
import KpiCards from './KpiCards';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import PageHeader from './PageHeader';

// Backend integration point: replace base URL with env var in production
// e.g. process.env.NEXT_PUBLIC_API_URL
import axios from 'axios';
import { StockStatus } from '@/interfaces/products';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface InventoryItem {
  id: string | number;
  name: string;
  quantity: number;
  brand: string;
  expiry_date: string;
}

export interface InventorySummary {
  total: number;
  low_stock: number;
  out_of_stock: number;
  close_to_expiry: number;
}

export type FormValues = Omit<InventoryItem, 'id'>;

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockStatus>(StockStatus.ALL);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // add debounce state for search input to reduce API calls
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Backend integration: GET /items
  const fetchItems = async (signal: AbortSignal) => {
    const url = new URL(`${API_BASE}/api/items`);

    if (debouncedSearch) {
      url.searchParams.append('search', debouncedSearch);
    }

    if (stockFilter && stockFilter !== 'all') {
      let status = '';
      if (stockFilter === 'close-to-expiry') status = 'close_to_expiry';
      else if (stockFilter === 'low-stock') status = 'low_stock';
      else if (stockFilter === 'out-of-stock') status = 'out_of_stock';

      url.searchParams.append('status', status);
    }

    const res = await axios.get<InventoryItem[]>(url.toString(), { signal });
    return res.data;
  };

  // Backend integration: GET /items/summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await axios.get<InventorySummary>(`${API_BASE}/api/items/summary`);
      setSummary(res.data);
    } catch {
      toast.error('Failed to load inventory summary. KPIs will be unavailable.');
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchItems(controller.signal);
        setItems(data);
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }

        setError(`Failed to load inventory items from ${API_BASE}`);
        setItems(MOCK_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    loadItems();

    return () => {
      controller.abort(); // 👈 cancels previous request
    };
  }, [debouncedSearch, stockFilter]);

  useEffect(() => {
    fetchSummary();
  }, []);

  // Backend integration: POST /items
  const handleCreate = async (values: FormValues) => {
    setFormLoading(true);
    try {
      const res = await axios.post<InventoryItem>(`${API_BASE}/api/items`, {
        ...values,
      });
      setItems((prev) => [res.data, ...prev]);
      fetchSummary();
      toast.success(`"${values.name}" added to inventory.`);
      // fetchItems(); // Refresh list to update summary counts
      setShowForm(false);
    } catch {
      toast.error('Failed to add item. Check your connection and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Backend integration: PUT /items/:id
  const handleUpdate = async (values: FormValues) => {
    if (!editingItem) return;
    setFormLoading(true);
    try {
      const res = await axios.put<InventoryItem>(`${API_BASE}/api/items/${editingItem.id}`, values);
      setItems((prev) => prev.map((it) => (it.id === editingItem.id ? res.data : it)));
      fetchSummary();
      toast.success(`"${values.name}" updated successfully.`);
      setEditingItem(null);
      setShowForm(false);
    } catch {
      toast.error('Failed to update item. Check your connection and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Backend integration: DELETE /items/:id
  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/items/${deletingItem.id}`);
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      fetchSummary();
      toast.success(`"${deletingItem.name}" removed from inventory.`);
      setDeletingItem(null);
    } catch {
      toast.error('Failed to delete item. Check your connection and try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" richColors closeButton />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        <PageHeader
          onAddItem={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        />

        <div className="mt-6">
          <KpiCards
            totalItems={summary?.total || 0}
            lowStockCount={summary?.low_stock || 0}
            outOfStockCount={summary?.out_of_stock || 0}
            closeToExpiryCount={summary?.close_to_expiry || 0}
            loading={summaryLoading || !summary}
          />
        </div>

        <div className="mt-8">
          <ItemList
            items={items}
            loading={loading}
            error={error}
            search={search}
            stockFilter={stockFilter}
            onSearchChange={setSearch}
            onStockFilterChange={setStockFilter}
            onEdit={(item) => {
              setEditingItem(item);
              setShowForm(true);
            }}
            onDelete={setDeletingItem}
            onRetry={() => {
              const controller = new AbortController();
              fetchItems(controller.signal);
            }}
          />
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <ItemForm
          editingItem={editingItem}
          loading={formLoading}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingItem && (
        <DeleteConfirmModal
          itemName={deletingItem.name}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}

// Fallback mock data — used when backend is unreachable
const MOCK_ITEMS: InventoryItem[] = [
  {
    id: 'item-001',
    name: 'Wireless Keyboard',
    quantity: 24,
    expiry_date: '2026-01-15T08:00:00Z',
    brand: '',
  },
  {
    id: 'item-002',
    name: 'USB-C Hub 7-Port',
    quantity: 8,
    expiry_date: '2026-01-18T10:30:00Z',
    brand: '',
  },
  {
    id: 'item-003',
    name: 'Mechanical Mouse',
    quantity: 0,
    expiry_date: '2026-01-20T14:15:00Z',
    brand: '',
  },
  {
    id: 'item-004',
    name: '27" Monitor Stand',
    quantity: 5,
    expiry_date: '2026-02-02T09:00:00Z',
    brand: '',
  },
  {
    id: 'item-005',
    name: 'Laptop Sleeve 15"',
    quantity: 31,
    expiry_date: '2026-02-10T11:45:00Z',
    brand: '',
  },
  {
    id: 'item-006',
    name: 'Webcam 1080p',
    quantity: 3,
    expiry_date: '2026-02-14T16:00:00Z',
    brand: '',
  },
  {
    id: 'item-007',
    name: 'Desk Cable Organizer',
    quantity: 47,
    expiry_date: '2026-02-20T08:30:00Z',
    brand: '',
  },
  {
    id: 'item-008',
    name: 'Noise-Cancelling Headset',
    quantity: 0,
    expiry_date: '2026-03-01T13:00:00Z',
    brand: '',
  },
  {
    id: 'item-010',
    name: 'Portable SSD 1TB',
    quantity: 7,
    expiry_date: '2026-03-12T15:30:00Z',
    brand: '',
  },
  {
    id: 'item-011',
    name: 'Ergonomic Wrist Rest',
    quantity: 22,
    expiry_date: '2026-03-18T09:15:00Z',
    brand: '',
  },
  {
    id: 'item-012',
    name: 'LED Desk Lamp',
    quantity: 2,
    expiry_date: '2026-03-25T11:00:00Z',
    brand: '',
  },
];
