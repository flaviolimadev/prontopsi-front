
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../../services/api.service';

interface User {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  code: string;
  contato?: string;
  status: number;
  pontos: number;
  nivelId: number;
  planoId?: string;
  avatar?: string;
  descricao?: string;
  referredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: (navigate?: (path: string) => void) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Verificar se o token ainda é válido
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await apiService.login(email, password);
      
      // Salvar token e dados do usuário
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      setLoading(true);
      
      const response = await apiService.register(userData);
      
      // Salvar token e dados do usuário
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (navigate?: (path: string) => void) => {
    try {
      // Chamar logout no backend
      await apiService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados locais
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Redirecionar
      if (navigate) {
        navigate('/login');
      } else {
        window.location.href = '/login';
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      // Implementar quando o backend tiver essa funcionalidade
      // await apiService.resetPassword(email);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro no reset de senha:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao resetar senha' 
      };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
