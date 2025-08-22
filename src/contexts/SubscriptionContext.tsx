import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'gratuito' | 'pro' | 'advanced';
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  patient_limit: number | null;
  current_period_start: string;
  current_period_end: string;
  trial_end_date?: string;
  trial_days_remaining?: number;
  features: {
    patients: number | null;
    files: boolean;
    reports: boolean;
    whatsapp_view: boolean; // visualizar/receber relatório
    whatsapp_scheduling: boolean; // agendamento via WhatsApp
    ai_assistant: boolean; // agente IA
  };
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isFeatureBlocked: (feature: string) => boolean;
  isOnTrial: () => boolean;
  startTrial: (planType: 'pro' | 'advanced') => Promise<boolean>;
  upgradePlan: (planType: 'gratuito' | 'pro' | 'advanced') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  canAddPatient: (currentCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Plano gratuito padrão (após cadastro)
const freeSubscription: Subscription = {
  id: 'sub-1',
  user_id: 'user-1',
  plan_type: 'gratuito',
  status: 'active',
  patient_limit: 5,
  current_period_start: new Date().toISOString(),
  current_period_end: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString(); })(),
  features: {
    patients: 5,
    files: true,
    reports: false,
    whatsapp_view: false,
    whatsapp_scheduling: false,
    ai_assistant: false
  }
};

const planFeatures: Record<'gratuito' | 'pro' | 'advanced', any> = {
  gratuito: {
    patients: 5,
    files: true,
    reports: false,
    whatsapp_view: false,
    whatsapp_scheduling: false,
    ai_assistant: false,
  },
  pro: {
    patients: null, // ilimitado
    files: true,
    reports: true,
    whatsapp_view: true,
    whatsapp_scheduling: false, // bloqueado no Pro
    ai_assistant: false, // bloqueado no Pro
  },
  advanced: {
    patients: null,
    files: true,
    reports: true,
    whatsapp_view: true,
    whatsapp_scheduling: true,
    ai_assistant: true,
  },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(freeSubscription);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveSubscription = (sub: Subscription | null) => {
    try {
      if (sub) {
        localStorage.setItem('subscription', JSON.stringify(sub));
      } else {
        localStorage.removeItem('subscription');
      }
    } catch {}
  };

  const loadSubscription = (): Subscription | null => {
    try {
      const raw = localStorage.getItem('subscription');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // sanity: garantir campos mínimos
      if (parsed && parsed.plan_type && parsed.status && parsed.features) {
        return parsed as Subscription;
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      const stored = loadSubscription();
      if (stored) {
        setSubscription(stored);
      } else {
        setSubscription(freeSubscription);
        saveSubscription(freeSubscription);
      }
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
      case 'whatsapp_view':
        return !subscription.features.whatsapp_view;
      case 'whatsapp_scheduling':
        return !subscription.features.whatsapp_scheduling;
      case 'ai_assistant':
        return !subscription.features.ai_assistant;
      default:
        return false;
    }
  };

  const isOnTrial = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'trial' && (subscription.trial_days_remaining || 0) > 0;
  };

  const startTrial = async (planType: 'pro' | 'advanced'): Promise<boolean> => {
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
        patient_limit: planFeatures[planType].patients === null ? null : planFeatures[planType].patients,
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndDate.toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        trial_days_remaining: 7,
        features: planFeatures[planType]
      };
      
      setSubscription(newSubscription);
      saveSubscription(newSubscription);
      
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

  const upgradePlan = async (planType: 'gratuito' | 'pro' | 'advanced'): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSubscription: Subscription = {
        ...subscription!,
        plan_type: planType,
        status: 'active',
        patient_limit: planFeatures[planType].patients === null ? null : planFeatures[planType].patients,
        features: planFeatures[planType],
        trial_days_remaining: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString(); })(),
      };
      
      setSubscription(updatedSubscription);
      saveSubscription(updatedSubscription);
      
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

  const canAddPatient = (currentCount: number): boolean => {
    if (!subscription) return false;
    if (subscription.patient_limit === null) return true; // ilimitado
    return currentCount < subscription.patient_limit;
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
        saveSubscription(updatedSubscription);
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
    cancelSubscription,
    canAddPatient,
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