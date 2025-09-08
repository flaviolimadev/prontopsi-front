import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import adminService, { AdminStats, User, UsersResponse, UserDetails, SystemHealth, LogsResponse } from '@/services/admin.service';

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [routeAnalytics, setRouteAnalytics] = useState<any>(null);
  const [userRouteAnalytics, setUserRouteAnalytics] = useState<any>(null);
  const [userDetailedStats, setUserDetailedStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar estatísticas do sistema
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar estatísticas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários
  const loadUsers = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
    isAdmin?: boolean,
  ) => {
    try {
      console.log('🔧 useAdmin: Carregando usuários...', { page, limit, search, status, isAdmin });
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers(page, limit, search, status, isAdmin);
      console.log('🔧 useAdmin: Dados recebidos:', data);
      setUsers(data);
    } catch (err: any) {
      console.error('❌ useAdmin: Erro ao carregar usuários:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao carregar usuários';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar detalhes de um usuário
  const loadUserDetails = async (id: string): Promise<UserDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUserById(id);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar detalhes do usuário';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar usuário
  const updateUser = async (id: string, updateData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await adminService.updateUser(id, updateData);
      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar usuário';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Alternar status do usuário
  const toggleUserStatus = async (id: string, status: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await adminService.toggleUserStatus(id, status);
      toast({
        title: 'Sucesso',
        description: `Usuário ${status === 1 ? 'ativado' : 'desativado'} com sucesso`,
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao alterar status do usuário';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Alternar status de admin
  const toggleAdminStatus = async (id: string, isAdmin: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await adminService.toggleAdminStatus(id, isAdmin);
      toast({
        title: 'Sucesso',
        description: `Privilégios de admin ${isAdmin ? 'concedidos' : 'removidos'} com sucesso`,
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao alterar privilégios de admin';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar usuário
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await adminService.deleteUser(id);
      toast({
        title: 'Sucesso',
        description: 'Usuário deletado com sucesso',
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar usuário';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar saúde do sistema
  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemHealth();
      setSystemHealth(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar saúde do sistema';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar logs do sistema
  const loadSystemLogs = async (
    page: number = 1,
    limit: number = 50,
    level?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemLogs(page, limit, level);
      setLogs(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar logs do sistema';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar analytics de rotas
  const loadRouteAnalytics = useCallback(async () => {
    try {
      console.log('🔄 useAdmin: Carregando analytics de rotas...');
      setLoading(true);
      setError(null);
      const data = await adminService.getRouteAnalytics();
      console.log('✅ useAdmin: Analytics de rotas carregados:', data);
      setRouteAnalytics(data);
    } catch (err: any) {
      console.error('❌ useAdmin: Erro ao carregar analytics de rotas:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao carregar analytics de rotas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar analytics de usuários por rota
  const loadUserRouteAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUserRouteAnalytics();
      setUserRouteAnalytics(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar analytics de usuários';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar estatísticas detalhadas de usuários
  const loadUserDetailedStats = useCallback(async () => {
    try {
      console.log('🔍 useAdmin: loadUserDetailedStats iniciado');
      setLoading(true);
      setError(null);
      const data = await adminService.getUserDetailedStats();
      console.log('✅ useAdmin: Dados recebidos do backend:', data);
      setUserDetailedStats(data);
    } catch (err: any) {
      console.error('❌ useAdmin: Erro ao carregar getUserDetailedStats:', err);
      console.error('❌ useAdmin: Response:', err.response);
      console.error('❌ useAdmin: Status:', err.response?.status);
      console.error('❌ useAdmin: Data:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Erro ao carregar estatísticas detalhadas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    // Estados
    stats,
    users,
    systemHealth,
    logs,
    routeAnalytics,
    userRouteAnalytics,
    userDetailedStats,
    loading,
    error,
    
    // Ações
    loadStats,
    loadUsers,
    loadUserDetails,
    updateUser,
    toggleUserStatus,
    toggleAdminStatus,
    deleteUser,
    loadSystemHealth,
    loadSystemLogs,
    loadRouteAnalytics,
    loadUserRouteAnalytics,
    loadUserDetailedStats,
  };
}
