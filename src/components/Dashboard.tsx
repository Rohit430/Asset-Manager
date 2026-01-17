import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet } from 'lucide-react';
import { rebuildAssetMetrics } from '@/lib/fifo';

// Colors for the chart matching the original theme but modernized
const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];

export function Dashboard() {
  const { assets, transactions, liquidAssets, loading, syncing } = useData();

  // 1. Process Data (FIFO Engine)
  const processedAssets = useMemo(() => {
    return assets.map(asset => {
      const assetTxs = transactions.filter(t => t.asset_id === asset.id);
      return rebuildAssetMetrics(asset, assetTxs);
    });
  }, [assets, transactions]);

  // 2. Compute Aggregates
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

  // 3. Prepare Chart Data
  const chartData = useMemo(() => {
    const data = processedAssets
      .filter(a => a.totalQuantity > 0.0001)
      .map(a => ({ name: a.data.name, value: a.totalCost }));
    
    // Group small assets into "Others" if needed (simplified for now)
    return data.sort((a, b) => b.value - a.value);
  }, [processedAssets]);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-slate-400">Loading your encrypted vault...</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {syncing && <span className="text-xs text-blue-500 animate-pulse">Syncing...</span>}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.totalInvested.toLocaleString('en-IN')}</div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Assets: ₹{metrics.investedAssetsValue.toLocaleString('en-IN')}</span>
              <span>Liquid: ₹{metrics.liquidValue.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized P/L</CardTitle>
            {metrics.realizedPL >= 0 ? 
              <ArrowUpRight className="h-4 w-4 text-green-500" /> : 
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{metrics.realizedPL.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime realized gains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCount}</div>
            <p className="text-xs text-muted-foreground">Across {new Set(processedAssets.map(a => a.type)).size} categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Chart Section */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
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
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No assets found. Start by adding one!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick List / Categories */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedAssets
                .filter(a => a.totalQuantity > 0)
                .sort((a, b) => b.totalCost - a.totalCost)
                .slice(0, 5)
                .map(asset => (
                  <div key={asset.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{asset.data.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.country === 'India' ? '🇮🇳' : '🇺🇸'} {asset.type}</p>
                    </div>
                    <div className="ml-auto font-medium">₹{asset.totalCost.toLocaleString('en-IN')}</div>
                  </div>
                ))
              }
              {processedAssets.length === 0 && <div className="text-center text-sm text-muted-foreground py-4">Nothing here yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
