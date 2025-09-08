import apiService from './api.service';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    newToday: number;
  };
  sessions: {
    total: number;
    newToday: number;
  };
  patients: {
    total: number;
  };
  system: {
    health: string;
    uptime: string;
    lastCheck: string;
  };
}

export interface User {
  id: string;
  nome: string;
  sobrenome: string;
  fullName: string;
  email: string;
  code: string;
  contato?: string;
  phone?: string;
  crp?: string;
  clinicName?: string;
  address?: string;
  bio?: string;
  whatsappNumber?: string;
  whatsappReportsEnabled?: boolean;
  whatsappReportTime?: string;
  reportConfig?: any;
  status: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  pontos: number;
  nivelId: number;
  planoId?: string;
  avatar?: string;
  descricao?: string;
  referredAt?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserDetails extends User {
  stats: {
    totalSessions: number;
    totalPatients: number;
    totalPagamentos?: number;
    pontosEmReais?: number;
  };
}

export interface SystemHealth {
  status: string;
  database: string;
  api: string;
  uptime: string;
  lastCheck: string;
  memory?: any;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  level: string;
  message: string;
  timestamp: string;
  userId?: string;
}

export interface LogsResponse {
  logs: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AdminService {
  private baseUrl = '/admin';

  // Estatísticas gerais do sistema
  async getStats(): Promise<AdminStats> {
    const response = await apiService.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Listar usuários com paginação e filtros
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
    isAdmin?: boolean,
  ): Promise<UsersResponse> {
    console.log('🔧 AdminService: Carregando usuários...', { page, limit, search, status, isAdmin });
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (status !== undefined) params.append('status', status.toString());
    if (isAdmin !== undefined) params.append('isAdmin', isAdmin.toString());

    const url = `${this.baseUrl}/users?${params}`;
    console.log('🔧 AdminService: URL da requisição:', url);
    
    const response = await apiService.get(url);
    console.log('🔧 AdminService: Resposta recebida:', response);
    return response;
  }

  // Obter detalhes de um usuário específico
  async getUserById(id: string): Promise<UserDetails> {
    const response = await apiService.get(`${this.baseUrl}/users/${id}`);
    return response;
  }

  // Atualizar usuário
  async updateUser(id: string, updateData: any): Promise<UserDetails> {
    const response = await apiService.put(`${this.baseUrl}/users/${id}`, updateData);
    return response.data;
  }

  // Ativar/Desativar usuário
  async toggleUserStatus(id: string, status: number): Promise<UserDetails> {
    const response = await apiService.put(`${this.baseUrl}/users/${id}/status`, { status });
    return response.data;
  }

  // Tornar usuário admin ou remover privilégios
  async toggleAdminStatus(id: string, isAdmin: boolean): Promise<UserDetails> {
    const response = await apiService.put(`${this.baseUrl}/users/${id}/admin`, { isAdmin });
    return response.data;
  }

  // Deletar usuário
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiService.delete(`${this.baseUrl}/users/${id}`);
    return response.data;
  }

  // Estatísticas de usuários
  async getUserStats(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/users/stats`);
    return response.data;
  }

  // Monitoramento do sistema
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiService.get(`${this.baseUrl}/system/health`);
    return response.data;
  }

  // Analytics de rotas
  async getRouteAnalytics(): Promise<any> {
    console.log('🔍 AdminService: Fazendo requisição para /analytics/routes');
    try {
      const response = await apiService.get(`${this.baseUrl}/analytics/routes`);
      console.log('✅ AdminService: Resposta recebida:', response.data);
      console.log('✅ AdminService: Resposta completa:', response);
      
      // Se response.data é undefined, mas response tem os dados diretamente
      if (response.data === undefined && response.routes !== undefined) {
        console.log('🔧 AdminService: Dados de rotas estão diretamente no response, não em response.data');
        return response;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AdminService: Erro na requisição:', error);
      throw error;
    }
  }

  // Analytics de usuários por rota
  async getUserRouteAnalytics(): Promise<any> {
    console.log('🔍 AdminService: Fazendo requisição para /analytics/users-routes');
    try {
      const response = await apiService.get(`${this.baseUrl}/analytics/users-routes`);
      console.log('✅ AdminService: Resposta recebida:', response.data);
      console.log('✅ AdminService: Resposta completa:', response);
      
      // Se response.data é undefined, mas response tem os dados diretamente
      if (response.data === undefined && response.users !== undefined) {
        console.log('🔧 AdminService: Dados de usuários por rota estão diretamente no response, não em response.data');
        return response;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AdminService: Erro na requisição getUserRouteAnalytics:', error);
      throw error;
    }
  }

  // Estatísticas detalhadas de usuários
  async getUserDetailedStats(): Promise<any> {
    console.log('🔍 AdminService: Fazendo requisição para getUserDetailedStats');
    try {
      const response = await apiService.get(`${this.baseUrl}/users/detailed-stats`);
      console.log('✅ AdminService: Resposta completa:', response);
      console.log('✅ AdminService: Response status:', response.status);
      console.log('✅ AdminService: Response data:', response.data);
      console.log('✅ AdminService: Response headers:', response.headers);
      
      // Se response.data é undefined, mas response tem os dados diretamente
      if (response.data === undefined && response.totalUsers !== undefined) {
        console.log('🔧 AdminService: Dados estão diretamente no response, não em response.data');
        return response;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AdminService: Erro na requisição getUserDetailedStats:', error);
      console.error('❌ AdminService: Error response:', error.response);
      throw error;
    }
  }

  // Logs do sistema
  async getSystemLogs(
    page: number = 1,
    limit: number = 50,
    level?: string,
  ): Promise<LogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (level) params.append('level', level);

    const response = await apiService.get(`${this.baseUrl}/system/logs?${params}`);
    return response.data;
  }
}

export default new AdminService();
