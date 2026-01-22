import { useData } from '@/hooks/useData';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LiquidAssetsPage() {
  const { liquidAssets, loading } = useData();
  const navigate = useNavigate();

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

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-xl font-bold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Cash Accounts
          </h3>
          <button 
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-2 text-sm border border-emerald-200"
            onClick={() => navigate('/add?tab=liquid&type=Cash')}
          >
            <Plus className="w-4 h-4" />
            <span>Add Cash</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto table-container">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Note</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {liquidAssets.filter(a => a.type === 'Cash').map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{asset.data.bankName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 font-mono">₹{(asset.data.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.data.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-red-400 hover:text-red-600 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
                {liquidAssets.filter(a => a.type === 'Cash').length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">No cash entries added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-xl font-bold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Fixed Deposits
          </h3>
          <button 
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center space-x-2 text-sm border border-blue-200"
            onClick={() => navigate('/add?tab=liquid&type=FD')}
          >
            <Plus className="w-4 h-4" />
            <span>Add FD</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto table-container">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Holder</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Interest (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {liquidAssets.filter(a => a.type === 'FD').map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{asset.data.bankName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.data.holderName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.data.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.data.interestRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-700 font-mono">₹{(asset.data.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-red-400 hover:text-red-600 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
                {liquidAssets.filter(a => a.type === 'FD').length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 italic">No FD entries added yet.</td>
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