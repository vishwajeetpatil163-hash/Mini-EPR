import React, { useState } from 'react';
import { Boxes, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@wholesale.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickRole = (role: Role) => {
    const creds: Record<Role, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@wholesale.com', pass: 'admin123' },
      SALES: { email: 'sales@wholesale.com', pass: 'sales123' },
      WAREHOUSE: { email: 'warehouse@wholesale.com', pass: 'warehouse123' },
      ACCOUNTS: { email: 'accounts@wholesale.com', pass: 'accounts123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10">
        {/* Header Branding */}
        <div className="bg-slate-950 p-8 text-center text-white relative">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
            <Boxes className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Wholesale ERP Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Operations & CRM Management</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@wholesale.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Fillers for Testing & Demo */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>Demo Quick Login Roles</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickRole('ADMIN')}
                className="p-2 text-xs text-left rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-100 transition-colors"
              >
                <div className="font-semibold text-blue-900">Admin Staff</div>
                <div className="text-[10px] text-blue-600">Full Access</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickRole('SALES')}
                className="p-2 text-xs text-left rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 transition-colors"
              >
                <div className="font-semibold text-emerald-900">Sales Rep</div>
                <div className="text-[10px] text-emerald-600">CRM / Challans</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickRole('WAREHOUSE')}
                className="p-2 text-xs text-left rounded-lg border border-amber-100 bg-amber-50/50 hover:bg-amber-100 transition-colors"
              >
                <div className="font-semibold text-amber-900">Warehouse</div>
                <div className="text-[10px] text-amber-600">Stock & Audit</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickRole('ACCOUNTS')}
                className="p-2 text-xs text-left rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 transition-colors"
              >
                <div className="font-semibold text-purple-900">Accounts</div>
                <div className="text-[10px] text-purple-600">Challan Confirm</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
