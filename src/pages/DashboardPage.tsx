import React, { useEffect, useState } from 'react';
import {
  Users,
  AlertTriangle,
  FileSpreadsheet,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Package,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Product } from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lowStockRes] = await Promise.all([
          api.getDashboardStats(),
          api.getProducts({ lowStock: true, limit: 5 }),
        ]);
        setStats(statsRes);
        setLowStockProducts(lowStockRes.items);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-sm flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <span>Loading Dashboard Metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Wholesale Operations Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time status overview of CRM leads, warehouse inventory, and sales challans.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('challans')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Sales Challan</span>
          </button>
        </div>
      </div>

      {/* Bento Grid KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Customers</span>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{stats?.totalCustomers || 0}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              {stats?.totalCustomersChange || '+12%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Active CRM accounts & wholesale leads</div>
        </div>

        {/* Low Stock Alerts (Red Border Left Accent) */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock Alerts</span>
            <div className="h-9 w-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{stats?.lowStockAlerts || 0}</span>
            <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Requires Action
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Items below minimum stock threshold</div>
        </div>

        {/* Draft Challans */}
        <div
          onClick={() => onNavigate('challans')}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Draft Challans</span>
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{stats?.draftChallans || 0}</span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Pending Review
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Awaiting stock validation & confirmation</div>
        </div>

        {/* Today's Sales (Blue Border Left Accent) */}
        <div
          onClick={() => onNavigate('challans')}
          className="bg-white p-5 rounded-xl border border-gray-200 border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Sales</span>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-gray-900">{stats?.todaySales || '₹0.00'}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              {stats?.todaySalesChange || '+5.4%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">Confirmed & dispatched challans today</div>
        </div>
      </div>

      {/* Main Content Split: Recent Activity & Low Stock Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Sales & Challan Activity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest transactions processed across sales and dispatch.</p>
            </div>
            <button
              onClick={() => onNavigate('challans')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Challan #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-gray-900">{row.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{row.customer}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'Draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Restock Quick Action Widget */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-bold text-gray-900">Critical Low Stock Items</h3>
            </div>
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">All inventory levels are healthy!</div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-gray-900">{p.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">SKU: {p.sku} • {p.warehouseLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-red-600">{p.currentStock} in stock</div>
                    <div className="text-[10px] text-gray-400">Min: {p.minStockAlert}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            <Package className="h-3.5 w-3.5" />
            <span>Manage Inventory & Adjust Stock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
