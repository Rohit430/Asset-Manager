import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { getFinancialYear } from '@/lib/fifo';

export function YearlySummary() {
  const { transactions } = useData();

  const yearlyData = useMemo(() => {
    const summary: Record<string, { 
      invested: number, 
      sold: number, 
      profit: number, 
      tax: number, 
      brokerFee: number, 
      netProfit: number 
    }> = {};

    transactions.forEach(tx => {
      const fy = getFinancialYear(tx.tx_date);
      if (!summary[fy]) {
        summary[fy] = { invested: 0, sold: 0, profit: 0, tax: 0, brokerFee: 0, netProfit: 0 };
      }

      if (tx.type === 'Buy') {
        const cost = (tx.data.quantity * tx.data.price); // Price is already base currency (INR)
        // Note: miscCosts are already included in price if calculated correctly, 
        // but let's add them separately if they are raw fees.
        // In our AddForm, miscCosts are just fees.
        summary[fy].invested += cost + (tx.data.miscCosts || 0);
      } else if (tx.type === 'Sell') {
        summary[fy].sold += (tx.data.quantity * tx.data.price);
        summary[fy].profit += tx.data.profit || 0;
        summary[fy].tax += tx.data.taxAmount || 0;
        summary[fy].brokerFee += tx.data.brokerFee || 0;
        summary[fy].netProfit += tx.data.netProfit || 0;
      }
    });

    return Object.entries(summary).sort().reverse();
  }, [transactions]);

  if (yearlyData.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Year-Wise Summary</h2>
      <div className="blurred-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
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
              {yearlyData.map(([fy, data]) => (
                <tr key={fy}>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-brand-900">{fy}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">₹{data.invested.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">₹{data.sold.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                    ₹{data.profit.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-red-400 font-medium">₹{data.tax.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-red-400 font-medium">₹{data.brokerFee.toLocaleString('en-IN')}</td>
                  <td className={`px-6 py-3 whitespace-nowrap text-sm font-bold ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₹{data.netProfit.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
