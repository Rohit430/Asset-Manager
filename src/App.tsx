import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings, PlusCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { ConflictResolver } from '@/components/ConflictResolver';

// Placeholder Components (We will build these next)
import { Dashboard } from '@/components/Dashboard';
import { AddPage } from '@/pages/AddPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { AssetDetailsPage } from '@/pages/AssetDetailsPage';
import { LiquidAssetsPage } from '@/pages/LiquidAssetsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Assets', path: '/assets' },
    { icon: PlusCircle, label: 'Add', path: '/add', highlight: true },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.href = '/Asset-Manager/';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header matching original prototype */}
      <header className="gradient-header text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="bg-white p-2 rounded-lg shadow">
                <Wallet className="h-6 w-6 text-indigo-700" />
              </span>
              <h1 className="text-xl font-semibold">Asset Manager</h1>
            </div>
            
            {/* Desktop Navigation - Exact Match to HTML */ }
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/add">
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5" />
                  <span>New Transaction</span>
                </button>
              </Link>
              
              <Link to="/liquid" title="Liquid Assets" className="text-indigo-100 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0A2.25 2.25 0 0 0 18.75 9.75H5.25A2.25 2.25 0 0 0 3 12m18 0v-6A2.25 2.25 0 0 0 18.75 3.75H5.25A2.25 2.25 0 0 0 3 6v6" />
                </svg>
              </Link>

              <Link to="/transactions" title="All Transactions" className="text-indigo-100 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </Link>

              <button title="Export Data" className="text-indigo-100 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </button>

              <Link to="/settings" title="Settings" className="text-indigo-100 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.002 1.13-1.226 1.13-1.226 2.403.09 2.403 1.226v.292c.318.078.636.17 1.002.27 1.13.303 1.386 1.83.606 2.61l-.25.25c-.44.44-.7.99-.7 1.61v.293c0 .69.56 1.25 1.25 1.25h.293c1.136 0 2.305 1.17 1.226 2.403-.224.57-.684 1.04-1.226 1.13v.292c0 1.136-1.273 2.403-2.403 1.226-.542-.09-1.002-.56-1.226-1.13a11.962 11.962 0 0 1-2.7 1.002c-1.13.303-1.83.606-2.61.606l-.25-.25c-.44-.44-.99-.7-1.61-.7h-.293c-.69 0-1.25.56-1.25 1.25v.293c0 1.136-1.17 2.305-2.403 1.226-.57-.224-1.04-.684-1.13-1.226v-.292c-.078-.318-.17-.636-.27-1.002-.303-1.13-.606-1.83.606-2.61l.25-.25c.44.44.7-.99.7-1.61v-.293c0-.69-.56-1.25-1.25-1.25h-.293c-1.136 0-2.305-1.17-1.226-2.403.224.57.684 1.04 1.226-1.13v-.292c0-1.136 1.273 2.403 2.403 1.226.542.09 1.002.56 1.226 1.13.938-.198 1.82-.51 2.7-1.002Z M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
                </svg>
              </Link>

              <button onClick={handleLogout} title="Logout" className="text-indigo-100 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-1.5-3-3m0 0 3-3m-3 3H21" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 shadow-lg safe-area-pb">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.highlight) {
            return (
              <Link key={item.path} to={item.path} className="-mt-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
              </Link>
            )
          }
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 min-w-[64px] ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) return <div className="h-screen flex items-center justify-center">Loading Fortress...</div>;

  if (!session) {
    return (
      <>
        <Toaster />
        <Auth />
      </>
    );
  }

  // Check if Master Key is unlocked
  const isUnlocked = sessionStorage.getItem('master_key');
  if (!isUnlocked) {
    // If logged in but MK missing (refresh), we need to re-enter password.
    // We can reuse the Auth component but force it to Login state, 
    // or typically we just sign them out to force a clean login flow for security.
    supabase.auth.signOut();
    return null; 
  }

  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/liquid" element={<LiquidAssetsPage />} />
          <Route path="/assets/:id" element={<AssetDetailsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <ConflictResolver />
      <Toaster />
    </HashRouter>
  );
}

export default App;