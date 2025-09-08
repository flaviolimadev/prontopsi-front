import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../../services/api.service';

// Tipos de estado de autenticação
type AuthState = 
  | 'INITIALIZING'     // Carregando inicial
  | 'UNAUTHENTICATED'  // Sem autenticação
  | 'AUTHENTICATED'    // Autenticado e verificado
  | 'NEEDS_VERIFICATION' // Logado mas precisa verificar email
  | 'ERROR';           // Erro de autenticação

interface User {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  emailVerified: boolean;
  isAdmin?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  // Estados
  authState: AuthState;
  user: User | null;
  loading: boolean;
  
  // Ações
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    email?: string;
  }>;
  signUp: (userData: any) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    email?: string;
  }>;
  signOut: (navigate?: (path: string) => void) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // Estados derivados
  isAuthenticated: boolean;
  needsVerification: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>('INITIALIZING');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  console.log('🔧 AuthProvider: Estado atual:', authState);

  // Inicialização única e controlada
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      console.log('🔧 AuthProvider: Inicializando autenticação...');
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('🔧 AuthProvider: Sem token, usuário não autenticado');
        if (isMounted) {
          setAuthState('UNAUTHENTICATED');
        }
        return;
      }
      
      try {
        console.log('🔧 AuthProvider: Verificando token existente...');
        const userData = await apiService.getCurrentUser();
        
        if (!isMounted) return;
        
        console.log('🔧 AuthProvider: Dados do usuário:', {
          email: userData.email,
          emailVerified: userData.emailVerified,
          status: userData.status,
          isAdmin: userData.isAdmin
        });
        
        // Se emailVerified for undefined, tratar como false
        const isEmailVerified = userData.emailVerified === true;
        const isActive = userData.status === 1;
        
        console.log('🔧 AuthProvider: Verificações:', {
          isEmailVerified,
          isActive,
          emailVerified: userData.emailVerified
        });
        
        if (isEmailVerified && isActive) {
          console.log('🔧 AuthProvider: Usuário autenticado e verificado');
          setUser(userData);
          setAuthState('AUTHENTICATED');
        } else {
          console.log('🔧 AuthProvider: Usuário não verificado ou inativo');
          setUser(userData);
          setAuthState('NEEDS_VERIFICATION');
        }
      } catch (error) {
        console.log('🔧 AuthProvider: Token inválido, limpando dados');
        if (isMounted) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
          setAuthState('UNAUTHENTICATED');
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Apenas uma execução

  const signIn = async (email: string, password: string) => {
    console.log('🔧 AuthProvider: Iniciando login para:', email);
    setLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      console.log('🔧 AuthProvider: Login bem-sucedido');
      
      // Salvar dados
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user as User);
      
      if (response.user.emailVerified) {
        setAuthState('AUTHENTICATED');
        return { success: true };
      } else {
        setAuthState('NEEDS_VERIFICATION');
        return { 
          success: false, 
          requiresVerification: true,
          email: email 
        };
      }
      
    } catch (error: any) {
      console.log('🔧 AuthProvider: Erro no login:', error.response?.data?.message);
      
      const errorMessage = error.response?.data?.message || '';
      
      // Verificar se é erro de email não verificado ou usuário inativo
      if (errorMessage.includes('Email não verificado') || 
          errorMessage.includes('email não verificado') ||
          errorMessage.includes('Usuário inativo')) {
        
        console.log('🔧 AuthProvider: Email não verificado ou usuário inativo');
        console.log('🔧 AuthProvider: Definindo estado NEEDS_VERIFICATION');
        
        setAuthState('NEEDS_VERIFICATION');
        return { 
          success: false, 
          requiresVerification: true,
          email: email 
        };
      }
      
      setAuthState('ERROR');
      return { 
        success: false, 
        error: errorMessage || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    setLoading(true);
    
    try {
      const response = await apiService.register(userData);
      
      if (response.requiresVerification) {
        setAuthState('NEEDS_VERIFICATION');
        return { 
          success: false, 
          requiresVerification: true,
          email: userData.email
        };
      }
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setAuthState('AUTHENTICATED');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('🔧 AuthProvider: Erro no registro:', error);
      setAuthState('ERROR');
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
      await apiService.logout();
    } catch (error) {
      console.error('🔧 AuthProvider: Erro no logout:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setAuthState('UNAUTHENTICATED');
      
      if (navigate) {
        navigate('/login');
      }
    }
  };

  const resetPassword = async (email: string) => {
    // Função placeholder - implementar quando necessário
    return { 
      success: false, 
      error: 'Função de reset de senha não implementada' 
    };
  };

  // Estados derivados
  const isAuthenticated = authState === 'AUTHENTICATED';
  const needsVerification = authState === 'NEEDS_VERIFICATION';
  const isLoading = authState === 'INITIALIZING' || loading;

  const value: AuthContextType = {
    authState,
    user,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated,
    needsVerification,
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