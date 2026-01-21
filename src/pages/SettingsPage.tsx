import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/hooks/useData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { encryptData } from '@/lib/crypto';
import { toast } from 'sonner';

export function SettingsPage() {
  const navigate = useNavigate();
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
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
          <p className="text-muted-foreground">Configure your tax rules and app preferences</p>
        </div>
        <button 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate('/')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="blurred-card p-6 rounded-xl shadow-lg space-y-8">
        <Tabs defaultValue="tax" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tax">Taxation Rules</TabsTrigger>
            <TabsTrigger value="categories">Categories & Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="tax" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* India Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <span>🇮🇳</span> India Tax Rules
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Short Term Threshold (Days)</Label>
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
                      className="border-gray-300 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 italic">Holding period &lt;= this value is Short Term.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Short Term (%)</Label>
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
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Long Term (%)</Label>
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
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* US Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <span>🇺🇸</span> US Tax Rules
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Short Term Threshold (Days)</Label>
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
                      className="border-gray-300 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 italic">Holding period &lt;= this value is Short Term.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Short Term (%)</Label>
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
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Long Term (%)</Label>
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
                        className="border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Asset Categories</h3>
                <div className="space-y-2">
                  <Label className="text-gray-700">Categories (one per line)</Label>
                  <textarea 
                    rows={6}
                    value={localPrefs.categories.join('\n')}
                    onChange={e => setLocalPrefs({
                      ...localPrefs,
                      categories: e.target.value.split('\n').filter(c => c.trim() !== '')
                    })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 italic">Adding/Removing categories will update the options in forms.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Brokerage Fees</h3>
                <div className="max-w-xs space-y-2">
                  <Label className="text-gray-700">Default Broker Fee (%)</Label>
                  <Input 
                    type="number" step="any"
                    value={localPrefs.feeSettings.brokerFeePercent}
                    onChange={e => setLocalPrefs({
                      ...localPrefs,
                      feeSettings: { ...localPrefs.feeSettings, brokerFeePercent: parseFloat(e.target.value) }
                    })}
                    className="border-gray-300 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 italic">% taken from gross profit on sales.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-6 rounded-md shadow-md text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
