import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { encryptData } from '@/lib/crypto';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function AddLiquidAssetForm({ onSuccess }: { onSuccess: () => void }) {
  const { refresh } = useData();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'Cash' | 'FD'>('Cash');
  
  const [formData, setFormData] = useState({
    bankName: '',
    amount: '',
    notes: '',
    holderName: '',
    startDate: '',
    endDate: '',
    interestRate: '',
    maturityAmount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mk = sessionStorage.getItem('master_key');
    if (!mk) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dataPayload: any = {
        bankName: formData.bankName,
        amount: parseFloat(formData.amount),
        notes: formData.notes
      };

      if (type === 'FD') {
        dataPayload.holderName = formData.holderName;
        dataPayload.startDate = formData.startDate;
        dataPayload.endDate = formData.endDate;
        dataPayload.interestRate = parseFloat(formData.interestRate);
        dataPayload.maturityAmount = parseFloat(formData.maturityAmount);
      }

      const encrypted = await encryptData(dataPayload, mk);
      const { error } = await supabase.from('liquid_assets').insert({
        user_id: user.id,
        type,
        encrypted_data: encrypted
      });

      if (error) throw error;

      toast.success(`${type} entry saved`);
      refresh();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle>Add Liquid Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash / Savings</SelectItem>
                <SelectItem value="FD">Fixed Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bank / Institution Name</Label>
            <Input 
              placeholder="e.g. HDFC Bank" 
              value={formData.bankName}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{type === 'Cash' ? 'Amount' : 'Principal Amount'}</Label>
            <Input 
              type="number" step="any"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          {type === 'FD' && (
            <>
              <div className="space-y-2">
                <Label>Account Holder</Label>
                <Input 
                  value={formData.holderName}
                  onChange={e => setFormData({...formData, holderName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input 
                    type="number" step="any"
                    value={formData.interestRate}
                    onChange={e => setFormData({...formData, interestRate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maturity Amount</Label>
                  <Input 
                    type="number" step="any"
                    value={formData.maturityAmount}
                    onChange={e => setFormData({...formData, maturityAmount: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input 
              placeholder="Optional notes" 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Encrypting...' : 'Save Asset'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
