import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  X,
  User,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { SalesChallan } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';

interface ChallansPageProps {
  onCreateNewChallan: () => void;
}

export const ChallansPage: React.FC<ChallansPageProps> = ({ onCreateNewChallan }) => {
  const { hasRole } = useAuth();
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Challan Detail
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Stock Conflict Error Modal
  const [stockConflictError, setStockConflictError] = useState<{
    message: string;
    details?: { name: string; sku: string; requested: number; available: number }[];
  } | null>(null);

  // Print Invoice Modal View
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const data = await api.getChallans({
        page,
        limit: 8,
        q: search,
        status: statusFilter,
      });
      setChallans(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      if (data.items.length > 0 && !selectedChallan) {
        handleSelectChallan(data.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, search, statusFilter]);

  const handleSelectChallan = async (id: string) => {
    try {
      const full = await api.getChallanById(id);
      setSelectedChallan(full);
    } catch (err) {
      console.error('Failed to get challan detail:', err);
    }
  };

  const handleConfirmChallan = async () => {
    if (!selectedChallan) return;
    setActionLoading(true);
    setStockConflictError(null);

    try {
      const res = await api.confirmChallan(selectedChallan.id);
      setSelectedChallan(res.challan);
      fetchChallans();
    } catch (err: any) {
      if (err.status === 409) {
        setStockConflictError({
          message: err.message || 'Insufficient stock to confirm this sales challan.',
          details: err.shortageDetails,
        });
      } else {
        alert(err.message || 'Failed to confirm sales challan.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!selectedChallan) return;
    if (!confirm(`Are you sure you want to cancel Challan #${selectedChallan.challanNumber}?`)) return;

    setActionLoading(true);
    try {
      const res = await api.cancelChallan(selectedChallan.id);
      setSelectedChallan(res.challan);
      fetchChallans();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel sales challan.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <span>Sales Challans & Dispatch Master</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Issue draft sales orders, run stock validation transactions, and manage delivery challans.
          </p>
        </div>

        {hasRole(['ADMIN', 'SALES', 'ACCOUNTS']) && (
          <button
            onClick={onCreateNewChallan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Challan</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
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
            placeholder="Search Challan # or Customer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
          {['All', 'DRAFT', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Split Master-Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Master List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 font-bold text-xs text-gray-700 bg-gray-50/60">
            Sales Challans List ({total})
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[600px] flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading sales challans...</div>
            ) : challans.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">No sales challans found.</div>
            ) : (
              challans.map((c) => {
                const isSelected = selectedChallan?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectChallan(c.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-gray-900">{c.challanNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-gray-800">{c.customerName}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center justify-between">
                      <span>{c.totalQuantity} items</span>
                      <span className="font-bold text-gray-900">{formatINR(c.totalAmount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
            <span>
              Page {page} of {totalPages}
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

        {/* Detail View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          {selectedChallan ? (
            <div className="space-y-6">
              {/* Detail Header & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-extrabold text-gray-900 font-mono">
                      #{selectedChallan.challanNumber}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedChallan.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedChallan.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedChallan.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Issued on {new Date(selectedChallan.createdAt).toLocaleString()} by{' '}
                    <strong>{selectedChallan.createdBy}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-1"
                  >
                    <Printer className="h-3.5 w-3.5 text-gray-500" />
                    <span>Print Invoice</span>
                  </button>

                  {selectedChallan.status === 'DRAFT' && hasRole(['ADMIN', 'ACCOUNTS', 'WAREHOUSE']) && (
                    <button
                      disabled={actionLoading}
                      onClick={handleConfirmChallan}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{actionLoading ? 'Verifying Stock...' : 'Confirm & Deduct Stock'}</span>
                    </button>
                  )}

                  {selectedChallan.status !== 'CANCELLED' && hasRole(['ADMIN', 'SALES', 'ACCOUNTS']) && (
                    <button
                      disabled={actionLoading}
                      onClick={handleCancelChallan}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Customer Details
                  </div>
                  <div className="font-bold text-gray-900">{selectedChallan.customerName}</div>
                  <div className="text-gray-600 font-medium">{selectedChallan.customerBusiness}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">{selectedChallan.customerEmail}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Delivery Address & Remarks
                  </div>
                  <div className="text-gray-800">{selectedChallan.deliveryAddress || 'Standard Warehouse Pickup'}</div>
                  {selectedChallan.remarks && (
                    <div className="text-[11px] text-gray-500 mt-1 italic">"{selectedChallan.remarks}"</div>
                  )}
                </div>
              </div>

              {/* Snapshot Line Items Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Line Items (Historical Snapshot Data)
                </h4>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5">Item Description</th>
                        <th className="px-4 py-2.5">SKU</th>
                        <th className="px-4 py-2.5 text-right">Unit Price</th>
                        <th className="px-4 py-2.5 text-right">Quantity</th>
                        <th className="px-4 py-2.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedChallan.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{item.productNameSnapshot}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{item.skuSnapshot}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{formatINR(item.unitPriceSnapshot)}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {formatINR(item.unitPriceSnapshot * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50/80 border-t border-gray-200 font-bold text-gray-900">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right uppercase text-[10px] text-gray-500">
                          Grand Total:
                        </td>
                        <td className="px-4 py-3 text-right text-blue-600">{selectedChallan.totalQuantity} units</td>
                        <td className="px-4 py-3 text-right text-blue-600">
                          {formatINR(selectedChallan.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Logistics Timeline */}
              <div className="pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Dispatch & Logistics Status
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div className="flex items-center space-x-2 text-blue-600 font-bold">
                    <FileText className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-blue-200 mx-2"></div>

                  <div
                    className={`flex items-center space-x-2 font-bold ${
                      selectedChallan.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Stock Verified</span>
                  </div>
                  <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>

                  <div
                    className={`flex items-center space-x-2 font-bold ${
                      selectedChallan.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    <span>Dispatched</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-gray-400 text-xs">Select a sales challan from the list to view details.</div>
          )}
        </div>
      </div>

      {/* Stock Conflict Error Modal (HTTP 409) */}
      {stockConflictError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 relative">
            <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900">Stock Availability Conflict (409)</h3>
            <p className="text-xs text-gray-600 mt-1">{stockConflictError.message}</p>

            {stockConflictError.details && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-xs space-y-2">
                <div className="font-semibold text-red-900">Shortage Breakdown:</div>
                {stockConflictError.details.map((d, i) => (
                  <div key={i} className="text-[11px] text-red-800 flex justify-between border-b border-red-100 pb-1">
                    <span>
                      {d.name} ({d.sku})
                    </span>
                    <span className="font-bold">
                      Requested: {d.requested} | Avail: {d.available}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setStockConflictError(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Acknowledge & Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal View */}
      {showPrintModal && selectedChallan && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-6">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">Sales Delivery Challan</h1>
                <p className="text-xs text-slate-500 font-medium">Wholesale Distribution Portal HQ</p>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold font-mono text-slate-900">#{selectedChallan.challanNumber}</div>
                <div className="text-xs text-slate-500">{new Date(selectedChallan.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Billed To / Shipped To */}
            <div className="grid grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Billed Customer</div>
                <div className="font-bold text-slate-900 text-sm">{selectedChallan.customerName}</div>
                <div className="text-slate-600">{selectedChallan.customerBusiness}</div>
                <div className="text-slate-500">{selectedChallan.customerEmail}</div>
              </div>
              <div>
                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Dispatch Destination</div>
                <div className="text-slate-800">{selectedChallan.deliveryAddress}</div>
                <div className="text-slate-500 mt-1">Status: {selectedChallan.status}</div>
              </div>
            </div>

            {/* Invoice Table */}
            <table className="w-full text-left text-xs mb-6 border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedChallan.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-slate-900">{item.productNameSnapshot}</td>
                    <td className="p-3 font-mono text-slate-600">{item.skuSnapshot}</td>
                    <td className="p-3 text-right">{formatINR(item.unitPriceSnapshot)}</td>
                    <td className="p-3 text-right font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-bold">{formatINR(item.unitPriceSnapshot * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Footer */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
              <div className="text-xs text-slate-500">
                Authorized Signature: _______________________
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-bold mr-2">Grand Total:</span>
                <span className="text-lg font-black text-slate-900">{formatINR(selectedChallan.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1"
              >
                <Printer className="h-4 w-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
