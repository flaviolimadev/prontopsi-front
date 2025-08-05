import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api.service';

export interface AgendaSessao {
  id: string;
  userId: string;
  pacienteId: string;
  data: string;
  horario: string;
  duracao: number;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  status: number; // 0: agendado, 1: em_andamento, 2: realizado, 3: cancelado
  observacao?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgendaSessoesResponse {
  agendaSessoes: AgendaSessao[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateAgendaSessaoData {
  pacienteId: string;
  data: string;
  horario: string;
  duracao: number;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  status?: number; // 0: agendado, 1: em_andamento, 2: realizado, 3: cancelado
  observacao?: string;
  value?: number;
}

export interface UpdateAgendaSessaoData extends Partial<CreateAgendaSessaoData> {}

export function useAgendaSessoesReal() {
  const [agendaSessoes, setAgendaSessoes] = useState<AgendaSessao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgendaSessoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get<AgendaSessoesResponse>('/agenda-sessoes');
      
      setAgendaSessoes(response.agendaSessoes || []);
      
    } catch (error: any) {
      console.error('Erro ao buscar agenda de sessões:', error);
      setError(error.message || 'Erro ao carregar agenda de sessões');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a agenda de sessões.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar dados automaticamente quando o hook é montado
  useEffect(() => {
    fetchAgendaSessoes();
  }, [fetchAgendaSessoes]);

  const createAgendaSessao = async (agendaSessaoData: CreateAgendaSessaoData): Promise<AgendaSessao | null> => {
    try {
      const response = await apiService.post<AgendaSessao>('/agenda-sessoes', agendaSessaoData);
      
      if (response) {
        setAgendaSessoes(prev => [response, ...prev]);
        
        toast({
          title: 'Sucesso',
          description: 'Sessão agendada com sucesso!',
        });

        return response;
      }
      
      return null;
    } catch (error: any) {
      console.error('Erro ao criar agenda de sessão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível agendar a sessão.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAgendaSessao = async (id: string, agendaSessaoData: UpdateAgendaSessaoData): Promise<boolean> => {
    try {
      const response = await apiService.put<AgendaSessao>(`/agenda-sessoes/${id}`, agendaSessaoData);
      
      if (response) {
        setAgendaSessoes(prev => prev.map(agendaSessao => 
          agendaSessao.id === id ? response : agendaSessao
        ));

        toast({
          title: 'Sucesso',
          description: 'Sessão atualizada com sucesso!',
        });

        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erro ao atualizar agenda de sessão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a sessão.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteAgendaSessao = async (id: string): Promise<boolean> => {
    try {
      await apiService.delete(`/agenda-sessoes/${id}`);
      
      setAgendaSessoes(prev => prev.filter(agendaSessao => agendaSessao.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Sessão removida com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar agenda de sessão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a sessão.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getAgendaSessaoById = (id: string): AgendaSessao | undefined => {
    return agendaSessoes.find(agendaSessao => agendaSessao.id === id);
  };

  const getAgendaSessoesByDate = (date: string): AgendaSessao[] => {
    return agendaSessoes.filter(agendaSessao => agendaSessao.data === date);
  };

  const getAgendaSessoesByPatient = (patientId: string): AgendaSessao[] => {
    return agendaSessoes.filter(agendaSessao => agendaSessao.pacienteId === patientId);
  };

  const getAgendaSessoesByStatus = (status: AgendaSessao['status']): AgendaSessao[] => {
    return agendaSessoes.filter(agendaSessao => agendaSessao.status === status);
  };

  const getTodayAgendaSessoes = (): AgendaSessao[] => {
    const today = new Date().toISOString().split('T')[0];
    return getAgendaSessoesByDate(today);
  };

  const retry = () => {
    fetchAgendaSessoes();
  };

  useEffect(() => {
    fetchAgendaSessoes();
  }, [fetchAgendaSessoes]);

  return {
    agendaSessoes,
    loading,
    error,
    createAgendaSessao,
    updateAgendaSessao,
    deleteAgendaSessao,
    getAgendaSessaoById,
    getAgendaSessoesByDate,
    getAgendaSessoesByPatient,
    getAgendaSessoesByStatus,
    getTodayAgendaSessoes,
    fetchAgendaSessoes,
    retry
  };
}