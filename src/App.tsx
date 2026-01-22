import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Auth } from '@/components/Auth';
import { useData } from '@/hooks/useData';
import { Dashboard } from '@/components/Dashboard';
import { AssetsPage } from '@/pages/AssetsPage';
import { LiquidAssetsPage } from '@/pages/LiquidAssetsPage';
import { AssetDetailsPage } from '@/pages/AssetDetailsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AddPage } from '@/pages/AddPage';
import { ConflictResolver } from '@/components/ConflictResolver';
import { Toaster } from 'sonner';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { assets, transactions, liquidAssets, preferences } = useData();

  const handleExport = async () => {
    const data = {
      assets,
      transactions,
      liquidAssets,
      preferences,
      version: 2,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-fortress-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          console.log('Importing:', data);
          alert('Import feature coming in next update! (Data parsed successfully)');
        } catch (err) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.href = '/Asset-Manager/';
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-sans text-gray-800">
      <header className="glass-header text-white shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-28">
            <Link to="/" className="flex items-center space-x-4 cursor-pointer group">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl ring-1 ring-white/30 group-hover:scale-105 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Iris</h1>
                <p className="text-sm text-brand-100 font-medium">Asset Manager</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/add" className="hidden sm:block">
                <button className="bg-white text-brand-800 hover:bg-brand-50 font-bold py-2 px-4 rounded-lg shadow-md transition-all flex items-center space-x-2 border border-brand-100 group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:rotate-90">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Add Asset</span>
                </button>
              </Link>

              <Link to="/add" className="sm:hidden">
                 <button className="bg-white text-brand-800 p-2 rounded-lg shadow-md group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:rotate-90">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
              </Link>
              
              <div className="h-8 w-px bg-brand-400/30 mx-2 hidden sm:block"></div>

              <Link to="/liquid" title="Liquid Assets" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-brand-50 group hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:-translate-y-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0A2.25 2.25 0 0 0 18.75 9.75H5.25A2.25 2.25 0 0 0 3 12m18 0v-6A2.25 2.25 0 0 0 18.75 3.75H5.25A2.25 2.25 0 0 0 3 6v6" />
                </svg>
              </Link>

              <Link to="/transactions" title="All Transactions" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-brand-50 group hidden sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:scale-110">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </Link>

              <Link to="/settings" title="Settings" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-brand-50 group">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:rotate-90">
                    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                </svg>
              </Link>

              <div className="flex items-center bg-brand-900/40 rounded-lg p-1 space-x-1 hidden sm:flex">
                 <button onClick={handleExport} title="Export Data" className="p-1.5 rounded hover:bg-white/20 transition-colors text-brand-100 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:-translate-y-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                </button>
                <button onClick={handleImport} title="Import Data" className="p-1.5 rounded hover:bg-white/20 transition-colors text-brand-100 group">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:translate-y-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M13.5 12l-1.5 1.5m0 0l-1.5-1.5m1.5 1.5V3" />
                    </svg>
                </button>
              </div>

              <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg hover:bg-brand-900 transition-colors text-brand-200 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 transition-transform duration-500 ease-in-out group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-1.5-3-3m0 0 3-3m-3 3H21" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-violet-400 via-fuchsia-500 to-purple-500"></div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {children}
      </main>

      <footer className="bg-brand-900 text-white border-t border-brand-800 relative z-10">
        <div className="h-1 bg-gradient-to-r from-violet-400 via-fuchsia-500 to-purple-500"></div>
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-brand-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold tracking-tight">Iris</span>
              </div>
              <p className="text-brand-200 text-sm leading-relaxed">
                Secure, private, and offline-first asset management. Track your investments and liquid assets with complete peace of mind.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-brand-100">Quick Links</h4>
              <ul className="space-y-3 text-sm text-brand-200">
                <li><Link to="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">Dashboard</Link></li>
                <li><Link to="/transactions" className="hover:text-white hover:translate-x-1 transition-all inline-block">Transactions</Link></li>
                <li><Link to="/liquid" className="hover:text-white hover:translate-x-1 transition-all inline-block">Liquid Assets</Link></li>
                <li><Link to="/settings" className="hover:text-white hover:translate-x-1 transition-all inline-block">Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-brand-100">Portfolios</h4>
              <ul className="space-y-3 text-sm text-brand-200">
                {(preferences?.categories || ["Equity", "Mutual Funds", "Real Estate", "Commodity", "Bonds"]).slice(0,5).map(c => (
                  <li key={c}><Link to={`/assets?category=${encodeURIComponent(c)}`} className="hover:text-white hover:translate-x-1 transition-all inline-block">{c}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6 text-brand-100">Actions</h4>
              <div className="space-y-3">
                <Link to="/add" className="w-full bg-brand-700 hover:bg-brand-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  New Asset
                </Link>
                <button onClick={handleExport} className="w-full bg-transparent border border-brand-700 hover:bg-brand-800 text-brand-100 py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Backup Data
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-brand-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-brand-400">
            <p>&copy; 2025 Iris Asset Manager. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Fortress Architecture &bull; End-to-End Encrypted &bull; Secure</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(!!sessionStorage.getItem('master_key'));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial Session:', session?.user?.id);
      setSession(session);
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth Change:', _event, session?.user?.id);
      setSession(session);
      if (_event === 'SIGNED_OUT') {
        setIsVaultUnlocked(false);
        sessionStorage.removeItem('master_key');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) return <div className="h-screen flex items-center justify-center">Loading Fortress...</div>;

  if (!session || !isVaultUnlocked) {
    // Session exists but vault is locked (or key is being derived)
    // Don't sign out, just show the Auth screen to allow unlocking/login completion
    return (
      <>
        <Toaster />
        <Auth onUnlock={() => setIsVaultUnlocked(true)} session={session} />
      </>
    );
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
