import { useState, useCallback } from 'react';
import { apiService } from '@/services/api.service';

export interface CadastroLink {
  id: string;
  userId: string;
  token: string;
  title: string;
  description: string | null;
  isActive: boolean;
  maxUses: number;
  currentUses: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  submissions: CadastroSubmission[];
}

export interface CadastroSubmission {
  id: string;
  cadastroLinkId: string;
  status: 'pending' | 'approved' | 'rejected';
  pacienteData: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    dataConsulta?: string;
    horaConsulta?: string;
  };
  observacoes: string | null;
  approvedPacienteId: string | null;
  createdAt: Date;
  updatedAt: Date;
  cadastroLink: CadastroLink;
  approvedPaciente?: any;
}

export interface CreateCadastroLinkData {
  title: string;
  description?: string;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateCadastroLinkData {
  title?: string;
  description?: string;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface CreateCadastroSubmissionData {
  token: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataConsulta?: string;
  horaConsulta?: string;
}

export interface UpdateCadastroSubmissionData {
  status?: string;
  observacoes?: string;
  pacienteId?: string;
  appointmentData?: any;
}

export const useCadastroLinks = () => {
  const [links, setLinks] = useState<CadastroLink[]>([]);
  const [submissions, setSubmissions] = useState<CadastroSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os links
  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getCadastroLinks();
      setLinks(response || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Backend não está rodando ou usuário não autenticado

        setLinks([]);
        setError(null); // Não mostrar erro para o usuário
      } else {
        console.error('Erro ao buscar links:', err);
        setError(err.response?.data?.message || 'Erro ao buscar links');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo link
  const createLink = useCallback(async (data: CreateCadastroLinkData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createCadastroLink(data);
      await fetchLinks(); // Recarregar lista
      return response;
    } catch (err: any) {
      console.error('Erro ao criar link:', err);
      setError(err.response?.data?.message || 'Erro ao criar link');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLinks]);

  // Atualizar link
  const updateLink = useCallback(async (id: string, data: UpdateCadastroLinkData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateCadastroLink(id, data);
      await fetchLinks(); // Recarregar lista
      return response;
    } catch (err: any) {
      console.error('Erro ao atualizar link:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar link');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLinks]);

  // Deletar link
  const deleteLink = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteCadastroLink(id);
      await fetchLinks(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao deletar link:', err);
      setError(err.response?.data?.message || 'Erro ao deletar link');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLinks]);

  // Buscar todas as submissões
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCadastroSubmissions();
      setSubmissions(response || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Backend não está rodando ou usuário não autenticado
        setSubmissions([]);
        setError(null); // Não mostrar erro para o usuário
      } else {
        console.error('Erro ao buscar submissões:', err);
        setError(err.response?.data?.message || 'Erro ao buscar submissões');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Aprovar submissão
  const approveSubmission = useCallback(async (id: string, data: UpdateCadastroSubmissionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.approveCadastroSubmission(id, data);
      await fetchSubmissions(); // Recarregar lista
      return response;
    } catch (err: any) {
      console.error('Erro ao aprovar submissão:', err);
      setError(err.response?.data?.message || 'Erro ao aprovar submissão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSubmissions]);

  // Rejeitar submissão
  const rejectSubmission = useCallback(async (id: string, data: UpdateCadastroSubmissionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.rejectCadastroSubmission(id, data);
      await fetchSubmissions(); // Recarregar lista
      return response;
    } catch (err: any) {
      console.error('Erro ao rejeitar submissão:', err);
      setError(err.response?.data?.message || 'Erro ao rejeitar submissão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSubmissions]);

  // Buscar link público (para formulário público)
  const getPublicLink = useCallback(async (token: string) => {
    try {
      setError(null);
      const response = await apiService.getPublicCadastroLink(token);
      return response;
    } catch (err: any) {
      console.error('Erro ao buscar link público:', err);
      setError(err.response?.data?.message || 'Erro ao buscar link público');
      throw err;
    }
  }, []);

  // Criar submissão pública (para formulário público)
  const createPublicSubmission = useCallback(async (data: CreateCadastroSubmissionData) => {
    try {
      setError(null);
      const response = await apiService.createPublicCadastroSubmission(data);
      return response;
    } catch (err: any) {
      console.error('Erro ao criar submissão pública:', err);
      setError(err.response?.data?.message || 'Erro ao criar submissão pública');
      throw err;
    }
  }, []);

  return {
    links,
    submissions,
    loading,
    error,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    fetchSubmissions,
    approveSubmission,
    rejectSubmission,
    getPublicLink,
    createPublicSubmission,
  };
};
