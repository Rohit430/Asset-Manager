import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/hooks/useData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { rebuildAssetMetrics } from '@/lib/fifo';
import { format } from 'date-fns';

// Colors matching the original prototype
const COLORS = ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#7e22ce', '#6b21a8', '#581c87', '#e5e7eb', '#9ca3af'];

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
    let totalBrokerFee = 0;

    processedAssets.forEach(a => {
      if (a.totalQuantity > 0.0001) {
        investedAssetsValue += a.totalCost;
        activeCount++;
      }
      realizedPL += a.realizedPL;
    });

    totalBrokerFee = transactions.filter(t => t.type === 'Sell').reduce((acc, t) => acc + (t.data.brokerFee || 0), 0);

    return { 
      totalInvested: investedAssetsValue, 
      realizedPL, 
      activeCount,
      totalBrokerFee
    };
  }, [processedAssets, transactions]);

  const chartData = useMemo(() => {
    const data = processedAssets
      .filter(a => a.totalQuantity > 0.0001)
      .map(a => ({ name: a.data.name, value: a.totalCost }));
    return data.sort((a, b) => b.value - a.value);
  }, [processedAssets]);

  const yearlySummary = useMemo(() => {
    const fySummary: any = {};
    
    transactions.forEach(tx => {
        const date = new Date(tx.tx_date);
        const y = date.getFullYear();
        const fy = date.getMonth() >= 3 ? `${y}-${(y + 1).toString().slice(-2)}` : `${y - 1}-${y.toString().slice(-2)}`;
        
        if (!fySummary[fy]) fySummary[fy] = { invested: 0, sold: 0, profit: 0, tax: 0, brokerFee: 0, netProfit: 0 };
        
        const miscCosts = tx.data.miscCosts || 0;
        const totalVal = (tx.data.quantity * tx.data.price);

        if (tx.type === 'Buy') {
            fySummary[fy].invested += totalVal + miscCosts;
        } else if (tx.type === 'Sell') {
            fySummary[fy].sold += totalVal;
            fySummary[fy].profit += tx.data.netProfit ? (tx.data.netProfit + (tx.data.taxAmount||0) + (tx.data.brokerFee||0)) : 0; 
            fySummary[fy].tax += tx.data.taxAmount || 0;
            fySummary[fy].brokerFee += tx.data.brokerFee || 0;
            fySummary[fy].netProfit += tx.data.netProfit || 0;
        }
    });
    return Object.entries(fySummary).sort().reverse();
  }, [transactions]);

  const liquidSummary = useMemo(() => {
      const bankData: any = {};
      liquidAssets.forEach(asset => {
          const data = asset.data;
          const bank = (asset.type === 'Cash' ? data.bankName : data.bankName) || 'Other';
          if (!bankData[bank]) bankData[bank] = { savings: 0, fd: 0 };
          if (asset.type === 'Cash') bankData[bank].savings += data.amount || 0;
          if (asset.type === 'FD') bankData[bank].fd += data.amount || 0;
      });
      return Object.entries(bankData).sort();
  }, [liquidAssets]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-brand-600 rounded-full animate-spin"></div>
        </div>
        <span className="mt-4 text-lg font-medium text-brand-800">Syncing Iris...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <h2 className="text-3xl font-extrabold text-brand-900 mb-6 flex items-center">
          <span className="mr-2">Overview</span>
          <span className="h-1 flex-grow bg-brand-100 rounded-full ml-4"></span>
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Investment */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-brand-500 flex items-center justify-between group hover:shadow-xl transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-brand-800/60 uppercase tracking-wide">Total Investment</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">₹{metrics.totalInvested.toLocaleString('en-IN')}</p>
          </div>
          <span className="bg-brand-50 text-brand-600 p-3 rounded-xl shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.82-2.64-2.05-2.64-3.565 0-1.513 1.255-2.73 2.772-2.73 1.282 0 2.45.83 2.875 2.04M12 6v12m-3-2.818" />
            </svg>
          </span>
        </div>

        {/* Realized P/L */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-emerald-500 flex items-center justify-between group hover:shadow-xl transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-emerald-800/60 uppercase tracking-wide">Realized P/L</h3>
            <p className={`mt-1 text-3xl font-bold ${metrics.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{metrics.realizedPL.toLocaleString('en-IN')}
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-600 p-3 rounded-xl shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 18 9-9 4.5 4.5L21.75 6" />
            </svg>
          </span>
        </div>

        {/* Active Assets */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-orange-400 flex items-center justify-between group hover:shadow-xl transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-orange-800/60 uppercase tracking-wide">Active Assets</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{metrics.activeCount}</p>
          </div>
          <span className="bg-orange-50 text-orange-600 p-3 rounded-xl shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </span>
        </div>

        {/* Broker Fee */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border-l-4 border-gray-400 flex items-center justify-between group hover:shadow-xl transition-shadow">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Fees Paid</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">₹{metrics.totalBrokerFee.toLocaleString('en-IN')}</p>
          </div>
          <span className="bg-gray-100 text-gray-600 p-3 rounded-xl shadow-sm group-hover:bg-gray-600 group-hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Chart + Liquid Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Card */}
          <div className="blurred-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center">
                <span className="w-2 h-6 bg-brand-600 rounded mr-2"></span>
                Portfolio Allocation
            </h3>
            <div className="relative h-[400px] w-full mx-auto">
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
                  <div className="text-center">
                    <div className="bg-gray-100 inline-block p-4 rounded-full mb-2">
                       <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <p>Add your first asset to see distribution.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Liquid Assets Mini Table */}
          <div className="blurred-card p-6 rounded-2xl shadow-lg border-t-4 border-t-brand-400">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-900">Liquid Assets</h3>
                <button onClick={() => navigate('/liquid')} className="text-xs bg-brand-100 text-brand-700 px-3 py-1 rounded-full hover:bg-brand-200 transition-colors font-semibold">View Detail</button>
            </div>
            <div className="table-container max-h-48 rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bank</th>
                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Savings</th>
                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">FD</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {liquidSummary.map(([bank, data]: any) => (
                        <tr key={bank}>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">{bank}</td>
                          <td className="px-3 py-2 text-sm text-right text-gray-700">₹{data.savings.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 text-sm text-right text-gray-700">₹{data.fd.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                      {liquidSummary.length === 0 && (
                        <tr><td colSpan={3} className="p-6 text-center text-gray-400 italic text-sm">No liquid funds available.</td></tr>
                      )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Right Column: Category Cards */}
        <div className="lg:col-span-3 space-y-6">
          {(preferences?.categories || ["Equity", "Mutual Funds", "Real Estate", "Commodity", "Bonds"]).map(category => {
            const categoryAssets = processedAssets
              .filter(a => a.type === category && a.totalQuantity > 0.0001)
              .sort((a, b) => a.data.name.localeCompare(b.data.name))
              .slice(0, 5);

            return (
              <div key={category} className="blurred-card rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-md font-bold text-gray-800">{category}</h3>
                    {categoryAssets.length > 0 && (
                      <button 
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline" 
                        onClick={() => navigate(`/assets?category=${encodeURIComponent(category)}`)}
                      >
                        View All &rarr;
                      </button>
                    )}
                </div>
                <div className="p-4 space-y-3">
                  {categoryAssets.map(asset => (
                    <div key={asset.id} className="p-4 border border-gray-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:shadow-md hover:border-brand-200 bg-white">
                        <div className="flex-grow mb-3 sm:mb-0">
                            <h4 className="text-base font-bold text-gray-800 flex items-center">
                              {asset.data.name} 
                              <span className="ml-2 text-xs opacity-70">{asset.country === 'India' ? '🇮🇳' : '🇺🇸'}</span>
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Qty: <span className="font-bold text-gray-700">{asset.totalQuantity.toFixed(2)}</span> &bull; 
                              Avg: <span className="font-bold text-gray-700">₹{asset.avgBuyPrice.toLocaleString('en-IN', {maximumFractionDigits: 2})}</span>
                            </p>
                        </div>
                        <div className="flex-shrink-0 text-left sm:text-right mb-3 sm:mb-0 sm:mr-6">
                            <p className="text-sm font-bold text-brand-800 font-mono">₹{asset.totalCost.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Cost</p>
                        </div>
                        <div className="flex-shrink-0 flex space-x-2">
                            <button onClick={() => navigate(`/assets/${asset.id}`)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg font-semibold transition-colors">View</button>
                            <button onClick={() => navigate(`/add?tab=transaction&type=Buy&asset=${asset.id}`)} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 px-3 rounded-lg font-semibold transition-colors">Buy</button>
                            <button onClick={() => navigate(`/add?tab=transaction&type=Sell&asset=${asset.id}`)} className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 px-3 rounded-lg font-semibold transition-colors">Sell</button>
                        </div>
                    </div>
                  ))}
                  {categoryAssets.length === 0 && (
                    <p className="text-gray-400 text-center py-4 text-sm italic">No investments.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Year-Wise Performance */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-brand-900 mb-4 border-l-4 border-brand-600 pl-4">Year-Wise Performance</h2>
        <div className="blurred-card rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-brand-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Financial Year</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invested</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sold Value</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gross P/L</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Tax</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-red-400 uppercase tracking-wider">Brokerage</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Net P/L</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {yearlySummary.map(([fy, data]: any) => (
                        <tr key={fy}>
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-brand-900">{fy}</td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">₹{data.invested.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">₹{data.sold.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">₹{data.profit.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-red-400 font-medium">₹{data.tax.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-red-400 font-medium">₹{data.brokerFee.toLocaleString('en-IN')}</td>
                            <td className={`px-6 py-3 whitespace-nowrap text-sm font-bold ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{data.netProfit.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                      {yearlySummary.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-gray-400">No transactions recorded yet.</td></tr>
                      )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
