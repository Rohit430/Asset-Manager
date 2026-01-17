import { useState, useEffect } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { encryptData } from '@/lib/crypto';
import { toast } from 'sonner';

export function SettingsPage() {
  const { preferences, refresh } = useData();
  const [loading, setLoading] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<any>(null);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    const mk = sessionStorage.getItem('master_key');
    if (!mk || !localPrefs) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const encrypted = await encryptData(localPrefs, mk);
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: encrypted })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Settings saved and encrypted');
      refresh();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!localPrefs) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your tax rules and app preferences</p>
      </div>

      <Tabs defaultValue="tax" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tax">Taxation Rules</TabsTrigger>
          <TabsTrigger value="categories">Categories & Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="tax" className="space-y-4 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* India Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>🇮🇳</span> India Tax Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Short Term Threshold (Days)</Label>
                  <Input 
                    type="number" 
                    value={localPrefs.taxSettings.india.shortTermDays}
                    onChange={e => setLocalPrefs({
                      ...localPrefs, 
                      taxSettings: {
                        ...localPrefs.taxSettings,
                        india: { ...localPrefs.taxSettings.india, shortTermDays: parseInt(e.target.value) }
                      }
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Short Term (%)</Label>
                    <Input 
                      type="number" 
                      value={localPrefs.taxSettings.india.shortTermTax}
                      onChange={e => setLocalPrefs({
                        ...localPrefs, 
                        taxSettings: {
                          ...localPrefs.taxSettings,
                          india: { ...localPrefs.taxSettings.india, shortTermTax: parseFloat(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Long Term (%)</Label>
                    <Input 
                      type="number" 
                      value={localPrefs.taxSettings.india.longTermTax}
                      onChange={e => setLocalPrefs({
                        ...localPrefs, 
                        taxSettings: {
                          ...localPrefs.taxSettings,
                          india: { ...localPrefs.taxSettings.india, longTermTax: parseFloat(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* US Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>🇺🇸</span> US Tax Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Short Term Threshold (Days)</Label>
                  <Input 
                    type="number" 
                    value={localPrefs.taxSettings.us.shortTermDays}
                    onChange={e => setLocalPrefs({
                      ...localPrefs, 
                      taxSettings: {
                        ...localPrefs.taxSettings,
                        us: { ...localPrefs.taxSettings.us, shortTermDays: parseInt(e.target.value) }
                      }
                    })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Short Term (%)</Label>
                    <Input 
                      type="number" 
                      value={localPrefs.taxSettings.us.shortTermTax}
                      onChange={e => setLocalPrefs({
                        ...localPrefs, 
                        taxSettings: {
                          ...localPrefs.taxSettings,
                          us: { ...localPrefs.taxSettings.us, shortTermTax: parseFloat(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Long Term (%)</Label>
                    <Input 
                      type="number" 
                      value={localPrefs.taxSettings.us.longTermTax}
                      onChange={e => setLocalPrefs({
                        ...localPrefs, 
                        taxSettings: {
                          ...localPrefs.taxSettings,
                          us: { ...localPrefs.taxSettings.us, longTermTax: parseFloat(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Brokerage Fees</CardTitle>
              <CardDescription>Default percentage taken as fee from gross profit on sales.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs space-y-2">
                <Label>Default Broker Fee (%)</Label>
                <Input 
                  type="number" step="any"
                  value={localPrefs.feeSettings.brokerFeePercent}
                  onChange={e => setLocalPrefs({
                    ...localPrefs,
                    feeSettings: { ...localPrefs.feeSettings, brokerFeePercent: parseFloat(e.target.value) }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
