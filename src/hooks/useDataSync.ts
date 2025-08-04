
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export function useDataSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const syncAllData = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      
      // Simular processo de sincronização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncStatus('success');
      setLastSync(new Date());
      
      toast({
        title: 'Sincronização concluída',
        description: 'Todos os dados foram sincronizados com sucesso.',
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncStatus('error');
      
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar os dados.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const checkConnection = useCallback(async () => {
    try {
      // Simular verificação de conexão
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }, []);

  return {
    syncAllData,
    checkConnection,
    syncStatus,
    lastSync,
  };
}
