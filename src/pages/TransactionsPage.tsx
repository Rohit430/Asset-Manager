import { useMemo, useState } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpCircle, ArrowDownCircle, Info, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function TransactionsPage() {
  const { assets, transactions, loading } = useData();
  const [search, setSearch] = useState('');
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">All Transactions</h2>
          <p className="text-muted-foreground">Historical record of all transactions</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/')}
        >
          &larr; Back to Dashboard
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search by asset name or transaction type..." 
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {displayTransactions.map(tx => (
          <Card key={tx.id} className="overflow-hidden">
            <div className={`h-1 w-full ${tx.type === 'Buy' ? 'bg-green-500' : 'bg-red-500'}`} />
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={tx.type === 'Buy' ? 'text-green-600' : 'text-red-600'}>
                  {tx.type === 'Buy' ? <ArrowUpCircle className="w-8 h-8" /> : <ArrowDownCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{tx.assetName}</h4>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <span>{format(new Date(tx.tx_date), 'PPP')}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] py-0">{tx.assetType}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 items-center text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Quantity</p>
                  <p className="font-medium">{tx.data.quantity.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Price</p>
                  <p className="font-medium">
                    {tx.data.currency !== 'INR' && (
                      <span className="text-[10px] text-slate-400 mr-1">
                        ({tx.data.currency} {tx.data.originalPrice?.toLocaleString()})
                      </span>
                    )}
                    ₹{tx.data.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Total Value</p>
                  <p className="font-bold">₹{(tx.data.quantity * tx.data.price).toLocaleString('en-IN')}</p>
                  {tx.data.currency !== 'INR' && (
                    <p className="text-[10px] text-slate-400 text-right">Rate: {tx.data.exchangeRate}</p>
                  )}
                </div>
                
                {tx.type === 'Sell' && tx.data.netProfit !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border">
                    <p className="text-muted-foreground text-[10px] uppercase flex items-center gap-1">
                      Net Profit <Info className="w-3 h-3" />
                    </p>
                    <p className={`font-bold ${tx.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{tx.data.netProfit.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                
                <Button variant="ghost" size="icon" onClick={() => navigate(`/add?tab=transaction&editId=${tx.id}`)}>
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {displayTransactions.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No transactions found for your search.
          </div>
        )}
      </div>
    </div>
  );
}