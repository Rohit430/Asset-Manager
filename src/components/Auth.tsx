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
      window.location.reload()
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg mb-4">
            <WalletIcon />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Asset Manager</CardTitle>
          <CardDescription>
            Secure your assets with professional-grade E2E encryption.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setMode('recover')} className="text-xs text-blue-600 hover:underline">
                    Forgot vault password?
                  </button>
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-slate-500">By continuing, you agree to our terms.</p>
        </CardFooter>
      </Card>
    </div>
  )
}

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}