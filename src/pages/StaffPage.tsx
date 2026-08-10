import React, { useState } from 'react';
import { UserPlus, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Role } from '../types';

export const StaffPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('SALES');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.registerStaff({ name, email, password, role });
      setMessage({ type: 'success', text: `Staff user '${res.user.name}' created with role '${res.user.role}'.` });
      setName('');
      setEmail('');
      setPassword('');
      setRole('SALES');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create staff account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          <span>Staff & User Role Administration</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Provision internal staff user accounts for Sales, Warehouse, Accounts, or Admin teams with RBAC privileges.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-xs">
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg border flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Harrison"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Work Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@wholesale.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Initial Temporary Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Assign Operational Role *</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { r: 'ADMIN' as Role, desc: 'Full System & User Control' },
                { r: 'SALES' as Role, desc: 'CRM, Customers, Draft Challans' },
                { r: 'WAREHOUSE' as Role, desc: 'Products, Stock Movements & Dispatch' },
                { r: 'ACCOUNTS' as Role, desc: 'Challan Confirm & Audit Trail' },
              ].map(({ r, desc }) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    role === r
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-gray-900 flex items-center justify-between">
                    <span>{r}</span>
                    <Shield className={`h-3.5 w-3.5 ${role === r ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Provision Staff User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
