import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api.service';

export interface AgendaSessao {
  id: string;
  userId: string;
  pacienteId: string;
  data: string;
  horario: string;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  duracao: number;
  observacao: string | null;
  value: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  paciente?: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
  };
}

export interface CreateAgendaSessaoData {
  pacienteId: string;
  data: string;
  horario: string;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  duracao: number;
  observacao?: string;
  value?: number;
  status?: number;
}

export interface UpdateAgendaSessaoData extends Partial<CreateAgendaSessaoData> {}

export function useAgendaSessoes() {
  const [agendaSessoes, setAgendaSessoes] = useState<AgendaSessao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  // Buscar todas as sessões
  const fetchAgendaSessoes = useCallback(async (
    pageNum: number = 1,
    limit: number = 50,
    search?: string,
    status?: number,
    dataInicio?: string,
    dataFim?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (status !== undefined) params.append('status', status.toString());
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const response = await apiService.getAgendaSessoes(params.toString());
      
      setAgendaSessoes(response.agendaSessoes);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Erro ao buscar sessões:', err);
      setError(err.response?.data?.message || 'Erro ao carregar sessões');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as sessões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar sessão por ID
  const getAgendaSessao = useCallback(async (id: string) => {
    try {
      const sessao = await apiService.getAgendaSessao(id);
      return sessao;
    } catch (err: any) {
      console.error('Erro ao buscar sessão:', err);
      throw err;
    }
  }, []);

  // Buscar sessões por paciente
  const getAgendaSessoesByPaciente = useCallback(async (pacienteId: string) => {
    try {
      const sessoes = await apiService.getAgendaSessoesByPaciente(pacienteId);
      return sessoes;
    } catch (err: any) {
      console.error('Erro ao buscar sessões do paciente:', err);
      throw err;
    }
  }, []);

  // Buscar sessões por data
  const getAgendaSessoesByDate = useCallback(async (data: string) => {
    try {
      const sessoes = await apiService.getAgendaSessoesByDate(data);
      return sessoes;
    } catch (err: any) {
      console.error('Erro ao buscar sessões por data:', err);
      throw err;
    }
  }, []);

  // Criar sessão
  const createAgendaSessao = useCallback(async (sessaoData: CreateAgendaSessaoData) => {
    try {
      setLoading(true);
      console.log('Dados sendo enviados para criar sessão:', sessaoData);
      console.log('Token de autenticação:', localStorage.getItem('auth_token'));
      
      const newSessao = await apiService.createAgendaSessao(sessaoData);
      
      setAgendaSessoes(prev => [newSessao, ...prev]);
      setTotal(prev => prev + 1);
      
      toast({
        title: 'Sucesso',
        description: 'Sessão agendada com sucesso!',
      });

      return newSessao;
    } catch (err: any) {
      console.error('Erro ao criar sessão:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao agendar sessão';
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

  // Atualizar sessão
  const updateAgendaSessao = useCallback(async (id: string, sessaoData: UpdateAgendaSessaoData) => {
    try {
      setLoading(true);
      console.log('Dados sendo enviados para atualizar sessão:', { id, sessaoData });
      
      const updatedSessao = await apiService.updateAgendaSessao(id, sessaoData);
      
      setAgendaSessoes(prev => prev.map(sessao => 
        sessao.id === id ? updatedSessao : sessao
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Sessão atualizada com sucesso!',
      });

      return updatedSessao;
    } catch (err: any) {
      console.error('Erro ao atualizar sessão:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar sessão';
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

  // Deletar sessão
  const deleteAgendaSessao = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      await apiService.deleteAgendaSessao(id);
      
      setAgendaSessoes(prev => prev.filter(sessao => sessao.id !== id));
      setTotal(prev => prev - 1);
      
      toast({
        title: 'Sucesso',
        description: 'Sessão removida com sucesso!',
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao deletar sessão:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao remover sessão';
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

  // Atualizar status da sessão
  const updateAgendaSessaoStatus = useCallback(async (id: string, status: number) => {
    try {
      setLoading(true);
      
      const updatedSessao = await apiService.updateAgendaSessaoStatus(id, status);
      
      setAgendaSessoes(prev => prev.map(sessao => 
        sessao.id === id ? updatedSessao : sessao
      ));
      
      toast({
        title: 'Sucesso',
        description: 'Status da sessão atualizado com sucesso!',
      });

      return updatedSessao;
    } catch (err: any) {
      console.error('Erro ao atualizar status da sessão:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar status';
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

  // Buscar estatísticas
  const getAgendaSessoesStatistics = useCallback(async () => {
    try {
      const statistics = await apiService.getAgendaSessoesStatistics();
      return statistics;
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      throw err;
    }
  }, []);

  // Retry function
  const retry = useCallback(() => {
    fetchAgendaSessoes();
  }, [fetchAgendaSessoes]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAgendaSessoes();
  }, [fetchAgendaSessoes]);

  return {
    agendaSessoes,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchAgendaSessoes,
    getAgendaSessao,
    getAgendaSessoesByPaciente,
    getAgendaSessoesByDate,
    createAgendaSessao,
    updateAgendaSessao,
    deleteAgendaSessao,
    updateAgendaSessaoStatus,
    getAgendaSessoesStatistics,
    retry
  };
} 