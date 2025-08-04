import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { useToast } from './use-toast';

export interface Paciente {
  id: string;
  userId: string;
  nome: string;
  email: string | null;
  endereco: string | null;
  telefone: string | null;
  profissao: string | null;
  nascimento: string | null;
  cpf: string | null;
  genero: string | null;
  observacao_geral: string | null;
  contato_emergencia: string | null;
  medicacoes: any[] | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface PacientesResponse {
  pacientes: Paciente[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PacientesFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
}

export const usePacientes = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<PacientesFilters>({
    page: 1,
    limit: 10,
  });

  const { toast } = useToast();

  // Buscar pacientes
  const fetchPacientes = useCallback(async (filters: PacientesFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPacientes(
        filters.page || 1,
        filters.limit || 10,
        filters.search,
        filters.status
      );

      setPacientes(response.pacientes);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Erro ao buscar pacientes:', err);
      setError(err.response?.data?.message || 'Erro ao carregar pacientes');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacientes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar paciente por ID
  const getPaciente = useCallback(async (id: string) => {
    try {
      const paciente = await apiService.getPaciente(id);
      return paciente;
    } catch (err: any) {
      console.error('Erro ao buscar paciente:', err);
      throw err;
    }
  }, []);

  // Criar paciente
  const createPaciente = useCallback(async (pacienteData: Omit<Paciente, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      console.log('Dados sendo enviados para criar paciente:', pacienteData);
      console.log('Token de autenticação:', localStorage.getItem('auth_token'));
      const newPaciente = await apiService.createPaciente(pacienteData);
      
      setPacientes(prev => [newPaciente, ...prev]);
      setTotal(prev => prev + 1);
      
      toast({
        title: 'Sucesso',
        description: 'Paciente criado com sucesso!',
      });

      return newPaciente;
    } catch (err: any) {
      console.error('Erro ao criar paciente:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao criar paciente';
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

  // Atualizar paciente
  const updatePaciente = async (id: string, pacienteData: Partial<Paciente>) => {
    try {
      setLoading(true);
      const updatedPaciente = await apiService.updatePaciente(id, pacienteData);
      
      setPacientes(prev => 
        prev.map(paciente => 
          paciente.id === id ? updatedPaciente : paciente
        )
      );
      
      toast({
        title: 'Sucesso',
        description: 'Paciente atualizado com sucesso!',
      });

      return updatedPaciente;
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar paciente';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar paciente
  const deletePaciente = async (id: string) => {
    try {
      setLoading(true);
      await apiService.deletePaciente(id);
      
      setPacientes(prev => prev.filter(paciente => paciente.id !== id));
      setTotal(prev => prev - 1);
      
      toast({
        title: 'Sucesso',
        description: 'Paciente deletado com sucesso!',
      });
    } catch (err: any) {
      console.error('Erro ao deletar paciente:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao deletar paciente';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Desativar paciente
  const deactivatePaciente = async (id: string) => {
    try {
      setLoading(true);
      const updatedPaciente = await apiService.deactivatePaciente(id);
      
      setPacientes(prev => 
        prev.map(paciente => 
          paciente.id === id ? updatedPaciente : paciente
        )
      );
      
      toast({
        title: 'Sucesso',
        description: 'Paciente desativado com sucesso!',
      });

      return updatedPaciente;
    } catch (err: any) {
      console.error('Erro ao desativar paciente:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao desativar paciente';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reativar paciente
  const reactivatePaciente = async (id: string) => {
    try {
      setLoading(true);
      const updatedPaciente = await apiService.reactivatePaciente(id);
      
      setPacientes(prev => 
        prev.map(paciente => 
          paciente.id === id ? updatedPaciente : paciente
        )
      );
      
      toast({
        title: 'Sucesso',
        description: 'Paciente reativado com sucesso!',
      });

      return updatedPaciente;
    } catch (err: any) {
      console.error('Erro ao reativar paciente:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao reativar paciente';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Adicionar medicação
  const addMedication = async (pacienteId: string, medication: any) => {
    try {
      setLoading(true);
      const updatedPaciente = await apiService.addMedication(pacienteId, medication);
      
      setPacientes(prev => 
        prev.map(paciente => 
          paciente.id === pacienteId ? updatedPaciente : paciente
        )
      );
      
      toast({
        title: 'Sucesso',
        description: 'Medicação adicionada com sucesso!',
      });

      return updatedPaciente;
    } catch (err: any) {
      console.error('Erro ao adicionar medicação:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar medicação';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remover medicação
  const removeMedication = async (pacienteId: string, medicationIndex: number) => {
    try {
      setLoading(true);
      const updatedPaciente = await apiService.removeMedication(pacienteId, medicationIndex);
      
      setPacientes(prev => 
        prev.map(paciente => 
          paciente.id === pacienteId ? updatedPaciente : paciente
        )
      );
      
      toast({
        title: 'Sucesso',
        description: 'Medicação removida com sucesso!',
      });

      return updatedPaciente;
    } catch (err: any) {
      console.error('Erro ao remover medicação:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao remover medicação';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: Partial<PacientesFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset para primeira página
    setFilters(updatedFilters);
    fetchPacientes(updatedFilters);
  }, [filters, fetchPacientes]);

  // Mudar página
  const changePage = useCallback((newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    fetchPacientes(updatedFilters);
  }, [filters, fetchPacientes]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchPacientes(filters);
  }, []);

  return {
    pacientes,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    fetchPacientes,
    getPaciente,
    createPaciente,
    updatePaciente,
    deletePaciente,
    deactivatePaciente,
    reactivatePaciente,
    addMedication,
    removeMedication,
    applyFilters,
    changePage,
  };
}; 