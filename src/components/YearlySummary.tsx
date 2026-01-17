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
    <Card className="col-span-7 mt-6">
      <CardHeader>
        <CardTitle>Year-Wise Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Financial Year</th>
                <th className="px-4 py-3 text-right">Invested</th>
                <th className="px-4 py-3 text-right">Sold</th>
                <th className="px-4 py-3 text-right">Gross Profit</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-4 py-3 text-right">Fees</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Net P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {yearlyData.map(([fy, data]) => (
                <tr key={fy} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{fy}</td>
                  <td className="px-4 py-3 text-right">₹{data.invested.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">₹{data.sold.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-3 text-right ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{data.profit.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-red-500">₹{data.tax.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right text-red-500">₹{data.brokerFee.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-3 text-right font-bold ${data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{data.netProfit.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
