import { useMemo, useState } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rebuildAssetMetrics } from '@/lib/fifo';
import { Search, Plus, ArrowRight, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useSearchParams } from 'react-router-dom';

export function AssetsPage() {
  const { assets, transactions, preferences, loading } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('category') || 'All');

  const processedAssets = useMemo(() => {
    return assets.map(asset => {
      const assetTxs = transactions.filter(t => t.asset_id === asset.id);
      return rebuildAssetMetrics(asset, assetTxs);
    }).filter(a => a.totalQuantity > 0.0001 || a.totalCost > 0); 
  }, [assets, transactions]);

  const filteredAssets = useMemo(() => {
    return processedAssets.filter(a => {
      const matchesSearch = a.data.name.toLowerCase().includes(search.toLowerCase()) || 
                            a.type.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' || a.type === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.totalCost - a.totalCost);
  }, [processedAssets, search, typeFilter]);

  if (loading) return <div className="p-8 text-center text-slate-500">Decrypting assets...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Your Assets</h2>
          <p className="text-muted-foreground">Detailed breakdown of current holdings</p>
        </div>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="mb-4 p-4 blurred-card rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search assets by name or type..." 
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {(preferences?.categories || ["Equity", "Gold", "Mutual Fund", "Real Estate", "Bond"]).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="blurred-card rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200/50">
          {filteredAssets.map(asset => {
            const countryFlag = asset.country === 'India' ? '🇮🇳' : '🇺🇸';
            return (
              <div 
                key={asset.id} 
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:bg-gray-50/50 cursor-pointer"
                onClick={() => navigate(`/assets/${asset.id}`)}
              >
                <div className="flex-grow mb-2 sm:mb-0">
                  <h4 className="text-base font-medium text-blue-700">{asset.data.name} <span className="text-sm font-normal text-gray-500">{countryFlag}</span></h4>
                  <p className="text-sm text-gray-500">
                    Qty: <span className="font-medium">{asset.totalQuantity.toFixed(4)}</span> | 
                    Avg. Buy: <span className="font-medium">₹{asset.avgBuyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </p>
                </div>
                <div className="flex-shrink-0 text-left sm:text-right mb-2 sm:mb-0 sm:mr-6">
                  <p className="text-lg font-bold text-gray-900">Total Cost: ₹{asset.totalCost.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex-shrink-0 flex space-x-2" onClick={e => e.stopPropagation()}>
                  <button 
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-3 rounded-md transition-colors"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    View
                  </button>
                  <button 
                    className="text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-1.5 px-3 rounded-md shadow-sm hover:shadow-md transition-all font-medium"
                    onClick={() => navigate(`/add?tab=transaction&type=Buy&asset=${asset.id}`)}
                  >
                    Buy
                  </button>
                  <button 
                    className="text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-1.5 px-3 rounded-md shadow-sm hover:shadow-md transition-all font-medium"
                    onClick={() => navigate(`/add?tab=transaction&type=Sell&asset=${asset.id}`)}
                  >
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredAssets.length === 0 && (
            <div className="text-center py-20">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No assets found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add a new investment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
