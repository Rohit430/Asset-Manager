import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddAssetForm } from '@/components/forms/AddAssetForm';
import { AddTransactionForm } from '@/components/forms/AddTransactionForm';
import { AddLiquidAssetForm } from '@/components/forms/AddLiquidAssetForm';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AddPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const defaultTab = searchParams.get('tab') || 'transaction';
  const prefillType = searchParams.get('type');
  const prefillAsset = searchParams.get('asset');
  const editId = searchParams.get('editId');

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{editId ? 'Edit Transaction' : 'Add New Entry'}</h2>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
          Cancel
        </button>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
          <TabsTrigger value="asset">New Asset</TabsTrigger>
          <TabsTrigger value="liquid">Liquid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transaction">
          <AddTransactionForm 
            initialType={prefillType} 
            initialAssetId={prefillAsset}
            editTxId={editId}
            onSuccess={() => navigate(-1)} 
          />
        </TabsContent>
        
        <TabsContent value="asset">
          <AddAssetForm onSuccess={() => {
            navigate('/assets');
          }} />
        </TabsContent>

        <TabsContent value="liquid">
          <AddLiquidAssetForm onSuccess={() => {
            navigate('/liquid');
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
