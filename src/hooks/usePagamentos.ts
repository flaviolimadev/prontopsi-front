import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

export interface Pagamento {
  id: string;
  userId: string;
  pacienteId: string;
  pacoteId: string | null;
  agendaSessaoId: string | null;
  data: string;
  vencimento: string;
  status: number; // 0 pendente, 1 pago, 2 confirmado, 3 cancelado
  value: number;
  descricao: string | null;
  type: number | null; // 1 pix, 2 cartão, 3 boleto, 4 espécie
  txid: string | null;
  createdAt: string;
  updatedAt: string;
  paciente?: {
    id: string;
    nome: string;
  };
  pacote?: {
    id: string;
    title: string;
  };
  agendaSessao?: {
    id: string;
    data: Date;
    horario: string;
  } | null;
}

export interface CreatePagamentoData {
  pacienteId: string;
  pacoteId?: string | null;
  agendaSessaoId?: string | null;
  data: string;
  vencimento: string;
  value: number;
  descricao?: string;
  type?: number;
  txid?: string;
}

export interface UpdatePagamentoData {
  pacienteId?: string;
  pacoteId?: string | null;
  agendaSessaoId?: string | null;
  data?: string;
  vencimento?: string;
  value?: number;
  descricao?: string;
  type?: number;
  txid?: string;
  status?: number;
}

export interface PagamentosFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  pacienteId?: string;
  pacoteId?: string;
}

export interface PagamentosResponse {
  data: Pagamento[];
  total: number;
  page: number;
  totalPages: number;
}

export function usePagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<PagamentosFilters>({
    page: 1,
    limit: 10,
  });
  const { toast } = useToast();

  // Buscar todos os pagamentos
  const fetchPagamentos = useCallback(async (filters?: PagamentosFilters) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPagamentos(filters);
      setPagamentos(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setFilters(filters || { page: 1, limit: 10 });
    } catch (err: any) {
      console.error('Erro ao buscar pagamentos:', err);
      setError(err.response?.data?.message || 'Erro ao buscar pagamentos');
      toast({
        title: "Erro",
        description: "Erro ao buscar pagamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar pagamento por ID
  const fetchPagamento = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPagamento(id);
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar pagamento:', err);
      
      let errorMessage = 'Erro ao buscar pagamento';
      if (err.response?.status === 404) {
        errorMessage = 'Pagamento não encontrado ou não pertence ao usuário';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar pagamentos por agenda sessão
  const fetchPagamentosByAgendaSessao = useCallback(async (agendaSessaoId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPagamentosByAgendaSessao(agendaSessaoId);
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar pagamentos da agenda:', err);
      
      let errorMessage = 'Erro ao buscar pagamentos da agenda';
      if (err.response?.status === 404) {
        errorMessage = 'Agenda não encontrada ou não pertence ao usuário';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar pagamento
  const createPagamento = useCallback(async (pagamentoData: CreatePagamentoData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.createPagamento(pagamentoData);
      toast({
        title: "Sucesso",
        description: "Pagamento criado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPagamentos(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao criar pagamento:', err);
      setError(err.response?.data?.message || 'Erro ao criar pagamento');
      toast({
        title: "Erro",
        description: err.response?.data?.message || "Erro ao criar pagamento",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPagamentos, filters]);

  // Atualizar pagamento
  const updatePagamento = useCallback(async (id: string, pagamentoData: UpdatePagamentoData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.updatePagamento(id, pagamentoData);
      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPagamentos(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao atualizar pagamento:', err);
      
      let errorMessage = 'Erro ao atualizar pagamento';
      if (err.response?.status === 404) {
        errorMessage = 'Pagamento não encontrado ou não pertence ao usuário';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPagamentos, filters]);

  // Excluir pagamento
  const deletePagamento = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.deletePagamento(id);
      toast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPagamentos(filters);
    } catch (err: any) {
      console.error('Erro ao excluir pagamento:', err);
      
      let errorMessage = 'Erro ao excluir pagamento';
      if (err.response?.status === 404) {
        errorMessage = 'Pagamento não encontrado ou já foi excluído';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPagamentos, filters]);

  // Atualizar status do pagamento
  const updatePagamentoStatus = useCallback(async (id: string, status: number) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.updatePagamentoStatus(id, status);
      toast({
        title: "Sucesso",
        description: "Status do pagamento atualizado com sucesso!"
      });
      
      // Recarregar a lista
      await fetchPagamentos(filters);
      
      return response;
    } catch (err: any) {
      console.error('Erro ao atualizar status do pagamento:', err);
      
      let errorMessage = 'Erro ao atualizar status do pagamento';
      if (err.response?.status === 404) {
        errorMessage = 'Pagamento não encontrado ou não pertence ao usuário';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPagamentos, filters]);

  // Buscar estatísticas
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getPagamentosStatistics();
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
    fetchPagamentos(newFilters);
  }, [filters, fetchPagamentos]);

  // Carregar dados automaticamente quando o hook é montado
  useEffect(() => {
    fetchPagamentos();
  }, [fetchPagamentos]);

  return {
    pagamentos,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    fetchPagamentos,
    fetchPagamento,
    fetchPagamentosByAgendaSessao,
    createPagamento,
    updatePagamento,
    deletePagamento,
    updatePagamentoStatus,
    fetchStatistics,
    changePage,
  };
} 