import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { calculateSellPreview } from '@/lib/fifo';
import { toast } from 'sonner';
import { rebuildAssetMetrics } from '@/lib/fifo';

export function AddTransactionForm({ 
  onSuccess,
  initialType,
  initialAssetId,
  editTxId
}: { 
  onSuccess: () => void;
  initialType?: string | null;
  initialAssetId?: string | null;
  editTxId?: string | null;
}) {
  const { assets, transactions, addTransaction, updateTransaction, preferences } = useData();
  const [loading, setLoading] = useState(false);
  const [sellPreview, setSellPreview] = useState<any>(null);
  
  // Edit Mode Initialization
  const existingTx = useMemo(() => {
    return editTxId ? transactions.find(t => t.id === editTxId) : null;
  }, [editTxId, transactions]);

  const [formData, setFormData] = useState({
    assetId: existingTx ? existingTx.asset_id : (initialAssetId || ''),
    type: existingTx ? existingTx.type : (initialType || 'Buy'),
    date: existingTx ? existingTx.tx_date : new Date().toISOString().split('T')[0],
    quantity: existingTx ? existingTx.data.quantity.toString() : '',
    price: existingTx ? (existingTx.data.originalPrice || existingTx.data.price).toString() : '',
    currency: existingTx ? (existingTx.data.currency || 'INR') : 'INR',
    exchangeRate: existingTx ? (existingTx.data.exchangeRate || 1).toString() : '1',
    fees: existingTx ? existingTx.data.miscCosts.toString() : '0',
    notes: existingTx ? (existingTx.data.notes || '') : ''
  });

  // Sync state when existingTx loads (fixes "Select Asset" bug on refresh)
  useEffect(() => {
    if (existingTx) {
      setFormData({
        assetId: existingTx.asset_id,
        type: existingTx.type,
        date: existingTx.tx_date,
        quantity: existingTx.data.quantity.toString(),
        price: (existingTx.data.originalPrice || existingTx.data.price).toString(),
        currency: existingTx.data.currency || 'INR',
        exchangeRate: (existingTx.data.exchangeRate || 1).toString(),
        fees: existingTx.data.miscCosts.toString(),
        notes: existingTx.data.notes || ''
      });
    }
  }, [existingTx]);

  // Calculate Base Price (INR)
  const basePrice = useMemo(() => {
    const p = parseFloat(formData.price);
    const r = parseFloat(formData.exchangeRate);
    return (isNaN(p) || isNaN(r)) ? 0 : p * r;
  }, [formData.price, formData.exchangeRate]);

  // Calculate live metrics for the selected asset to prevent invalid sells
  const selectedAssetMetrics = useMemo(() => {
    if (!formData.assetId) return null;
    const asset = assets.find(a => a.id === formData.assetId);
    if (!asset) return null;
    // Exclude current TX from metrics if editing, to prevent double counting issues during validation
    const assetTxs = transactions.filter(t => t.asset_id === asset.id && t.id !== editTxId);
    return rebuildAssetMetrics(asset, assetTxs);
  }, [formData.assetId, assets, transactions, editTxId]);

  // Real-time Sell Preview
  const handlePreview = () => {
    if (!selectedAssetMetrics || !preferences) return;
    
    try {
      const qty = parseFloat(formData.quantity);
      const price = basePrice; // Use calculated INR price
      const fees = parseFloat(formData.fees);
      
      if (isNaN(qty) || price === 0) return;

      const preview = calculateSellPreview(
        selectedAssetMetrics,
        qty,
        price,
        fees,
        formData.date,
        preferences
      );
      setSellPreview(preview);
    } catch (e: any) {
      toast.error(e.message);
      setSellPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: Asset ID is required.
    // In edit mode, it should be pre-filled.
    if (!formData.assetId) return toast.error('Select an asset');

    setLoading(true);
    try {
      const qty = parseFloat(formData.quantity);
      const fees = parseFloat(formData.fees);

      // If Sell, verify quantity
      if (formData.type === 'Sell') {
        if (!selectedAssetMetrics || qty > selectedAssetMetrics.totalQuantity) {
          throw new Error('Insufficient quantity to sell');
        }
      }

      const txData: any = {
        quantity: qty,
        price: basePrice, // Store INR equivalent
        originalPrice: parseFloat(formData.price),
        currency: formData.currency,
        exchangeRate: parseFloat(formData.exchangeRate),
        miscCosts: fees,
        notes: formData.notes
      };

      // Attach calculated metrics for Sell records
      if (formData.type === 'Sell' && sellPreview) {
        Object.assign(txData, {
          profit: sellPreview.grossProfit,
          taxAmount: sellPreview.taxAmount,
          brokerFee: sellPreview.brokerFee,
          netProfit: sellPreview.netProfit,
          holdingPeriod: sellPreview.holdingPeriod,
          termType: sellPreview.termType
        });
      }

      if (existingTx) {
        await updateTransaction(existingTx, txData);
      } else {
        await addTransaction(formData.assetId, formData.type, formData.date, txData);
      }
      
      if (!existingTx) {
        setFormData({
          assetId: '',
          type: 'Buy',
          date: new Date().toISOString().split('T')[0],
          quantity: '',
          price: '',
          currency: 'INR',
          exchangeRate: '1',
          fees: '0',
          notes: ''
        });
        setSellPreview(null);
      }
      
      onSuccess();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle>{existingTx ? 'Update Transaction' : 'Record Transaction'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label>Select Asset</Label>
            <Select 
              value={formData.assetId} 
              onValueChange={v => {
                const asset = assets.find(a => a.id === v);
                setFormData({
                  ...formData, 
                  assetId: v, 
                  currency: asset?.country === 'India' ? 'INR' : 'USD',
                  exchangeRate: asset?.country === 'India' ? '1' : '83' // Quick default
                });
              }}
              disabled={!!existingTx} // Lock asset on edit for simplicity
            >
              <SelectTrigger>
                <SelectValue placeholder="Search asset..." />
              </SelectTrigger>
              <SelectContent>
                {assets.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.data.name} ({a.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAssetMetrics && (
              <p className="text-xs text-muted-foreground">
                Owned: {selectedAssetMetrics.totalQuantity.toFixed(4)} units | Avg: ₹{selectedAssetMetrics.avgBuyPrice.toFixed(2)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={v => {
                  setFormData({...formData, type: v});
                  setSellPreview(null);
                }}
                disabled={!!existingTx} // Lock type on edit
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={e => {
                  setFormData({...formData, date: e.target.value});
                  if (formData.type === 'Sell') setTimeout(handlePreview, 0);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={v => setFormData({...formData, currency: v, exchangeRate: v === 'INR' ? '1' : formData.exchangeRate})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Exchange Rate (to INR)</Label>
              <Input 
                type="number" step="any"
                disabled={formData.currency === 'INR'}
                value={formData.exchangeRate}
                onChange={e => {
                  setFormData({...formData, exchangeRate: e.target.value});
                  if (formData.type === 'Sell') setTimeout(handlePreview, 0);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" step="any"
                value={formData.quantity}
                onChange={e => {
                  setFormData({...formData, quantity: e.target.value});
                  if (formData.type === 'Sell') setTimeout(handlePreview, 0); // Defer slightly
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Price ({formData.currency})</Label>
              <Input 
                type="number" step="any"
                value={formData.price}
                onChange={e => {
                  setFormData({...formData, price: e.target.value});
                  if (formData.type === 'Sell') setTimeout(handlePreview, 0);
                }}
              />
            </div>
          </div>

          {formData.currency !== 'INR' && basePrice > 0 && (
            <p className="text-xs text-blue-600 font-medium">
              Equivalent: ₹{basePrice.toLocaleString('en-IN')} / unit
            </p>
          )}

          <div className="space-y-2">
            <Label>Fees / Misc Costs (INR)</Label>
            <Input 
              type="number" step="any"
              value={formData.fees}
              onChange={e => {
                setFormData({...formData, fees: e.target.value});
                if (formData.type === 'Sell') setTimeout(handlePreview, 0);
              }}
            />
          </div>

          {/* Sell Preview Box */}
          {formData.type === 'Sell' && sellPreview && (
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Profit:</span>
                <span className={sellPreview.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{sellPreview.grossProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Term:</span>
                <span>{sellPreview.termType} ({sellPreview.holdingPeriod} days)</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t">
                <span>Net P/L:</span>
                <span className={sellPreview.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{sellPreview.netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : (existingTx ? 'Update Transaction' : `Confirm ${formData.type}`)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
