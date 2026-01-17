import { useMemo, useState } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rebuildAssetMetrics } from '@/lib/fifo';
import { Search, Plus, Filter, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AssetsPage() {
  const { assets, transactions, loading } = useData();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const processedAssets = useMemo(() => {
    return assets.map(asset => {
      const assetTxs = transactions.filter(t => t.asset_id === asset.id);
      return rebuildAssetMetrics(asset, assetTxs);
    }).filter(a => a.totalQuantity > 0.0001); // Only show active holdings
  }, [assets, transactions]);

  const filteredAssets = useMemo(() => {
    return processedAssets.filter(a => 
      a.data.name.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => b.totalCost - a.totalCost);
  }, [processedAssets, search]);

  if (loading) return <div className="p-8 text-center text-slate-500">Decrypting assets...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Assets</h2>
          <p className="text-muted-foreground">Detailed breakdown of current holdings</p>
        </div>
        <Button onClick={() => navigate('/add')} className="gap-2">
          <Plus className="w-4 h-4" /> New Investment
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search assets by name or type..." 
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map(asset => (
          <Card key={asset.id} className="group hover:border-blue-200 transition-colors cursor-pointer" onClick={() => navigate(`/assets/${asset.id}`)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="secondary" className="mb-2">
                    {asset.type}
                  </Badge>
                  <CardTitle className="text-xl">{asset.data.name}</CardTitle>
                </div>
                <span className="text-2xl">{asset.country === 'India' ? '🇮🇳' : '🇺🇸'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{asset.totalQuantity.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg. Price</p>
                  <p className="font-semibold">₹{asset.avgBuyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="col-span-2 pt-2 border-t mt-2 flex justify-between items-end">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Total Cost</p>
                    <p className="text-lg font-bold text-blue-600">₹{asset.totalCost.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No assets found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new investment.</p>
        </div>
      )}
    </div>
  );
}
