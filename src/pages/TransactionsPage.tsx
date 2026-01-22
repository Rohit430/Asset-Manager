import { useMemo, useState } from 'react';
import { useData } from '@/hooks/useData';
import { Search, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function TransactionsPage() {
  const { assets, transactions, loading } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  const displayTransactions = useMemo(() => {
    return transactions.map(tx => {
      const asset = assets.find(a => a.id === tx.asset_id);
      return {
        ...tx,
        assetName: asset?.data.name || 'Unknown Asset',
        assetType: asset?.type || 'Other'
      };
    }).filter(tx => 
      tx.assetName.toLowerCase().includes(search.toLowerCase()) ||
      tx.type.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => new Date(b.tx_date).getTime() - new Date(a.tx_date).getTime());
  }, [transactions, assets, search]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading activity...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-brand-100">
        <h2 className="text-2xl font-bold text-brand-900">All Transactions</h2>
        <button 
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-all text-sm flex items-center"
          onClick={() => navigate('/')}
        >
          &larr; Back
        </button>
      </div>

      <div className="mb-6 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search</label>
            <input 
              type="text"
              placeholder="Name, date, note..." 
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
            <select 
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sort By</label>
            <select 
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="value_desc">Value (High-Low)</option>
              <option value="value_asc">Value (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto table-container">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Net P/L</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {displayTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700">{format(new Date(tx.tx_date), 'MMM dd, yyyy')}</td>
                  <td className="px-4 py-3 text-sm font-bold text-brand-900">{tx.assetName}</td>
                  <td className={`px-4 py-3 text-sm font-bold ${tx.type === 'Buy' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                    ₹{(tx.data.quantity * tx.data.price).toLocaleString('en-IN')}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-bold ${tx.data.netProfit && tx.data.netProfit >= 0 ? 'text-emerald-600' : (tx.data.netProfit ? 'text-red-500' : 'text-gray-400')}`}>
                    {tx.data.netProfit ? `₹${tx.data.netProfit.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button 
                      className="text-brand-600 hover:text-brand-800 font-semibold"
                      onClick={() => navigate(`/add?tab=transaction&editId=${tx.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-600 font-semibold"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {displayTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">No transactions found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}