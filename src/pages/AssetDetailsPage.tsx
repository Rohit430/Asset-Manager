import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rebuildAssetMetrics } from '@/lib/fifo';
import { ChevronLeft, TrendingUp, TrendingDown, Clock, Tag, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export function AssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assets, transactions, loading } = useData();

  const assetMetrics = useMemo(() => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return null;
    const assetTxs = transactions.filter(t => t.asset_id === asset.id);
    return {
      asset,
      metrics: rebuildAssetMetrics(asset, assetTxs),
      txs: assetTxs.sort((a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime())
    };
  }, [id, assets, transactions]);

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (!assetMetrics) return <div className="p-8 text-center">Asset not found.</div>;

  const { asset, metrics, txs } = assetMetrics;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24">
      <Button variant="ghost" onClick={() => navigate('/assets')} className="gap-2 -ml-2">
        <ChevronLeft className="w-4 h-4" /> Back to Assets
      </Button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge className="mb-2">{asset.type}</Badge>
          <h2 className="text-4xl font-bold">{asset.data.name}</h2>
          <p className="text-muted-foreground">{asset.country} Portfolio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Value</p>
          <p className="text-3xl font-bold text-blue-600">₹{metrics.totalCost.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQuantity.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">units currently owned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Avg. Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.avgBuyPrice.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">per unit (incl. fees)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {metrics.realizedPL >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              Realized P/L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{metrics.realizedPL.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">from past sales</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold pt-4">Transaction History</h3>
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Type</th>
                <th className="p-4 text-right font-medium">Quantity</th>
                <th className="p-4 text-right font-medium">Price</th>
                <th className="p-4 text-right font-medium">Net P/L</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {txs.map(tx => (
                <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">{format(new Date(tx.tx_date), 'MMM dd, yyyy')}</td>
                  <td className="p-4">
                    <Badge variant={tx.type === 'Buy' ? 'secondary' : 'destructive'} className="text-[10px]">
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">{tx.data.quantity.toFixed(4)}</td>
                  <td className="p-4 text-right">
                    {tx.data.currency !== 'INR' && (
                      <div className="text-[10px] text-slate-400">
                        {tx.data.currency} {tx.data.originalPrice?.toLocaleString()}
                      </div>
                    )}
                    ₹{tx.data.price.toLocaleString('en-IN')}
                  </td>
                  <td className={`p-4 text-right font-medium ${tx.data.netProfit && tx.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.data.netProfit ? `₹${tx.data.netProfit.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/add?tab=transaction&editId=${tx.id}`)}>
                      <Edit2 className="w-3 h-3 text-slate-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
