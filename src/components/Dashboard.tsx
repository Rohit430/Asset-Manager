import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, PieChart as PieIcon } from 'lucide-react';
import { rebuildAssetMetrics } from '@/lib/fifo';
import { YearlySummary } from '@/components/YearlySummary';

// Colors matching the original prototype
const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];

export function Dashboard() {
  const { assets, transactions, liquidAssets, loading, syncing } = useData();

  const processedAssets = useMemo(() => {
    return assets.map(asset => {
      const assetTxs = transactions.filter(t => t.asset_id === asset.id);
      return rebuildAssetMetrics(asset, assetTxs);
    });
  }, [assets, transactions]);

  const metrics = useMemo(() => {
    let investedAssetsValue = 0;
    let realizedPL = 0;
    let activeCount = 0;

    processedAssets.forEach(a => {
      if (a.totalQuantity > 0.0001) {
        investedAssetsValue += a.totalCost;
        activeCount++;
      }
      realizedPL += a.realizedPL;
    });

    const liquidValue = liquidAssets.reduce((acc, a) => acc + (a.data.amount || 0), 0);

    return { 
      totalInvested: investedAssetsValue + liquidValue, 
      investedAssetsValue,
      liquidValue,
      realizedPL, 
      activeCount 
    };
  }, [processedAssets, liquidAssets]);

  const chartData = useMemo(() => {
    const data = processedAssets
      .filter(a => a.totalQuantity > 0.0001)
      .map(a => ({ name: a.data.name, value: a.totalCost }));
    return data.sort((a, b) => b.value - a.value);
  }, [processedAssets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg text-gray-700">Loading assets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Portfolio Overview</h2>
        {syncing && <span className="text-xs text-indigo-500 font-medium animate-pulse">Syncing...</span>}
      </div>

      {/* Summary Cards with Gradient Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Investment */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between border border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Investment</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">₹{metrics.totalInvested.toLocaleString('en-IN')}</p>
            <div className="flex gap-2 text-[10px] text-gray-400 mt-1">
              <span>Assets: ₹{metrics.investedAssetsValue.toLocaleString('en-IN', { maximumFractionDigits: 0, notation: 'compact' })}</span>
              <span>•</span>
              <span>Liquid: ₹{metrics.liquidValue.toLocaleString('en-IN', { maximumFractionDigits: 0, notation: 'compact' })}</span>
            </div>
          </div>
          <span className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white p-3 rounded-full shadow-md">
            <Wallet className="w-6 h-6" />
          </span>
        </div>

        {/* Realized P/L */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between border border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Realized P/L</h3>
            <p className={`mt-1 text-3xl font-semibold ${metrics.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{metrics.realizedPL.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="bg-gradient-to-tr from-green-500 to-green-700 text-white p-3 rounded-full shadow-md">
            {metrics.realizedPL >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          </span>
        </div>

        {/* Active Investments */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between border border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Investments</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{metrics.activeCount}</p>
          </div>
          <span className="bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white p-3 rounded-full shadow-md">
            <PieIcon className="w-6 h-6" />
          </span>
        </div>

        {/* Broker Fee Placeholder (Red) to match original */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between border border-gray-100">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Broker Fee</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">₹0.00</p>
          </div>
          <span className="bg-gradient-to-tr from-red-500 to-red-700 text-white p-3 rounded-full shadow-md">
            <CreditCard className="w-6 h-6" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 blurred-card p-6 rounded-xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Distribution (by Cost)</h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.5)', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No assets found. Add your first transaction to see the distribution.
              </div>
            )}
          </div>
        </div>

        {/* Top Assets List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="blurred-card p-6 rounded-xl">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Top Assets</h3>
             </div>
             
                       <div className="space-y-3">
                         {processedAssets
                           .sort((a, b) => b.totalCost - a.totalCost)
                           .slice(0, 5)
                           .map(asset => (                  <div key={asset.id} className="p-3 border-t border-gray-200/50 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="text-base font-medium text-blue-700">{asset.data.name} <span className="text-sm font-normal text-gray-500">{asset.country === 'India' ? '🇮🇳' : '🇺🇸'}</span></h4>
                      <p className="text-sm text-gray-500">Qty: <span className="font-medium">{asset.totalQuantity.toFixed(2)}</span> | Avg: ₹{asset.avgBuyPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="font-semibold text-gray-900">₹{asset.totalCost.toLocaleString('en-IN')}</div>
                  </div>
                ))
              }
              {processedAssets.length === 0 && <div className="text-center text-sm text-gray-500 py-10">Nothing here yet.</div>}
             </div>
          </div>
        </div>
      </div>

      {/* Yearly Summary Table */}
      <YearlySummary />
    </div>
  );
}
