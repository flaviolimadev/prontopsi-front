import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  crp?: string;
  phone?: string;
  clinic_name?: string;
  address?: string;
  subscription_plan?: string;
  trial_end_date?: string;
  created_at: string;
  updated_at: string;
}

interface AppContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dados mockados
const mockUser: User = {
  id: 'user-1',
  email: 'psicologo@exemplo.com',
  user_metadata: {
    full_name: 'Dr. João Silva',
    avatar_url: undefined
  }
};

const mockProfile: Profile = {
  id: 'profile-1',
  user_id: 'user-1',
  full_name: 'Dr. João Silva',
  crp: '06/123456',
  phone: '(11) 99999-8888',
  clinic_name: 'Clínica Psicológica Dr. João Silva',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  subscription_plan: 'profissional',
  trial_end_date: '2024-01-08T00:00:00Z',
  created_at: '2023-01-01T10:00:00Z',
  updated_at: '2024-01-15T14:30:00Z'
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser);
  const [profile, setProfile] = useState<Profile | null>(mockProfile);
  const [loading, setLoading] = useState(false);

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      // Simular busca de perfil
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfile(mockProfile);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  // Atualizar perfil
  const updateProfile = async (data: Partial<Profile>): Promise<boolean> => {
    try {
      // Simular atualização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfile(prev => prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : null);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  // Fazer logout
  const signOut = async () => {
    try {
      // Simular logout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      setProfile(null);
      
      // Limpar localStorage
      localStorage.removeItem('mockUser');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchProfile(parsedUser.id);
    }
  }, []);

  const value: AppContextType = {
    user,
    profile,
    loading,
    signOut,
    updateProfile
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
}