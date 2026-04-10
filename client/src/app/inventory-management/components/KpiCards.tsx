import React from 'react';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

interface KpiCardsProps {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
        <div className="w-9 h-9 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-8 w-20 bg-slate-200 rounded mt-2" />
      <div className="h-3 w-32 bg-slate-100 rounded mt-2" />
    </div>
  );
}

export default function KpiCards({
  totalItems,
  lowStockCount,
  outOfStockCount,
  loading,
}: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {['kpi-sk-1', 'kpi-sk-2', 'kpi-sk-3'].map((k) => (
          <SkeletonCard key={k} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'kpi-total-items',
      label: 'Total Items',
      value: totalItems.toString(),
      sub: 'unique products tracked',
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-slate-900',
    },
    {
      id: 'kpi-low-stock',
      label: 'Low Stock',
      value: lowStockCount.toString(),
      sub: 'items with qty < 10',
      icon: AlertTriangle,
      iconBg: lowStockCount > 0 ? 'bg-amber-50' : 'bg-slate-50',
      iconColor: lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400',
      valueColor: lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900',
      alert: lowStockCount > 0,
    },
    {
      id: 'kpi-out-of-stock',
      label: 'Out of Stock',
      value: outOfStockCount.toString(),
      sub: 'items need restocking',
      icon: XCircle,
      iconBg: outOfStockCount > 0 ? 'bg-red-50' : 'bg-slate-50',
      iconColor: outOfStockCount > 0 ? 'text-red-500' : 'text-slate-400',
      valueColor: outOfStockCount > 0 ? 'text-red-600' : 'text-slate-900',
      alert: outOfStockCount > 0,
    },
    {
      id: 'kpi-close-to-expiry',
      label: 'Close to Expiry',
      value: '0',
      sub: 'items nearing expiry date',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-600',
      alert: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-sm ${
              card.alert ? 'border-slate-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-500 text-slate-500 uppercase tracking-wide font-medium">
                {card.label}
              </span>
              <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon size={17} className={card.iconColor} />
              </div>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${card.valueColor} mt-1`}>
              {card.value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
