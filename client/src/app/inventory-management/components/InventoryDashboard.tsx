'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import KpiCards from './KpiCards';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import DeleteConfirmModal from './DeleteConfirmModal';
import PageHeader from './PageHeader';

// Backend integration point: replace base URL with env var in production
// e.g. process.env.NEXT_PUBLIC_API_URL
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export interface InventoryItem {
  id: string | number;
  name: string;
  quantity: number;
  dateAdded: string;
}

export type FormValues = Omit<InventoryItem, 'id' | 'dateAdded'>;

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>(
    'all'
  );

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Backend integration: GET /items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<InventoryItem[]>(`${API_BASE}/items`);
      setItems(res.data);
    } catch {
      setError(
        'Failed to load inventory items. Make sure the backend is running on http://localhost:5000.'
      );
      // Fallback mock data so UI is usable without backend
      setItems(MOCK_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Backend integration: POST /items
  const handleCreate = async (values: FormValues) => {
    setFormLoading(true);
    try {
      const res = await axios.post<InventoryItem>(`${API_BASE}/items`, {
        ...values,
        dateAdded: new Date().toISOString(),
      });
      setItems((prev) => [res.data, ...prev]);
      toast.success(`"${values.name}" added to inventory.`);
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
      const res = await axios.put<InventoryItem>(`${API_BASE}/items/${editingItem.id}`, values);
      setItems((prev) => prev.map((it) => (it.id === editingItem.id ? res.data : it)));
      toast.success(`"${values.name}" updated successfully.`);
      setEditingItem(null);
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
      await axios.delete(`${API_BASE}/items/${deletingItem.id}`);
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      toast.success(`"${deletingItem.name}" removed from inventory.`);
      setDeletingItem(null);
    } catch {
      toast.error('Failed to delete item. Check your connection and try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (stockFilter === 'out-of-stock') return item.quantity === 0;
    if (stockFilter === 'low-stock') return item.quantity > 0 && item.quantity < 10;
    if (stockFilter === 'in-stock') return item.quantity >= 10;
    return true;
  });

  const totalValue = 0;
  const lowStockCount = items.filter((it) => it.quantity > 0 && it.quantity < 10).length;
  const outOfStockCount = items.filter((it) => it.quantity === 0).length;

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
            totalItems={items.length}
            lowStockCount={lowStockCount}
            outOfStockCount={outOfStockCount}
            loading={loading}
          />
        </div>

        <div className="mt-8">
          <ItemList
            items={filteredItems}
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
            onRetry={fetchItems}
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
  { id: 'item-001', name: 'Wireless Keyboard', quantity: 24, dateAdded: '2026-01-15T08:00:00Z' },
  { id: 'item-002', name: 'USB-C Hub 7-Port', quantity: 8, dateAdded: '2026-01-18T10:30:00Z' },
  { id: 'item-003', name: 'Mechanical Mouse', quantity: 0, dateAdded: '2026-01-20T14:15:00Z' },
  { id: 'item-004', name: '27" Monitor Stand', quantity: 5, dateAdded: '2026-02-02T09:00:00Z' },
  { id: 'item-005', name: 'Laptop Sleeve 15"', quantity: 31, dateAdded: '2026-02-10T11:45:00Z' },
  { id: 'item-006', name: 'Webcam 1080p', quantity: 3, dateAdded: '2026-02-14T16:00:00Z' },
  { id: 'item-007', name: 'Desk Cable Organizer', quantity: 47, dateAdded: '2026-02-20T08:30:00Z' },
  {
    id: 'item-008',
    name: 'Noise-Cancelling Headset',
    quantity: 0,
    dateAdded: '2026-03-01T13:00:00Z',
  },
  { id: 'item-009', name: 'HDMI 2.1 Cable 2m', quantity: 18, dateAdded: '2026-03-05T10:00:00Z' },
  { id: 'item-010', name: 'Portable SSD 1TB', quantity: 7, dateAdded: '2026-03-12T15:30:00Z' },
  { id: 'item-011', name: 'Ergonomic Wrist Rest', quantity: 22, dateAdded: '2026-03-18T09:15:00Z' },
  { id: 'item-012', name: 'LED Desk Lamp', quantity: 2, dateAdded: '2026-03-25T11:00:00Z' },
];
