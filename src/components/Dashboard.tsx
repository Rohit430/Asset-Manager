import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/hooks/useData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { rebuildAssetMetrics } from '@/lib/fifo';
import { YearlySummary } from '@/components/YearlySummary';

// Colors matching the original prototype
const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];

export function Dashboard() {
  const { assets, transactions, liquidAssets, preferences, loading, syncing } = useData();
  const navigate = useNavigate();

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
      totalInvested: investedAssetsValue, 
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

      {/* Summary Cards with Original HTML Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Investment */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Investment</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">₹{metrics.totalInvested.toLocaleString('en-IN')}</p>
          </div>
          <span className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white p-3 rounded-full shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.82-2.64-2.05-2.64-3.565 0-1.513 1.255-2.73 2.772-2.73 1.282 0 2.45.83 2.875 2.04M12 6v12m-3-2.818" />
            </svg>
          </span>
        </div>

        {/* Realized P/L */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Realized P/L</h3>
            <p className={`mt-1 text-3xl font-semibold ${metrics.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{metrics.realizedPL.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="bg-gradient-to-tr from-green-500 to-green-700 text-white p-3 rounded-full shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 9-9 4.5 4.5L21.75 6" />
            </svg>
          </span>
        </div>

        {/* Active Investments */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Investments</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{metrics.activeCount}</p>
          </div>
          <span className="bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white p-3 rounded-full shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </span>
        </div>

        {/* Broker Fee */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">Total Broker Fee</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">₹0.00</p>
          </div>
          <span className="bg-gradient-to-tr from-red-500 to-red-700 text-white p-3 rounded-full shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Chart + Liquid Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="blurred-card p-6 rounded-xl shadow-lg">
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
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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

          {/* Liquid Assets Summary */}
          <div className="blurred-card p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Liquid Assets Summary</h3>
              <button className="text-sm text-blue-600 hover:underline" onClick={() => navigate('/liquid')}>View in Detail</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Total Liquid</span>
                <span className="text-sm font-bold text-gray-900">₹{metrics.liquidValue.toLocaleString('en-IN')}</span>
              </div>
              {liquidAssets.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No liquid assets added yet.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Category Cards */}
        <div className="lg:col-span-3 space-y-6">
          {(preferences?.categories || ["Equity", "Gold", "Mutual Fund", "Real Estate", "Bond"]).map(category => {
            const categoryAssets = processedAssets
              .filter(a => a.type === category && a.totalQuantity > 0)
              .sort((a, b) => b.totalCost - a.totalCost)
              .slice(0, 5);

            return (
              <div key={category} className="blurred-card p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  {categoryAssets.length > 0 && (
                    <button className="text-sm text-blue-600 hover:underline" onClick={() => navigate('/assets')}>View More</button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {categoryAssets.map(asset => (
                    <div key={asset.id} className="p-3 border-t border-gray-200/50 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div>
                        <h4 className="text-base font-medium text-blue-700">
                          {asset.data.name} <span className="text-sm font-normal text-gray-500">{asset.country === 'India' ? '🇮🇳' : '🇺🇸'}</span>
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: <span className="font-medium">{asset.totalQuantity.toFixed(2)}</span> | Avg: ₹{asset.avgBuyPrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-gray-900">₹{asset.totalCost.toLocaleString('en-IN')}</div>
                        <div className="flex gap-1">
                           <button onClick={() => navigate(`/assets/${asset.id}`)} className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors">View</button>
                           <button onClick={() => navigate(`/add?tab=transaction&type=Buy&asset=${asset.id}`)} className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded text-white shadow-sm transition-all">Buy</button>
                           <button onClick={() => navigate(`/add?tab=transaction&type=Sell&asset=${asset.id}`)} className="px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded text-white shadow-sm transition-all">Sell</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {categoryAssets.length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-6">
                      No {category.toLowerCase()} investments yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yearly Summary Table */}
      <YearlySummary />
    </div>
  );
}