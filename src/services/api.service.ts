import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('🔧 API Service - Base URL:', baseURL);
    console.log('🔧 API Service - VITE_API_URL:', import.meta.env.VITE_API_URL);
    
    this.api = axios.create({
      baseURL,
      timeout: 30000, // Aumentar timeout para 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
      this.api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      

      
      // Lista de rotas públicas que não precisam de autenticação
      const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/verify-email',
        '/auth/resend-verification',
        '/auth/request-password-reset',
        '/auth/verify-reset-code',
        '/auth/reset-password',
        '/cadastro-links/public/',
        '/cadastro-links/public/submit'
      ];
      
      // Verificar se a rota atual é pública
      const isPublicRoute = publicRoutes.some(route => 
        config.url?.includes(route)
      );
      

      
      // Log para debug
      if (config.url?.includes('/cadastro-links/public/')) {
        console.log('🔍 Rota pública detectada:', config.url);
        console.log('🔍 Token será adicionado:', !isPublicRoute);
      }
      
      // Só adicionar token se não for rota pública
      if (token && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Não sobrescrever Content-Type para multipart/form-data
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        delete config.headers['Content-Type'];
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Tratar erros de autenticação
        if (error.response?.status === 401) {
          const requestUrl: string = error.config?.url || '';
          const isAuthEndpoint = [
            '/auth/login',
            '/auth/register',
            '/auth/verify-email',
            '/auth/resend-verification',
            '/auth/request-password-reset',
            '/auth/verify-reset-code',
            '/auth/reset-password'
          ].some((p) => requestUrl.includes(p));

          // Em endpoints de auth, não redirecionar automaticamente; deixar o caller tratar
          if (!isAuthEndpoint) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            // Evitar quebrar HashRouter: usar hash quando disponível
            const base = window.location.origin + window.location.pathname;
            window.location.href = base + '#/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Métodos específicos para autenticação
  async login(email: string, password: string) {
    return this.post<{ token: string; user: { emailVerified: boolean; [key: string]: any } }>('/auth/login', {
      email,
      password,
    });
  }

  async register(userData: any) {
    return this.post<{ token?: string; user?: any; message?: string; requiresVerification?: boolean }>('/auth/register', userData);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async verifyEmail(email: string, verificationCode: string) {
    return this.post<{ token: string; user: any; message: string }>('/auth/verify-email', {
      email,
      verificationCode
    });
  }

  async resendVerificationCode(email: string) {
    return this.post<{ message: string }>('/auth/resend-verification', { email });
  }

  // Métodos para usuários
  async getCurrentUser() {
    return this.get<any>('/users/me/profile');
  }

  async updateUser(userId: string, userData: any) {
    return this.put<any>(`/users/${userId}`, userData);
  }

  async getUserByCode(code: string) {
    return this.get<any>(`/users/code/${code}`);
  }

  // Métodos para configurações e perfil
  async getProfile() {
    return this.get<any>('/users/me/profile');
  }

  async updateProfile(profileData: any) {
    return this.put<any>('/users/me/profile', profileData);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.put<any>('/users/me/password', {
      currentPassword,
      newPassword,
    });
  }

  async uploadAvatar(file: File, onProgress?: (progress: number) => void) {
    console.log('ApiService: Iniciando upload de avatar:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const formData = new FormData();
    formData.append('avatar', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    console.log('ApiService: Enviando requisição para /profile/avatar');
    const result = await this.post<any>('/profile/avatar', formData, config);
    console.log('ApiService: Resultado do upload:', result);
    return result;
  }

  async deleteAvatar() {
    return this.delete<any>('/profile/avatar');
  }

  // Upload avatar do paciente
  async uploadPacienteAvatar(pacienteId: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('avatar', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      } : undefined,
    };

    const result = await this.post<any>(`/pacientes/${pacienteId}/avatar`, formData, config);
    return result;
  }

  // Deletar avatar do paciente
  async deletePacienteAvatar(pacienteId: string) {
    return this.delete<any>(`/pacientes/${pacienteId}/avatar`);
  }

  async exportUserData() {
    return this.get<any>('/users/me/export');
  }

  async deleteAccount() {
    return this.delete<any>('/users/me');
  }

  async updateNotificationSettings(settings: any) {
    return this.put<any>('/users/me/notifications', settings);
  }

  async updateScheduleSettings(settings: any) {
    return this.put<any>('/users/me/schedule', settings);
  }

  async updateFinancialSettings(settings: any) {
    return this.put<any>('/users/me/financial', settings);
  }

  // Métodos para pacientes (quando implementados)
  async getPatients() {
    return this.get<any[]>('/patients');
  }

  async createPatient(patientData: any) {
    return this.post<any>('/patients', patientData);
  }

  async updatePatient(patientId: string, patientData: any) {
    return this.put<any>(`/patients/${patientId}`, patientData);
  }

  async deletePatient(patientId: string) {
    return this.delete(`/patients/${patientId}`);
  }

  // Métodos para agendamentos (quando implementados)
  async getAppointments() {
    return this.get<any[]>('/appointments');
  }

  async createAppointment(appointmentData: any) {
    return this.post<any>('/appointments', appointmentData);
  }

  async updateAppointment(appointmentId: string, appointmentData: any) {
    return this.put<any>(`/appointments/${appointmentId}`, appointmentData);
  }

  async deleteAppointment(appointmentId: string) {
    return this.delete(`/appointments/${appointmentId}`);
  }

  // Métodos para prontuários (quando implementados)
  async getMedicalRecords() {
    return this.get<any[]>('/medical-records');
  }

  async createMedicalRecord(recordData: any) {
    return this.post<any>('/medical-records', recordData);
  }

  async updateMedicalRecord(recordId: string, recordData: any) {
    return this.put<any>(`/medical-records/${recordId}`, recordData);
  }

  async deleteMedicalRecord(recordId: string) {
    return this.delete(`/medical-records/${recordId}`);
  }

  // Métodos para financeiro (quando implementados)
  async getFinancialRecords() {
    return this.get<any[]>('/financial-records');
  }

  async createFinancialRecord(recordData: any) {
    return this.post<any>('/financial-records', recordData);
  }

  async updateFinancialRecord(recordId: string, recordData: any) {
    return this.put<any>(`/financial-records/${recordId}`, recordData);
  }

  async deleteFinancialRecord(recordId: string) {
    return this.delete(`/financial-records/${recordId}`);
  }

  // Métodos para arquivos (quando implementados)
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  async getFiles() {
    return this.get<any[]>('/files');
  }

  async deleteFile(fileId: string) {
    return this.delete(`/files/${fileId}`);
  }

  // Métodos para relatórios (quando implementados)
  async getReports() {
    return this.get<any[]>('/reports');
  }

  async generateReport(reportData: any) {
    return this.post<any>('/reports/generate', reportData);
  }

  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv') {
    return this.get(`/reports/${reportId}/export?format=${format}`, {
      responseType: 'blob',
    });
  }

  // ===== PACIENTES =====
  // Buscar todos os pacientes
  async getPacientes(page = 1, limit = 10, search?: string, status?: number) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status !== undefined) params.append('status', status.toString());
    
    return this.get<any>(`/pacientes?${params.toString()}`);
  }

  // Buscar paciente por ID
  async getPaciente(id: string) {
    return this.get<any>(`/pacientes/${id}`);
  }

  // Criar novo paciente
  async createPaciente(pacienteData: any) {
    return this.post<any>('/pacientes', pacienteData);
  }

  // Atualizar paciente
  async updatePaciente(id: string, pacienteData: any) {
    return this.put<any>(`/pacientes/${id}`, pacienteData);
  }

  // Atualizar cor do paciente
  async updatePacienteColor(id: string, cor: string) {
    return this.put<any>(`/pacientes/${id}/color`, { cor });
  }

  // Deletar paciente
  async deletePaciente(id: string) {
    return this.delete<any>(`/pacientes/${id}`);
  }

  // Desativar paciente
  async deactivatePaciente(id: string) {
    return this.put<any>(`/pacientes/${id}/deactivate`);
  }

  // Reativar paciente
  async reactivatePaciente(id: string) {
    return this.put<any>(`/pacientes/${id}/reactivate`);
  }

  // Adicionar medicação
  async addMedication(pacienteId: string, medication: any) {
    return this.post<any>(`/pacientes/${pacienteId}/medications`, medication);
  }

  // Remover medicação
  async removeMedication(pacienteId: string, medicationIndex: number) {
    return this.delete<any>(`/pacientes/${pacienteId}/medications/${medicationIndex}`);
  }

  // Estatísticas dos pacientes
  async getPacientesStatistics() {
    return this.get<any>('/pacientes/statistics/overview');
  }

  // ===== AGENDA DE SESSÕES =====
  // Buscar todas as sessões
  async getAgendaSessoes(params?: string) {
    const url = params ? `/agenda-sessoes?${params}` : '/agenda-sessoes';
    return this.get<any>(url);
  }

  // Buscar sessão por ID
  async getAgendaSessao(id: string) {
    return this.get<any>(`/agenda-sessoes/${id}`);
  }

  // Buscar sessões por paciente
  async getAgendaSessoesByPaciente(pacienteId: string) {
    return this.get<any>(`/agenda-sessoes/paciente/${pacienteId}`);
  }

  // Buscar sessões por data
  async getAgendaSessoesByDate(data: string) {
    return this.get<any>(`/agenda-sessoes/data/${data}`);
  }

  // Criar nova sessão
  async createAgendaSessao(sessaoData: any) {
    return this.post<any>('/agenda-sessoes', sessaoData);
  }

  // Atualizar sessão
  async updateAgendaSessao(id: string, sessaoData: any) {
    return this.patch<any>(`/agenda-sessoes/${id}`, sessaoData);
  }

  // Atualizar registro de sessão (observações)
  async updateSessionRecord(id: string, observacao: string) {
    return this.patch<any>(`/agenda-sessoes/${id}`, { observacao });
  }

  // Deletar sessão
  async deleteAgendaSessao(id: string) {
    return this.delete<any>(`/agenda-sessoes/${id}`);
  }

  // Atualizar status da sessão
  async updateAgendaSessaoStatus(id: string, status: number) {
    return this.patch<any>(`/agenda-sessoes/${id}/status`, { status });
  }

  // Estatísticas das sessões
  async getAgendaSessoesStatistics() {
    return this.get<any>('/agenda-sessoes/statistics/overview');
  }

  // ===== PACOTES =====
  // Buscar todos os pacotes
  async getPacotes(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return this.get<any>(`/pacotes?${params.toString()}`);
  }

  // Buscar pacote por ID
  async getPacote(id: string) {
    return this.get<any>(`/pacotes/${id}`);
  }

  // Criar novo pacote
  async createPacote(data: any) {
    return this.post<any>('/pacotes', data);
  }

  // Atualizar pacote
  async updatePacote(id: string, data: any) {
    return this.patch<any>(`/pacotes/${id}`, data);
  }

  // Deletar pacote
  async deletePacote(id: string) {
    return this.delete<any>(`/pacotes/${id}`);
  }

  // Ativar pacote
  async activatePacote(id: string) {
    return this.patch<any>(`/pacotes/${id}/activate`);
  }

  // Desativar pacote
  async deactivatePacote(id: string) {
    return this.patch<any>(`/pacotes/${id}/deactivate`);
  }

  // Estatísticas dos pacotes
  async getPacotesStatistics() {
    return this.get<any>('/pacotes/statistics/overview');
  }

  // ===== PAGAMENTOS =====
  // Buscar todos os pagamentos
  async getPagamentos(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return this.get<any>(`/pagamentos?${params.toString()}`);
  }

                // Buscar pagamento por ID
              async getPagamento(id: string) {
                return this.get<any>(`/pagamentos/${id}`);
              }

              // Buscar pagamentos por agenda sessão
              async getPagamentosByAgendaSessao(agendaSessaoId: string) {
                return this.get<any>(`/pagamentos/agenda-sessao/${agendaSessaoId}`);
              }

  // Criar novo pagamento
  async createPagamento(data: any) {
    return this.post<any>('/pagamentos', data);
  }

  // Atualizar pagamento
  async updatePagamento(id: string, data: any) {
    return this.patch<any>(`/pagamentos/${id}`, data);
  }

  // Deletar pagamento
  async deletePagamento(id: string) {
    return this.delete<any>(`/pagamentos/${id}`);
  }

  // Atualizar status do pagamento
  async updatePagamentoStatus(id: string, status: number) {
    return this.patch<any>(`/pagamentos/${id}/status`, { status });
  }

  // Estatísticas dos pagamentos
  async getPagamentosStatistics() {
    return this.get<any>('/pagamentos/statistics/overview');
  }

  // ===== CADASTRO LINKS =====

  // Links de cadastro (protegidos)
  async getCadastroLinks() {
    return this.get<any>('/cadastro-links');
  }

  async createCadastroLink(data: any) {
    return this.post<any>('/cadastro-links', data);
  }

  async updateCadastroLink(id: string, data: any) {
    return this.put<any>(`/cadastro-links/${id}`, data);
  }

  async deleteCadastroLink(id: string) {
    return this.delete<any>(`/cadastro-links/${id}`);
  }

  // Submissões (protegidas)
  async getCadastroSubmissions() {
    return this.get<any>('/cadastro-links/submissions/all');
  }

  async approveCadastroSubmission(id: string, data: any) {
    return this.put<any>(`/cadastro-links/submissions/${id}/approve`, data);
  }

  async rejectCadastroSubmission(id: string, data: any) {
    return this.put<any>(`/cadastro-links/submissions/${id}/reject`, data);
  }

  // Paciente Arquivos
  async getPacienteFiles(pacienteId: string) {
    return this.get<any[]>(`/pacientes/${pacienteId}/arquivos`);
  }

  async uploadPacienteFile(pacienteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<any>(`/pacientes/${pacienteId}/arquivos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async deletePacienteFile(pacienteId: string, fileId: string) {
    return this.delete<any>(`/pacientes/${pacienteId}/arquivos/${fileId}`);
  }

  // Links públicos (sem autenticação)
  async getPublicCadastroLink(token: string) {
    return this.get<any>(`/cadastro-links/public/${token}`);
  }

  async createPublicCadastroSubmission(data: any) {
    return this.post<any>('/cadastro-links/public/submit', data);
  }

  // Métodos de reset de senha
  async requestPasswordReset(email: string) {
    return this.post<any>('/auth/request-password-reset', { email });
  }

  async verifyResetCode(email: string, code: string) {
    return this.post<any>('/auth/verify-reset-code', { email, code });
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.post<any>('/auth/reset-password', { email, code, newPassword });
  }
}

// Instância singleton
export const apiService = new ApiService();
export default apiService; 