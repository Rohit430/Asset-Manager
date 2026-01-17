import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="glass-card rounded-xl overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Year-Wise Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Financial Year</th>
              <th className="px-6 py-4 text-right">Invested</th>
              <th className="px-6 py-4 text-right">Sold</th>
              <th className="px-6 py-4 text-right">Gross Profit</th>
              <th className="px-6 py-4 text-right">Tax</th>
              <th className="px-6 py-4 text-right">Fees</th>
              <th className="px-6 py-4 text-right">Net P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {yearlyData.map(([fy, data]) => (
              <tr key={fy} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{fy}</td>
                <td className="px-6 py-4 text-right text-gray-600">₹{data.invested.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right text-gray-600">₹{data.sold.toLocaleString('en-IN')}</td>
                <td className={`px-6 py-4 text-right font-medium ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{data.profit.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-right text-red-500">₹{data.tax.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right text-red-500">₹{data.brokerFee.toLocaleString('en-IN')}</td>
                <td className={`px-6 py-4 text-right font-bold ${data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{data.netProfit.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
