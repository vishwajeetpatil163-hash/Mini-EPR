import React, { useState } from 'react';
import { Search, Bell, Shield, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, onOpenProfile }) => {
  const { user, logout, switchRoleDemo } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SALES':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'WAREHOUSE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACCOUNTS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRoleSwitch = async (role: Role) => {
    setShowRoleMenu(false);
    await switchRoleDemo(role);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Global Search */}
      <div className="flex items-center space-x-6 flex-1 max-w-2xl">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight hidden sm:block">
          Admin Portal
        </h1>

        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Global search customers, SKUs, or challans... (Ctrl + K)"
            className="w-full pl-9 pr-12 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Badge, Notifications, User Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${getRoleBadgeColor(
              user?.role
            )} hover:shadow-sm`}
            title="Click to switch test role"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{user?.role ? `${user.role} Role` : 'Role'}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Switch Active Role
              </div>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
              >
                <span>Admin</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Full Access</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('SALES')}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
              >
                <span>Sales</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">CRM / Orders</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('WAREHOUSE')}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center justify-between"
              >
                <span>Warehouse</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Stock / Dispatch</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('ACCOUNTS')}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between"
              >
                <span>Accounts</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Audit / Confirm</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="2 Low Stock Warnings"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium text-xs">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-gray-900">{user?.name || 'User'}</div>
              <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900">{user?.name}</p>
                <p className="text-[11px] text-gray-500">{user?.email}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-1.5 text-[11px] text-gray-500 flex items-center space-x-2">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Role: {user?.role}</span>
                </div>
                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-blue-600" />
                    <span>My Profile / Settings</span>
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
