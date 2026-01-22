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
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-brand-100">
        <h2 className="text-2xl font-bold text-brand-900">System Settings</h2>
        <button 
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-all text-sm flex items-center"
          onClick={() => navigate('/')}
        >
          &larr; Back
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-10">
        <Tabs defaultValue="tax" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tax">Taxation Rules</TabsTrigger>
            <TabsTrigger value="categories">Categories & Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="tax" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* India Settings */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-brand-700 flex items-center"><span className="mr-2">🇮🇳</span> India Tax Rules</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Term Threshold (Days)</Label>
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
                      className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-400">Holding &lt;= this value is Short Term.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Term (%)</Label>
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
                        className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-bold text-gray-500 uppercase mb-1">Long Term (%)</Label>
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
                        className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* US Settings */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-blue-700 flex items-center"><span className="mr-2">🇺🇸</span> US Tax Rules</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Term Threshold (Days)</Label>
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
                      className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-400">Holding &lt;= this value is Short Term.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="block text-xs font-bold text-gray-500 uppercase mb-1">Short Term (%)</Label>
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
                        className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-xs font-bold text-gray-500 uppercase mb-1">Long Term (%)</Label>
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
                        className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
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
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Asset Types</h3>
                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-600 mb-2">Categories (one per line)</Label>
                  <textarea 
                    rows={6}
                    value={localPrefs.categories.join('\n')}
                    onChange={e => setLocalPrefs({
                      ...localPrefs,
                      categories: e.target.value.split('\n').filter(c => c.trim() !== '')
                    })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 transition-all shadow-inner"
                  />
                  <p className="mt-2 text-xs text-gray-400">Updates fees section on save.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Global Fees</h3>
                <div className="max-w-xs space-y-2">
                  <Label className="block text-sm font-medium text-gray-600 mb-2">Sell Brokerage (% on Profit)</Label>
                  <Input 
                    type="number" step="any"
                    value={localPrefs.feeSettings.brokerFeePercent}
                    onChange={e => setLocalPrefs({
                      ...localPrefs,
                      feeSettings: { ...localPrefs.feeSettings, brokerFeePercent: parseFloat(e.target.value) }
                    })}
                    className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
