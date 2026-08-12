import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FileSpreadsheet,
  History,
  UserPlus,
  Boxes,
  Building2,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'dashboard' | 'customers' | 'products' | 'stock-trail' | 'challans' | 'staff' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'customers' as NavTab, label: 'Customers (CRM)', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { id: 'products' as NavTab, label: 'Products & Inventory', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'stock-trail' as NavTab, label: 'Stock Audit Trail', icon: History, roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'challans' as NavTab, label: 'Sales Challans', icon: FileSpreadsheet, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { id: 'staff' as NavTab, label: 'Staff & Roles', icon: UserPlus, roles: ['ADMIN'] },
    { id: 'profile' as NavTab, label: 'My Account & Security', icon: Settings, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  const allowedItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/40">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight leading-tight">Wholesale ERP</div>
          <div className="text-[10px] text-slate-400 font-medium">Distribution Operations</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Modules
        </div>

        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          <span className="truncate">HQ Wholesale Dist. Ltd.</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Version 2.4.0</span>
          <span className="text-emerald-400 font-medium flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
