import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Auth } from '@/components/Auth'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'

function App() {
  const [session, setSession] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      {!session ? (
        <Auth />
      ) : (
        <div className="min-h-screen bg-slate-50">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Asset Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">{session.email}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  supabase.auth.signOut()
                  sessionStorage.removeItem('vault_password')
                }}
              >
                Sign Out
              </Button>
            </div>
          </header>
          
          <main className="container mx-auto p-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome to your Secure Vault</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Phase 1 is complete. Your connection to Supabase is active, and your End-to-End Encryption engine is ready.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-blue-600 font-bold mb-1">Authenticated</div>
                  <div className="text-xs text-blue-700">Connected to Supabase via {session.email}</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="text-green-600 font-bold mb-1">E2E Ready</div>
                  <div className="text-xs text-green-700">AES-GCM encryption engine is fully functional.</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="text-purple-600 font-bold mb-1">Encrypted Sync</div>
                  <div className="text-xs text-purple-700">Vault password cached for current session.</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  )
}

export default App
