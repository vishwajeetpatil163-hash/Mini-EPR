import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Building,
  Boxes,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { Customer, Product } from '../types';
import { formatINR } from '../utils/format';

interface CreateChallanPageProps {
  initialCustomerId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormItemRow {
  productId: string;
  quantity: number;
  product?: Product;
}

export const CreateChallanPage: React.FC<CreateChallanPageProps> = ({
  initialCustomerId,
  onCancel,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<FormItemRow[]>([{ productId: '', quantity: 1 }]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.getCustomers({ limit: 100 }),
          api.getProducts({ limit: 100 }),
        ]);

        setCustomers(custRes.items);
        setProducts(prodRes.items);

        // Pre-select customer if provided
        if (initialCustomerId) {
          const found = custRes.items.find((c) => c.id === initialCustomerId);
          if (found) {
            setSelectedCustomerId(found.id);
            setDeliveryAddress(found.address);
          }
        } else if (custRes.items.length > 0) {
          setSelectedCustomerId(custRes.items[0].id);
          setDeliveryAddress(custRes.items[0].address);
        }

        // Initialize first product row if available
        if (prodRes.items.length > 0) {
          setItems([{ productId: prodRes.items[0].id, quantity: 1, product: prodRes.items[0] }]);
        }
      } catch (err) {
        console.error('Failed to load initial form data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialCustomerId]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setDeliveryAddress(cust.address);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      product: prod,
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(1, qty),
    };
    setItems(updated);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setItems([...items, { productId: firstProd ? firstProd.id : '', quantity: 1, product: firstProd }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let totalQty = 0;
    let totalAmt = 0;

    for (const row of items) {
      if (row.product) {
        totalQty += row.quantity;
        totalAmt += row.product.unitPrice * row.quantity;
      }
    }

    return { totalQty, totalAmt };
  };

  const handleSubmit = async (targetStatus: 'DRAFT' | 'CONFIRMED') => {
    if (!selectedCustomerId) {
      setError('Please select a valid customer.');
      return;
    }

    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      setError('Please ensure all line items have a valid product selected.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.createChallan({
        customerId: selectedCustomerId,
        deliveryAddress,
        remarks,
        status: targetStatus,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create sales challan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading sales challan creation form...
      </div>
    );
  }

  const { totalQty, totalAmt } = calculateTotals();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              <span>Create New Sales Delivery Challan</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Draft sales order lines, check live warehouse stock availability, and issue delivery challan.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 text-xs">
        {/* Customer & Address Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Select Customer Account *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.businessName} ({c.customerType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Delivery Destination Address *</label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Full shipping / warehouse location address"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 mb-1">Dispatch Notes / Special Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Urgent handling, fragile goods, driver contact phone..."
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Line Items Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Line Items Entry</h3>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg font-semibold flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5">Product Selection</th>
                  <th className="px-4 py-2.5">Warehouse Stock Availability</th>
                  <th className="px-4 py-2.5 text-right">Unit Price</th>
                  <th className="px-4 py-2.5 text-right w-28">Quantity</th>
                  <th className="px-4 py-2.5 text-right">Line Total</th>
                  <th className="px-4 py-2.5 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row, index) => {
                  const prod = row.product;
                  const isStockShortage = prod ? row.quantity > prod.currentStock : false;

                  return (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <select
                          value={row.productId}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        {prod ? (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                isStockShortage
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {prod.currentStock} available in {prod.warehouseLocation}
                            </span>
                            {isStockShortage && (
                              <span className="text-[10px] text-red-600 font-bold">Shortage!</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Select product</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {prod ? formatINR(prod.unitPrice) : '₹0.00'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 border border-gray-200 rounded-lg text-right font-bold focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {prod ? formatINR(prod.unitPrice * row.quantity) : '₹0.00'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          disabled={items.length <= 1}
                          className="p-1 hover:bg-red-100 text-red-600 rounded disabled:opacity-30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right uppercase text-[10px] text-gray-500">
                    Grand Order Totals:
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">{totalQty} units</td>
                  <td className="px-4 py-3 text-right text-blue-700 text-sm">{formatINR(totalAmt)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('DRAFT')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('CONFIRMED')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{saving ? 'Processing Transaction...' : 'Confirm & Generate Sales Challan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
