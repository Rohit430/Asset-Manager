import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  generateMasterKey, 
  wrapMasterKey, 
  hashRecoveryKey, 
  unwrapMasterKey 
} from '@/lib/crypto'

export function Auth() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup' | 'recover'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inputRecoveryKey, setInputRecoveryKey] = useState('')
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    
    if (authError || !authData.user) {
      toast.error(authError?.message || 'Login failed')
      setLoading(false)
      return
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wrapped_key')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) throw new Error('Could not fetch security profile')

      const masterKey = await unwrapMasterKey(profile.wrapped_key, password)
      sessionStorage.setItem('master_key', masterKey)
      toast.success('Secure session initialized')
      // Force reload to clear any stale state and trigger App re-render
      // We reload the current URL to ensure we stay on the correct base path
      window.location.href = window.location.href
    } catch (err: any) {
      console.error(err)
      toast.error('Decryption failed. Check your password.')
      await supabase.auth.signOut()
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const mk = generateMasterKey()
      const wrappedKey = await wrapMasterKey(mk, password)
      const recoveryHash = await hashRecoveryKey(mk)

      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            wrapped_key: wrappedKey,
            recovery_hash: recoveryHash
          }
        }
      })

      if (error) throw error

      setRecoveryKey(mk)
      toast.success('Account created!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please sign in first to recover this vault.')

      const { data: profile } = await supabase.from('profiles').select('recovery_hash').eq('id', user.id).single()
      const hashed = await hashRecoveryKey(inputRecoveryKey)
      
      if (hashed !== profile?.recovery_hash) {
        throw new Error('Invalid Recovery Key')
      }

      sessionStorage.setItem('master_key', inputRecoveryKey)
      toast.success('Vault recovered! Set a new password in settings.')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (recoveryKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              Critical Security Step
            </CardTitle>
            <CardDescription className="text-amber-700">
              This is your **Recovery Key**. Save it somewhere very safe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-lg border border-amber-200 font-mono text-xs break-all select-all cursor-pointer">
              {recoveryKey}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => window.location.reload()}>
              I have saved my Recovery Key
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (mode === 'recover') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Recover Vault</CardTitle>
            <CardDescription>Enter your Recovery Key to unlock your data.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecover} className="space-y-4">
              <div className="space-y-2">
                <Label>Recovery Key</Label>
                <Input 
                  placeholder="Paste your key here..." 
                  value={inputRecoveryKey}
                  onChange={e => setInputRecoveryKey(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Unlock Vault'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setMode('login')}>
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-brand-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-900 rounded-b-[3rem] shadow-xl z-0"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-brand-100">
          <div className="flex flex-col items-center mb-8">
            <span className="bg-gradient-to-br from-brand-600 to-brand-800 p-4 rounded-full shadow-lg mb-4 ring-4 ring-brand-100">
              <svg className="h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.035-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.035.84-1.875 1.875-1.875h.75c1.035 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
              </svg>
            </span>
            <h1 className="text-3xl font-bold text-brand-900 tracking-tight">Iris</h1>
            <p className="text-brand-500 font-medium mt-1">Asset Manager</p>
          </div>

          <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode('recover')} className="text-xs text-brand-600 hover:text-brand-800 hover:underline font-medium">
                    Forgot vault password?
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-700 to-brand-900 hover:from-brand-800 hover:to-brand-950 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In securely"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <Label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 mb-1">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-1">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-700 to-brand-900 hover:from-brand-800 hover:to-brand-950 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-center text-brand-800/60 text-xs mt-6">Secured by Iris Infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  )
}