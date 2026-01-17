import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
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
    // Redirect to the base path (home) to ensure we don't end up on a 404
    window.location.href = '/Asset-Manager/';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Header */}
      <header className="gradient-header sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </span>
              <h1 className="text-xl font-semibold tracking-wide">Asset Manager</h1>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(i => i.label !== 'Add').map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant="ghost" 
                      className={`text-indigo-100 hover:text-white hover:bg-white/10 ${isActive ? 'bg-white/20 text-white shadow-sm' : ''}`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              <div className="h-6 w-px bg-white/20 mx-2" />
              <Button variant="ghost" size="icon" className="text-indigo-100 hover:text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Menu Button (Placeholder) */}
            <div className="md:hidden">
               {/* We keep the bottom nav for mobile as it is better UX, but style it to match */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Nav - Styled to match theme */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-indigo-100 flex justify-around p-2 z-50 safe-area-pb shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.highlight) {
            return (
              <Link key={item.path} to={item.path} className="-mt-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform border-4 border-slate-50">
                  <item.icon className="w-6 h-6" />
                </div>
              </Link>
            )
          }
          return (
            <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 min-w-[64px] ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
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