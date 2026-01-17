import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { decryptData, encryptData } from '@/lib/crypto';
import type { Asset, Transaction, LiquidAsset, UserPreferences } from '@/lib/types';
import { toast } from 'sonner';

interface ConflictState {
  type: 'asset' | 'transaction' | 'liquid' | 'preferences';
  local: any;
  server: any;
  onResolve: (chosen: any) => void;
}

interface DataState {
  assets: Asset[];
  transactions: Transaction[];
  liquidAssets: LiquidAsset[];
  preferences: UserPreferences | null;
  loading: boolean;
  syncing: boolean;
  conflict: ConflictState | null;
}

export function useData() {
  const [state, setState] = useState<DataState>({
    assets: [],
    transactions: [],
    liquidAssets: [],
    preferences: null,
    loading: true,
    syncing: false,
    conflict: null
  });

  const getMasterKey = () => sessionStorage.getItem('master_key');

  const fetchData = useCallback(async () => {
    const mk = getMasterKey();
    if (!mk) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const [assetsRes, txRes, liquidRes, profileRes] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('liquid_assets').select('*'),
        supabase.from('profiles').select('preferences').single()
      ]);

      if (assetsRes.error) throw assetsRes.error;
      if (txRes.error) throw txRes.error;
      if (liquidRes.error) throw liquidRes.error;

      const decryptedAssets = await Promise.all(
        assetsRes.data.map(async (a) => ({
          ...a,
          data: await decryptData(a.encrypted_data, mk),
          totalQuantity: 0, totalCost: 0, avgBuyPrice: 0, realizedPL: 0, fifoQueue: []
        }))
      );

      const decryptedTransactions = await Promise.all(
        txRes.data.map(async (t) => ({
          ...t,
          data: await decryptData(t.encrypted_data, mk)
        }))
      );

      const decryptedLiquid = await Promise.all(
        liquidRes.data.map(async (l) => ({
          ...l,
          data: await decryptData(l.encrypted_data, mk)
        }))
      );
      
      let decryptedPrefs = null;
      if (profileRes.data?.preferences) {
         decryptedPrefs = await decryptData(profileRes.data.preferences, mk);
      } else {
        const defaults = {
          taxSettings: {
            india: { shortTermDays: 365, shortTermTax: 20, longTermTax: 15 },
            us: { shortTermDays: 730, shortTermTax: 20, longTermTax: 20 }
          },
          feeSettings: { brokerFeePercent: 5, categoryFees: {} },
          categories: ["Equity", "Gold", "Mutual Fund", "Real Estate", "Bond"]
        };
        const encrypted = await encryptData(defaults, mk);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ preferences: encrypted }).eq('id', user.id);
        }
        decryptedPrefs = defaults;
      }

      setState({
        assets: decryptedAssets,
        transactions: decryptedTransactions,
        liquidAssets: decryptedLiquid,
        preferences: decryptedPrefs,
        loading: false,
        syncing: false,
        conflict: null
      });

    } catch (err: any) {
      console.error('Sync Error:', err);
      // toast.error('Failed to sync data'); // Optional: silence this on init
      setState(prev => ({ ...prev, loading: false, syncing: false, conflict: null }));
    }
  }, []);

  useEffect(() => {
    const mk = getMasterKey();
    if (mk) fetchData();
  }, [fetchData]);

  const addAsset = async (type: string, country: string, data: any) => {
    const mk = getMasterKey();
    if (!mk) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setState(prev => ({ ...prev, syncing: true }));
    try {
      const encrypted = await encryptData(data, mk);
      const { data: newRow, error } = await supabase.from('assets').insert({
        user_id: user.id, type, country, encrypted_data: encrypted
      }).select().single();

      if (error) throw error;
      const newAsset: Asset = { ...newRow, data, totalQuantity: 0, totalCost: 0, avgBuyPrice: 0, realizedPL: 0, fifoQueue: [] };
      setState(prev => ({ ...prev, assets: [...prev.assets, newAsset], syncing: false }));
      toast.success('Asset added');
      return newAsset;
    } catch (err) {
      toast.error('Failed to save asset');
      setState(prev => ({ ...prev, syncing: false }));
    }
  };

  const updateAsset = async (asset: Asset, newData: any) => {
    const mk = getMasterKey();
    if (!mk) return;
    try {
      const encrypted = await encryptData(newData, mk);
      const { data, error, count } = await supabase.from('assets')
        .update({ encrypted_data: encrypted })
        .match({ id: asset.id, updated_at: asset.updated_at }).select();

      if (error) throw error;
      if (count === 0) {
        const { data: serverVersion } = await supabase.from('assets').select('*').eq('id', asset.id).single();
        const decryptedServer = { ...serverVersion, data: await decryptData(serverVersion.encrypted_data, mk) };
        setState(prev => ({
          ...prev, conflict: {
            type: 'asset', local: { ...asset, data: newData }, server: decryptedServer,
            onResolve: (chosen) => setState(p => ({ ...p, assets: p.assets.map(a => a.id === asset.id ? chosen : a), conflict: null }))
          }
        }));
        return;
      }
      setState(prev => ({ ...prev, assets: prev.assets.map(a => a.id === asset.id ? { ...a, data: newData, updated_at: data[0].updated_at } : a) }));
      toast.success('Asset updated');
    } catch (err) { toast.error('Failed to update asset'); }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
      toast.success('Asset deleted');
    } catch (err) { toast.error('Failed to delete asset'); }
  };

  const addTransaction = async (assetId: string, type: string, date: string, data: any) => {
    const mk = getMasterKey();
    if (!mk) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setState(prev => ({ ...prev, syncing: true }));
    try {
      const encrypted = await encryptData(data, mk);
      const { data: newRow, error } = await supabase.from('transactions').insert({
        user_id: user.id, asset_id: assetId, type, tx_date: date, encrypted_data: encrypted
      }).select().single();
      if (error) throw error;
      const newTx: Transaction = { ...newRow, data };
      setState(prev => ({ ...prev, transactions: [...prev.transactions, newTx], syncing: false }));
      toast.success('Transaction saved');
    } catch (err) {
      toast.error('Failed to save transaction');
      setState(prev => ({ ...prev, syncing: false }));
    }
  };

  const updateTransaction = async (tx: Transaction, newData: any) => {
    const mk = getMasterKey();
    if (!mk) return;
    try {
      const encrypted = await encryptData(newData, mk);
      const { data, error, count } = await supabase.from('transactions')
        .update({ encrypted_data: encrypted })
        .match({ id: tx.id, updated_at: tx.updated_at }).select();
      if (error) throw error;
      if (count === 0) {
        const { data: serverVersion } = await supabase.from('transactions').select('*').eq('id', tx.id).single();
        setState(prev => ({
          ...prev, conflict: {
            type: 'transaction', local: { ...tx, data: newData }, server: serverVersion,
            onResolve: (chosen) => setState(p => ({ ...p, transactions: p.transactions.map(t => t.id === tx.id ? chosen : t), conflict: null }))
          }
        }));
        return;
      }
      setState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === tx.id ? { ...t, data: newData, updated_at: data[0].updated_at } : t) }));
      toast.success('Transaction updated');
    } catch (err) { toast.error('Failed to update transaction'); }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
      toast.success('Transaction deleted');
    } catch (err) { toast.error('Failed to delete transaction'); }
  };

  return {
    ...state,
    refresh: fetchData,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
}