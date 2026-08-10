import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Boxes,
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('Restock / Manual Count Adjustment');
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Mechanical',
    unitPrice: 50.0,
    currentStock: 100,
    minStockAlert: 20,
    warehouseLocation: 'Zone A - R1',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        page,
        limit: 10,
        q: search,
        lowStock: lowStockOnly,
      });
      setProducts(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, lowStockOnly]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to save product.');
    }
  };

  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustProduct) return;
    setAdjustError(null);

    try {
      await api.recordStockMovement(selectedAdjustProduct.id, {
        quantityChanged: Number(adjustQty),
        movementType: adjustType,
        reason: adjustReason,
      });
      setShowAdjustModal(false);
      setSelectedAdjustProduct(null);
      fetchProducts();
    } catch (err: any) {
      setAdjustError(err.message || 'Stock adjustment failed.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      warehouseLocation: p.warehouseLocation,
    });
    setShowAddModal(true);
  };

  const openAdjustModal = (p: Product) => {
    setSelectedAdjustProduct(p);
    setAdjustType('IN');
    setAdjustQty(25);
    setAdjustReason('PO Restock Entry');
    setAdjustError(null);
    setShowAdjustModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Mechanical',
      unitPrice: 50.0,
      currentStock: 100,
      minStockAlert: 20,
      warehouseLocation: 'Zone A - R1',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Warehouse Products & Inventory</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time stock levels, unit pricing, minimum thresholds, and bin locations.
          </p>
        </div>

        {hasRole(['ADMIN', 'WAREHOUSE']) && (
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search SKU, item name, location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setLowStockOnly(!lowStockOnly);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              lowStockOnly
                ? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span>Low Stock Filter {lowStockOnly ? '(Active)' : ''}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3 text-right">Unit Price</th>
                <th className="px-5 py-3 text-right">Current Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    Loading inventory list...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    No product items found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStockAlert;
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isLowStock ? 'bg-amber-50/60 hover:bg-amber-100/60' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900">{p.sku}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{p.name}</div>
                        {isLowStock && (
                          <div className="text-[10px] font-semibold text-red-600 flex items-center space-x-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>Stock below min threshold ({p.minStockAlert})</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-600">{p.warehouseLocation}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                        {formatINR(p.unitPrice)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs ${
                            isLowStock ? 'bg-red-100 text-red-800 font-extrabold' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.currentStock} units
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {hasRole(['ADMIN', 'WAREHOUSE']) && (
                            <button
                              onClick={() => openAdjustModal(p)}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors flex items-center space-x-1"
                              title="Adjust Stock"
                            >
                              <Boxes className="h-3 w-3" />
                              <span>Adjust</span>
                            </button>
                          )}
                          {hasRole(['ADMIN', 'WAREHOUSE']) && (
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600"
                              title="Edit Product"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {hasRole(['ADMIN']) && (
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
          <span>
            Showing Page {page} of {totalPages} ({total} products)
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1 rounded bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1 rounded bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedAdjustProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-1">Stock Adjustment Log</h3>
            <p className="text-xs text-gray-500 mb-4">
              Item: <span className="font-bold text-gray-800">{selectedAdjustProduct.name}</span> ({selectedAdjustProduct.sku})
            </p>

            {adjustError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setAdjustType('IN')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs flex items-center justify-center space-x-1 ${
                    adjustType === 'IN' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Stock IN (+ Add)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('OUT')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs flex items-center justify-center space-x-1 ${
                    adjustType === 'OUT' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Stock OUT (- Issue)</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Adjustment Reason / Reference</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Purchase Order restock or Damage adjustment"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-600">
                Current: <strong className="text-gray-900">{selectedAdjustProduct.currentStock}</strong> units ➔ New:{' '}
                <strong className={adjustType === 'IN' ? 'text-blue-600' : 'text-red-600'}>
                  {adjustType === 'IN'
                    ? selectedAdjustProduct.currentStock + Number(adjustQty)
                    : selectedAdjustProduct.currentStock - Number(adjustQty)}
                </strong>{' '}
                units.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product Item' : 'Add New Inventory Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Alert Qty *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Warehouse Bin Location *</label>
                <input
                  type="text"
                  required
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  placeholder="e.g. Zone A - Rack 2"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  {editingProduct ? 'Save Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
