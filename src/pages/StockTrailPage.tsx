import React, { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Boxes } from 'lucide-react';
import { api } from '../services/api';
import { StockMovement } from '../types';

export const StockTrailPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTrail = async () => {
    setLoading(true);
    try {
      const data = await api.getAllStockMovements({ page, limit: 12 });
      setMovements(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load stock movements audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrail();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <History className="h-5 w-5 text-blue-600" />
            <span>Stock Movements Audit Ledger</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable log of all inventory changes, manual restocks, sales deductions, and reversals.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Movement Type</th>
                <th className="px-5 py-3 text-right">Quantity</th>
                <th className="px-5 py-3">Reason / Reference</th>
                <th className="px-5 py-3">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    Loading stock audit ledger...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isIn = m.movementType === 'IN';
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">{m.productName}</td>
                      <td className="px-5 py-3.5 font-mono text-gray-600">{m.productSku}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIn ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isIn ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                          <span>{m.movementType}</span>
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-extrabold ${isIn ? 'text-blue-600' : 'text-red-600'}`}>
                        {isIn ? `+${m.quantityChanged}` : m.quantityChanged}
                      </td>
                      <td className="px-5 py-3.5 text-gray-800 font-medium">{m.reason}</td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">{m.createdBy}</td>
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
            Showing Page {page} of {totalPages} ({total} audit logs)
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
    </div>
  );
};
