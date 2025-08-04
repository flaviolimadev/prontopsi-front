import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'essencial' | 'profissional' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  patient_limit: number;
  current_period_start: string;
  current_period_end: string;
  trial_end_date?: string;
  trial_days_remaining?: number;
  features: {
    patients: number;
    files: boolean;
    reports: boolean;
    whatsapp: boolean;
    priority_support: boolean;
  };
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isFeatureBlocked: (feature: string) => boolean;
  isOnTrial: () => boolean;
  startTrial: (planType: 'profissional' | 'premium') => Promise<boolean>;
  upgradePlan: (planType: 'essencial' | 'profissional' | 'premium') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Dados mockados
const mockSubscription: Subscription = {
  id: 'sub-1',
  user_id: 'user-1',
  plan_type: 'profissional',
  status: 'trial',
  patient_limit: 50,
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  trial_end_date: '2024-01-08T00:00:00Z',
  trial_days_remaining: 3,
  features: {
    patients: 50,
    files: true,
    reports: true,
    whatsapp: true,
    priority_support: false
  }
};

const planFeatures = {
  essencial: {
    patients: 10,
    files: false,
    reports: false,
    whatsapp: false,
    priority_support: false
  },
  profissional: {
    patients: 50,
    files: true,
    reports: true,
    whatsapp: true,
    priority_support: false
  },
  premium: {
    patients: 200,
    files: true,
    reports: true,
    whatsapp: true,
    priority_support: true
  }
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(mockSubscription);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureBlocked = (feature: string): boolean => {
    if (!subscription) return true;
    
    switch (feature) {
      case 'files':
        return !subscription.features.files;
      case 'reports':
        return !subscription.features.reports;
      case 'whatsapp':
        return !subscription.features.whatsapp;
      case 'priority_support':
        return !subscription.features.priority_support;
      default:
        return false;
    }
  };

  const isOnTrial = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'trial' && (subscription.trial_days_remaining || 0) > 0;
  };

  const startTrial = async (planType: 'profissional' | 'premium'): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 dias de trial
      
      const newSubscription: Subscription = {
        id: `trial-${Date.now()}`,
        user_id: 'user-1',
        plan_type: planType,
        status: 'trial',
        patient_limit: planFeatures[planType].patients,
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        trial_days_remaining: 7,
        features: planFeatures[planType]
      };
      
      setSubscription(newSubscription);
      
      toast({
        title: 'Trial iniciado!',
        description: `Você tem 7 dias para testar o plano ${planType}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o trial.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (planType: 'essencial' | 'profissional' | 'premium'): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSubscription: Subscription = {
        ...subscription!,
        plan_type: planType,
        status: 'active',
        patient_limit: planFeatures[planType].patients,
        features: planFeatures[planType],
        trial_days_remaining: 0
      };
      
      setSubscription(updatedSubscription);
      
      toast({
        title: 'Plano atualizado!',
        description: `Seu plano foi alterado para ${planType}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o plano.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        const updatedSubscription: Subscription = {
          ...subscription,
          status: 'canceled',
        };
        
        setSubscription(updatedSubscription);
      }
      
      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a assinatura.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    loading,
    isFeatureBlocked,
    isOnTrial,
    startTrial,
    upgradePlan,
    cancelSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription deve ser usado dentro de um SubscriptionProvider');
  }
  return context;
}