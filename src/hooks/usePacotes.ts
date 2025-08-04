import { useState, useCallback } from 'react';
import { apiService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

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

export interface CreatePacoteData {
  value: number;
  title: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UpdatePacoteData {
  value?: number;
  title?: string;
  descricao?: string;
  ativo?: boolean;
}

export interface PacotesFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface PacotesResponse {
  data: Pacote[];
  total: number;
  page: number;
  totalPages: number;
}

export function usePacotes() {
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<PacotesFilters>({
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();

  // Buscar todos os pacotes
  const fetchPacotes = useCallback(async (filters?: PacotesFilters) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPacotes(filters);
      setPacotes(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setFilters(filters || { page: 1, limit: 10 });
    } catch (err: any) {
      console.error('Erro ao buscar pacotes:', err);
      setError(err.response?.data?.message || 'Erro ao buscar pacotes');
      toast({
        title: "Erro",
        description: "Erro ao buscar pacotes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar pacote por ID
  const fetchPacote = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPacote(id);
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar pacote:', err);
      setError(err.response?.data?.message || 'Erro ao buscar pacote');
      toast({
        title: "Erro",
        description: "Erro ao buscar pacote",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar pacote
  const createPacote = useCallback(async (pacoteData: CreatePacoteData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.createPacote(pacoteData);
      toast({
        title: "Sucesso",
        description: "Pacote criado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPacotes(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao criar pacote:', err);
      setError(err.response?.data?.message || 'Erro ao criar pacote');
      toast({
        title: "Erro",
        description: err.response?.data?.message || "Erro ao criar pacote",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPacotes, filters]);

  // Atualizar pacote
  const updatePacote = useCallback(async (id: string, pacoteData: UpdatePacoteData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.updatePacote(id, pacoteData);
      toast({
        title: "Sucesso",
        description: "Pacote atualizado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPacotes(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao atualizar pacote:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar pacote');
      toast({
        title: "Erro",
        description: err.response?.data?.message || "Erro ao atualizar pacote",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPacotes, filters]);

  // Excluir pacote
  const deletePacote = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.deletePacote(id);
      toast({
        title: "Sucesso",
        description: "Pacote excluído com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPacotes(filters);
    } catch (err: any) {
      console.error('Erro ao excluir pacote:', err);
      setError(err.response?.data?.message || 'Erro ao excluir pacote');
      toast({
        title: "Erro",
        description: err.response?.data?.message || "Erro ao excluir pacote",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPacotes, filters]);

  // Ativar pacote
  const activatePacote = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.activatePacote(id);
      toast({
        title: "Sucesso",
        description: "Pacote ativado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPacotes(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao ativar pacote:', err);
      setError(err.response?.data?.message || 'Erro ao ativar pacote');
      toast({
        title: "Erro",
        description: err.response?.data?.message || "Erro ao ativar pacote",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPacotes, filters]);

  // Desativar pacote
  const deactivatePacote = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.deactivatePacote(id);
      toast({
        title: "Sucesso",
        description: "Pacote desativado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPacotes(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao desativar pacote:', err);
      setError(err.response?.data?.message || 'Erro ao desativar pacote');
      toast({
        title: "Erro",
        description: err.response?.data?.message || "Erro ao desativar pacote",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPacotes, filters]);

  // Buscar estatísticas
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPacotesStatistics();
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err.response?.data?.message || 'Erro ao buscar estatísticas');
      toast({
        title: "Erro",
        description: "Erro ao buscar estatísticas",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mudar página
  const changePage = useCallback((newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    fetchPacotes(newFilters);
  }, [filters, fetchPacotes]);

  return {
    pacotes,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    fetchPacotes,
    fetchPacote,
    createPacote,
    updatePacote,
    deletePacote,
    activatePacote,
    deactivatePacote,
    fetchStatistics,
    changePage,
  };
} 