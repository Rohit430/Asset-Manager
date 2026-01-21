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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">All Transactions</h2>
          <p className="text-muted-foreground">Historical record of all Buy and Sell actions</p>
        </div>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="mb-4 p-4 blurred-card rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by asset name or transaction type..." 
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>
          <div>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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

      <div className="blurred-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net P/L</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {displayTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{format(new Date(tx.tx_date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.assetName}</td>
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
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {displayTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No transactions found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}