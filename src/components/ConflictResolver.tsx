import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function ConflictResolver() {
  const { conflict } = useData();

  if (!conflict) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3 text-amber-600">
            <AlertCircle className="w-6 h-6" />
            <CardTitle>Data Conflict Detected</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            The {conflict.type} was modified on another device. Which version would you like to keep?
          </p>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 p-6">
          <div className="space-y-4">
            <h4 className="font-bold text-center text-blue-600">Local Version (This Device)</h4>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs font-mono break-all h-48 overflow-y-auto">
              {JSON.stringify(conflict.local.data || conflict.local, null, 2)}
            </div>
            <Button className="w-full" variant="outline" onClick={() => conflict.onResolve(conflict.local)}>
              Keep Local
            </Button>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-center text-emerald-600">Server Version (Remote)</h4>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs font-mono break-all h-48 overflow-y-auto">
              {JSON.stringify(conflict.server.data || conflict.server, null, 2)}
            </div>
            <Button className="w-full" variant="outline" onClick={() => conflict.onResolve(conflict.server)}>
              Keep Server
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-muted-foreground p-3 justify-center">
          Choosing a version will overwrite the other permanently.
        </CardFooter>
      </Card>
    </div>
  );
}
