import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { useToast } from './use-toast';

export interface Pacote {
  id: string;
  userId: string;
  value: number;
  title: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PacotesResponse {
  pacotes: Pacote[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PacotesFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export const usePacotes = () => {
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<PacotesFilters>({
    page: 1,
    limit: 10,
  });

  const { toast } = useToast();

  // Buscar pacotes
  const fetchPacotes = useCallback(async (filters: PacotesFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPacotes(filters);

      setPacotes(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Erro ao buscar pacotes:', err);
      setError(err.response?.data?.message || 'Erro ao carregar pacotes');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacotes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar pacote por ID
  const getPacote = useCallback(async (id: string) => {
    try {
      const pacote = await apiService.getPacote(id);
      return pacote;
    } catch (err: any) {
      console.error('Erro ao buscar pacote:', err);
      throw err;
    }
  }, []);

  // Criar pacote
  const createPacote = useCallback(async (pacoteData: Omit<Pacote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newPacote = await apiService.createPacote(pacoteData);
      
      setPacotes(prev => [newPacote, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Pacote criado com sucesso.',
      });
      
      return newPacote;
    } catch (err: any) {
      console.error('Erro ao criar pacote:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao criar pacote';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Atualizar pacote
  const updatePacote = useCallback(async (id: string, pacoteData: Partial<Pacote>) => {
    try {
      setLoading(true);
      const updatedPacote = await apiService.updatePacote(id, pacoteData);
      
      setPacotes(prev => prev.map(pacote => 
        pacote.id === id ? updatedPacote : pacote
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Pacote atualizado com sucesso.',
      });
      
      return updatedPacote;
    } catch (err: any) {
      console.error('Erro ao atualizar pacote:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar pacote';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Deletar pacote
  const deletePacote = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await apiService.deletePacote(id);
      
      setPacotes(prev => prev.filter(pacote => pacote.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Pacote deletado com sucesso.',
      });
    } catch (err: any) {
      console.error('Erro ao deletar pacote:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao deletar pacote';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Ativar pacote
  const activatePacote = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const updatedPacote = await apiService.activatePacote(id);
      
      setPacotes(prev => prev.map(pacote => 
        pacote.id === id ? updatedPacote : pacote
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Pacote ativado com sucesso.',
      });
      
      return updatedPacote;
    } catch (err: any) {
      console.error('Erro ao ativar pacote:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao ativar pacote';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Desativar pacote
  const deactivatePacote = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const updatedPacote = await apiService.deactivatePacote(id);
      
      setPacotes(prev => prev.map(pacote => 
        pacote.id === id ? updatedPacote : pacote
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Pacote desativado com sucesso.',
      });
      
      return updatedPacote;
    } catch (err: any) {
      console.error('Erro ao desativar pacote:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao desativar pacote';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar estatísticas dos pacotes
  const getPacotesStatistics = useCallback(async () => {
    try {
      const statistics = await apiService.getPacotesStatistics();
      return statistics;
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas dos pacotes:', err);
      throw err;
    }
  }, []);

  // Carregar pacotes na inicialização
  useEffect(() => {
    fetchPacotes(filters);
  }, [fetchPacotes, filters]);

  return {
    pacotes,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    setFilters,
    fetchPacotes,
    getPacote,
    createPacote,
    updatePacote,
    deletePacote,
    activatePacote,
    deactivatePacote,
    getPacotesStatistics,
  };
}; 