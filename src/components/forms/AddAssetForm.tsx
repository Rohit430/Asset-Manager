import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function AddAssetForm({ onSuccess }: { onSuccess: () => void }) {
  const { addAsset } = useData();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Equity',
    country: 'India',
    ticker: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Asset Name is required');

    setLoading(true);
    try {
      await addAsset(formData.type, formData.country, {
        name: formData.name,
        ticker: formData.ticker,
        notes: formData.notes
      });
      setFormData({ name: '', type: 'Equity', country: 'India', ticker: '', notes: '' });
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle>Create New Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Asset Name</Label>
            <Input 
              placeholder="e.g. Reliance Industries" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={v => setFormData({...formData, type: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Bond">Bond</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={v => setFormData({...formData, country: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India 🇮🇳</SelectItem>
                  <SelectItem value="US">USA 🇺🇸</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ticker / Symbol (Optional)</Label>
            <Input 
              placeholder="e.g. RELIANCE" 
              value={formData.ticker}
              onChange={e => setFormData({...formData, ticker: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input 
              placeholder="Optional notes" 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Encrypting & Saving...' : 'Create Asset'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
