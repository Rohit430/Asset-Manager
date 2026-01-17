import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings, PlusCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    { icon: PlusCircle, label: 'Add', path: '/add', highlight: true }, // Mobile FAB logic
    { icon: ArrowRightLeft, label: 'Activity', path: '/transactions' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white dark:bg-slate-900 p-4 shadow-sm fixed h-full z-20">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Asset Fortress
          </h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.filter(i => i.label !== 'Add').map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full justify-start gap-3 ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-4">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t flex justify-around p-2 z-50 safe-area-pb">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.highlight) {
            return (
              <Link key={item.path} to={item.path} className="-mt-8">
                <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
              </Link>
            )
          }
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 min-w-[64px] ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
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
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;