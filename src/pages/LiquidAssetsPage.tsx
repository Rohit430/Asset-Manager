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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Liquid Assets</h2>
          <p className="text-muted-foreground">Cash, Savings, and Fixed Deposits</p>
        </div>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Cash</h3>
          <button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            onClick={() => navigate('/add?tab=liquid&type=Cash')}
          >
            <Plus className="w-5 h-5" />
            <span>Add Cash Entry</span>
          </button>
        </div>
        <div className="blurred-card rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200/50">
                {liquidAssets.filter(a => a.type === 'Cash').map(asset => (
                  <tr key={asset.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{asset.data.bankName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">₹{(asset.data.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{asset.data.notes || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
                {liquidAssets.filter(a => a.type === 'Cash').length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">No cash entries added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Fixed Deposits</h3>
          <button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            onClick={() => navigate('/add?tab=liquid&type=FD')}
          >
            <Plus className="w-5 h-5" />
            <span>Add FD Entry</span>
          </button>
        </div>
        <div className="blurred-card rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holder</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200/50">
                {liquidAssets.filter(a => a.type === 'FD').map(asset => (
                  <tr key={asset.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{asset.data.bankName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{asset.data.holderName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{asset.data.endDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{asset.data.interestRate}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">₹{(asset.data.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
                {liquidAssets.filter(a => a.type === 'FD').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">No FD entries added yet.</td>
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