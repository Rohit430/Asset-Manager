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
      <button 
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 mb-4"
        onClick={() => navigate('/assets')}
      >
        <ChevronLeft className="w-4 h-4" /> Back to Assets
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">{asset.type}</Badge>
          <h2 className="text-4xl font-bold text-gray-900">{asset.data.name}</h2>
          <p className="text-gray-500">{asset.country} Portfolio</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase tracking-wider">Total Value</p>
          <p className="text-3xl font-bold text-blue-600">₹{metrics.totalCost.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="blurred-card p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Quantity</h4>
            <p className="text-xl font-bold text-gray-900">{metrics.totalQuantity.toFixed(4)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Avg. Buy Price</h4>
            <p className="text-xl font-bold text-gray-900">₹{metrics.avgBuyPrice.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Cost</h4>
            <p className="text-xl font-bold text-gray-900">₹{metrics.totalCost.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Realized P/L</h4>
            <p className={`text-xl font-bold ${metrics.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{metrics.realizedPL.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
        <div className="blurred-card rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net P/L</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {txs.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{format(new Date(tx.tx_date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">{tx.data.quantity.toFixed(4)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {tx.data.currency !== 'INR' && (
                        <div className="text-[10px] text-gray-400">
                          {tx.data.currency} {tx.data.originalPrice?.toLocaleString()}
                        </div>
                      )}
                      ₹{tx.data.price.toLocaleString('en-IN')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${tx.data.netProfit && tx.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.data.netProfit ? `₹${tx.data.netProfit.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button 
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        onClick={() => navigate(`/add?tab=transaction&editId=${tx.id}`)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {txs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
