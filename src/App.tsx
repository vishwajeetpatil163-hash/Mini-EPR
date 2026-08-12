import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { StockTrailPage } from './pages/StockTrailPage';
import { ChallansPage } from './pages/ChallansPage';
import { CreateChallanPage } from './pages/CreateChallanPage';
import { StaffPage } from './pages/StaffPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab | 'create-challan'>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [prefilledCustomerId, setPrefilledCustomerId] = useState<string | undefined>(undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-sm flex items-center space-x-3">
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <span>Loading Wholesale Portal Environment...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleCreateChallanForCustomer = (customerId: string) => {
    setPrefilledCustomerId(customerId);
    setActiveTab('create-challan');
  };

  const handleCreateNewChallan = () => {
    setPrefilledCustomerId(undefined);
    setActiveTab('create-challan');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab === 'create-challan' ? 'challans' : (activeTab as NavTab)}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenProfile={() => setActiveTab('profile')}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'customers' && (
            <CustomersPage onCreateChallanForCustomer={handleCreateChallanForCustomer} />
          )}

          {activeTab === 'products' && <ProductsPage />}

          {activeTab === 'stock-trail' && <StockTrailPage />}

          {activeTab === 'challans' && (
            <ChallansPage onCreateNewChallan={handleCreateNewChallan} />
          )}

          {activeTab === 'create-challan' && (
            <CreateChallanPage
              initialCustomerId={prefilledCustomerId}
              onCancel={() => setActiveTab('challans')}
              onSuccess={() => setActiveTab('challans')}
            />
          )}

          {activeTab === 'staff' && <StaffPage />}

          {activeTab === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
