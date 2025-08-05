import { useState, useCallback } from 'react';
import { apiService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

interface ProntuarioEntry {
  id: string;
  date: string;
  type: 'avaliacao' | 'evolucao' | 'encaminhamento';
  content: string;
  psychologist: string;
  agendaId?: string; // ID do agendamento relacionado
}

interface Anexo {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ProntuarioData {
  id?: string;
  pacienteId: string;
  avaliacaoDemanda: string;
  evolucao: ProntuarioEntry[];
  encaminhamento: string;
  anexos: Anexo[];
}

// Interface para atualizações parciais
export interface ProntuarioUpdateData {
  pacienteId: string;
  avaliacaoDemanda?: string;
  encaminhamento?: string;
  evolucao?: ProntuarioEntry[];
  anexos?: Anexo[];
}

export const useProntuarios = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getProntuario = useCallback(async (pacienteId: string): Promise<ProntuarioData | null> => {
    try {
      setLoading(true);
      console.log('Buscando prontuário para paciente:', pacienteId);
      console.log('Token no localStorage:', localStorage.getItem('auth_token'));
      const response = await apiService.get(`/prontuarios/paciente/${pacienteId}`);
      console.log('Resposta da busca:', response);
      return response;
    } catch (error: any) {
      console.error('Erro ao buscar prontuário:', error);
      console.error('Status do erro:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
      
      if (error.response?.status === 404) {
        // Prontuário não existe ainda, retornar estrutura vazia
        console.log('Prontuário não encontrado, retornando estrutura vazia');
        return {
          pacienteId,
          avaliacaoDemanda: '',
          evolucao: [],
          encaminhamento: '',
          anexos: []
        };
      }
      toast({
        title: "Erro",
        description: `Erro ao carregar prontuário: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveProntuario = useCallback(async (prontuarioData: ProntuarioUpdateData): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Salvando prontuário:', prontuarioData);
      console.log('Token no localStorage (save):', localStorage.getItem('auth_token'));
      const response = await apiService.put(`/prontuarios/paciente/${prontuarioData.pacienteId}`, prontuarioData);
      console.log('Resposta do servidor:', response);
      toast({
        title: "Sucesso",
        description: "Prontuário salvo com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
      console.error('Detalhes do erro:', error.response?.data);
      toast({
        title: "Erro",
        description: `Erro ao salvar prontuário: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addEvolucao = useCallback(async (pacienteId: string, evolucaoEntry: ProntuarioEntry): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Adicionando evolução:', { pacienteId, evolucaoEntry });
      console.log('Token no localStorage (evolução):', localStorage.getItem('auth_token'));
      const response = await apiService.post(`/prontuarios/paciente/${pacienteId}/evolucao`, evolucaoEntry);
      console.log('Resposta do servidor (evolução):', response);
      toast({
        title: "Sucesso",
        description: "Entrada de evolução adicionada com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar evolução:', error);
      console.error('Detalhes do erro (evolução):', error.response?.data);
      toast({
        title: "Erro",
        description: `Erro ao adicionar evolução: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEvolucao = useCallback(async (pacienteId: string, evolucaoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.delete(`/prontuarios/paciente/${pacienteId}/evolucao/${evolucaoId}`);
      toast({
        title: "Sucesso",
        description: "Entrada de evolução removida com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover evolução:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover evolução.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addAnexo = useCallback(async (pacienteId: string, anexo: Anexo): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.post(`/prontuarios/paciente/${pacienteId}/anexo`, anexo);
      toast({
        title: "Sucesso",
        description: "Anexo adicionado com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar anexo:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar anexo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteAnexo = useCallback(async (pacienteId: string, anexoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.delete(`/prontuarios/paciente/${pacienteId}/anexo/${anexoId}`);
      toast({
        title: "Sucesso",
        description: "Anexo removido com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover anexo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    getProntuario,
    saveProntuario,
    addEvolucao,
    deleteEvolucao,
    addAnexo,
    deleteAnexo,
  };
}; 