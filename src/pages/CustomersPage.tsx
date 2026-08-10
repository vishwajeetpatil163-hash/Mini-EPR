import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  FileText,
  Calendar,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  CreditCard,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { Customer, CustomerStatus, CustomerType, FollowUpNote } from '../types';
import { useAuth } from '../context/AuthContext';

interface CustomersPageProps {
  onCreateChallanForCustomer?: (customerId: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onCreateChallanForCustomer }) => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Selected customer for detail view
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [followUpNotes, setFollowUpNotes] = useState<FollowUpNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [postingNote, setPostingNote] = useState(false);

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'ACTIVE' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers({
        page,
        limit: 8,
        q: search,
        status: statusFilter,
        type: typeFilter,
      });
      setCustomers(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      // Auto-select first customer if none selected
      if (data.items.length > 0 && !selectedCustomer) {
        handleSelectCustomer(data.items[0]);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter, typeFilter]);

  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    try {
      const fullCust = await api.getCustomerById(cust.id);
      setSelectedCustomer(fullCust);
      setFollowUpNotes(fullCust.followUpNotes || []);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    setPostingNote(true);
    try {
      const res = await api.addFollowUpNote(selectedCustomer.id, newNote);
      setFollowUpNotes([res.note, ...followUpNotes]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setPostingNote(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const updated = await api.updateCustomer(editingCustomer.id, formData);
        if (selectedCustomer?.id === editingCustomer.id && updated) {
          setSelectedCustomer(updated);
        }
      } else {
        await api.createCustomer(formData);
      }
      setShowAddModal(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to save customer.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await api.deleteCustomer(id);
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer.');
    }
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email,
      businessName: cust.businessName,
      gstNumber: cust.gstNumber || '',
      customerType: cust.customerType,
      address: cust.address,
      status: cust.status,
      followUpDate: cust.followUpDate || '',
      notes: cust.notes || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      address: '',
      status: 'ACTIVE',
      followUpDate: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Customer CRM Directory</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage wholesale accounts, distributors, retail leads, and follow-up interaction history.
          </p>
        </div>

        {hasRole(['ADMIN', 'SALES']) && (
          <button
            onClick={() => {
              resetForm();
              setEditingCustomer(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Customer</span>
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
            placeholder="Search name, phone, or business..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg text-xs">
            {['All', 'ACTIVE', 'LEAD', 'INACTIVE'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="RETAIL">Retail</option>
          </select>
        </div>
      </div>

      {/* Split View: Customers Table & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Customer / Business</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No customer records found matching filter.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const isSelected = selectedCustomer?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50/80'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{c.name}</div>
                          <div className="text-[11px] text-gray-500">{c.businessName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-800 font-medium">{c.mobile}</div>
                          <div className="text-[10px] text-gray-400">{c.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                            {c.customerType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'LEAD'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                            {hasRole(['ADMIN', 'SALES']) && (
                              <button
                                onClick={() => openEditModal(c)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                title="Edit Customer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {hasRole(['ADMIN']) && (
                              <button
                                onClick={() => handleDeleteCustomer(c.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Delete Customer"
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
              Showing Page {page} of {totalPages} ({total} total records)
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

        {/* Customer Detail & Follow-Up Notes Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col h-full">
          {selectedCustomer ? (
            <div className="space-y-5 flex-1 flex flex-col">
              {/* Profile Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {selectedCustomer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{selectedCustomer.businessName}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {selectedCustomer.customerType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          selectedCustomer.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>

                {onCreateChallanForCustomer && (
                  <button
                    onClick={() => onCreateChallanForCustomer(selectedCustomer.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Order</span>
                  </button>
                )}
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-700 font-medium">{selectedCustomer.mobile}</span>
                </div>
                <div className="flex items-center space-x-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-700 truncate">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-700">GST: {selectedCustomer.gstNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-700">Next Follow-up: {selectedCustomer.followUpDate || 'None'}</span>
                </div>
                <div className="col-span-2 flex items-start space-x-2 border-t border-gray-200/60 pt-2 mt-1">
                  <Building className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-[11px]">{selectedCustomer.address}</span>
                </div>
              </div>

              {/* Follow-up Notes Timeline */}
              <div className="flex-1 flex flex-col min-h-[220px]">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>CRM Follow-Up & Log History</span>
                </h4>

                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] pr-1">
                  {followUpNotes.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">No interaction notes recorded yet.</div>
                  ) : (
                    followUpNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                          <span className="font-semibold text-gray-700">{note.createdBy}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Input */}
                {hasRole(['ADMIN', 'SALES']) && (
                  <form onSubmit={handleAddNote} className="mt-3 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add follow-up call note or log..."
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={postingNote || !newNote.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 text-xs">Select a customer to view complete CRM profile.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
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
              {editingCustomer ? 'Edit Customer Details' : 'Add New Customer Account'}
            </h3>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WHOLESALE">WHOLESALE</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                    <option value="RETAIL">RETAIL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LEAD">LEAD</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
