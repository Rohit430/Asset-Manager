import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Banknote, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export function LiquidAssetsPage() {
  const { liquidAssets, loading } = useData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const cash = liquidAssets.filter(a => a.type === 'Cash').reduce((acc, a) => acc + (a.data.amount || 0), 0);
    const fd = liquidAssets.filter(a => a.type === 'FD').reduce((acc, a) => acc + (a.data.amount || 0), 0);
    return { cash, fd, total: cash + fd };
  }, [liquidAssets]);

  if (loading) return <div className="p-8 text-center">Loading liquid assets...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Liquid Assets</h2>
          <p className="text-muted-foreground">Cash, Savings, and Fixed Deposits</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            onClick={() => navigate('/')}
          >
            &larr; Back to Dashboard
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all gap-2" onClick={() => navigate('/add?tab=liquid')}>
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="w-4 h-4 text-blue-600" /> Total Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">₹{stats.cash.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" /> Total FDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">₹{stats.fd.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Liquid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.total.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cash" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="cash">Cash & Savings</TabsTrigger>
          <TabsTrigger value="fd">Fixed Deposits</TabsTrigger>
        </TabsList>

        <TabsContent value="cash" className="space-y-4 pt-4">
          <div className="grid gap-4">
            {liquidAssets.filter(a => a.type === 'Cash').map(asset => (
              <Card key={asset.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">{asset.data.bankName}</h4>
                      <p className="text-xs text-muted-foreground">{asset.data.notes || 'No notes'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{asset.data.amount.toLocaleString('en-IN')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {liquidAssets.filter(a => a.type === 'Cash').length === 0 && (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
                No cash entries found.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fd" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {liquidAssets.filter(a => a.type === 'FD').map(asset => (
              <Card key={asset.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{asset.data.bankName}</Badge>
                    <span className="text-xs font-mono text-muted-foreground">{asset.data.endDate}</span>
                  </div>
                  <CardTitle className="text-lg pt-2">{asset.data.holderName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground">Interest: {asset.data.interestRate}%</p>
                      <p className="text-lg font-bold">₹{asset.data.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Maturity</p>
                      <p className="font-semibold text-emerald-600">₹{asset.data.maturityAmount?.toLocaleString('en-IN') || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {liquidAssets.filter(a => a.type === 'FD').length === 0 && (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl col-span-2">
                No FD entries found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}