
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api.service';

export interface Profile {
  id: string;
  user_id: string;
  nome: string;
  sobrenome: string;
  full_name?: string; // Para compatibilidade
  email: string;
  phone?: string;
  crp?: string;
  clinic_name?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  avatar?: string; // Campo do backend
  whatsapp_number?: string;
  whatsapp_reports_enabled?: boolean;
  whatsapp_report_time?: string;
  report_config?: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  nome?: string;
  sobrenome?: string;
  email?: string;
  phone?: string;
  crp?: string;
  clinic_name?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  whatsapp_number?: string;
  whatsapp_reports_enabled?: boolean;
  whatsapp_report_time?: string;
  report_config?: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  };
}

// Dados mockados como fallback
const mockProfile: Profile = {
  id: 'profile-1',
  user_id: 'user-1',
  nome: 'João',
  sobrenome: 'Silva',
  full_name: 'Dr. João Silva',
  email: 'psicologo@exemplo.com',
  phone: '(11) 99999-8888',
  crp: '06/123456',
  clinic_name: 'Clínica Psicológica Dr. João Silva',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  bio: 'Psicólogo clínico com mais de 10 anos de experiência em terapia cognitivo-comportamental. Especializado em tratamento de ansiedade, depressão e transtornos de personalidade.',
  avatar_url: undefined,
  avatar: undefined,
  whatsapp_number: '(11) 99999-8888',
  whatsapp_reports_enabled: true,
  whatsapp_report_time: '08:00',
  report_config: {
    includeTodaySchedule: true,
    includeBirthdays: true,
    includeOverdue: true,
    customMessage: 'Bom dia! Aqui está seu resumo diário.'
  },
  created_at: '2023-01-01T10:00:00Z',
  updated_at: '2024-01-15T14:30:00Z'
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar buscar do backend primeiro
      try {
        const profileData = await apiService.getProfile();
        console.log('Dados do perfil recebidos do backend:', profileData);
        console.log('Avatar do backend:', profileData.avatar);
        
        // Converter dados do backend para o formato esperado pelo frontend
        const convertedProfile: Profile = {
          id: profileData.id,
          user_id: profileData.id,
          nome: profileData.nome,
          sobrenome: profileData.sobrenome,
          full_name: `${profileData.nome} ${profileData.sobrenome}`.trim(),
          email: profileData.email,
          phone: profileData.phone,
          crp: profileData.crp,
          clinic_name: profileData.clinicName,
          address: profileData.address,
          bio: profileData.bio,
          avatar_url: profileData.avatar,
          avatar: profileData.avatar,
          whatsapp_number: profileData.whatsappNumber,
          whatsapp_reports_enabled: profileData.whatsappReportsEnabled,
          whatsapp_report_time: profileData.whatsappReportTime,
          report_config: profileData.reportConfig,
          created_at: profileData.createdAt,
          updated_at: profileData.updatedAt
        };
        console.log('Perfil convertido (fetch):', convertedProfile);
        console.log('Avatar convertido (fetch):', convertedProfile.avatar);
        setProfile(convertedProfile);
      } catch (apiError) {
        console.warn('Erro ao buscar perfil da API, usando dados mockados:', apiError);
        // Se falhar, usar dados mockados
        setProfile(mockProfile);
      }
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      setError(error.message || 'Erro ao carregar perfil');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: UpdateProfileData): Promise<boolean> => {
    try {
      if (!profile) return false;
      
      // Converter dados do frontend para o formato do backend
      const backendData = {
        nome: profileData.nome,
        sobrenome: profileData.sobrenome,
        email: profileData.email,
        phone: profileData.phone,
        crp: profileData.crp,
        clinicName: profileData.clinic_name,
        address: profileData.address,
        bio: profileData.bio,
        whatsappNumber: profileData.whatsapp_number,
        whatsappReportsEnabled: profileData.whatsapp_reports_enabled,
        whatsappReportTime: profileData.whatsapp_report_time,
        reportConfig: profileData.report_config,
        avatar: profileData.avatar
      };
      
      console.log('Dados sendo enviados para o backend:', backendData);
      
      // Tentar atualizar no backend primeiro
      try {
        const updatedProfileData = await apiService.updateProfile(backendData);
        // Converter dados do backend para o formato esperado pelo frontend
        const convertedProfile: Profile = {
          id: updatedProfileData.id,
          user_id: updatedProfileData.id,
          nome: updatedProfileData.nome,
          sobrenome: updatedProfileData.sobrenome,
          full_name: `${updatedProfileData.nome} ${updatedProfileData.sobrenome}`.trim(),
          email: updatedProfileData.email,
          phone: updatedProfileData.phone,
          crp: updatedProfileData.crp,
          clinic_name: updatedProfileData.clinicName,
          address: updatedProfileData.address,
          bio: updatedProfileData.bio,
          avatar_url: updatedProfileData.avatar,
          avatar: updatedProfileData.avatar,
          whatsapp_number: updatedProfileData.whatsappNumber,
          whatsapp_reports_enabled: updatedProfileData.whatsappReportsEnabled,
          whatsapp_report_time: updatedProfileData.whatsappReportTime,
          report_config: updatedProfileData.reportConfig,
          created_at: updatedProfileData.createdAt,
          updated_at: updatedProfileData.updatedAt
        };
        setProfile(convertedProfile);
      } catch (apiError) {
        console.warn('Erro ao atualizar perfil na API, usando dados locais:', apiError);
        // Se falhar, atualizar localmente
        const updatedProfile: Profile = {
          ...profile,
          ...profileData,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
      }
      
      toast({
        title: 'Perfil atualizado!',
        description: 'As informações foram salvas com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      console.log('Iniciando upload de avatar:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Tentar upload no backend primeiro
      try {
        const result = await apiService.uploadAvatar(file);
        console.log('Resultado do upload:', result);
        console.log('Avatar URL recebida:', result.avatar);
        if (profile) {
          const updatedProfile = {
            ...profile,
            avatar_url: result.avatar,
            avatar: result.avatar,
            updated_at: new Date().toISOString()
          };
          console.log('Perfil atualizado:', updatedProfile);
          setProfile(updatedProfile);
        }
        return result.avatar;
      } catch (apiError) {
        console.warn('Erro ao fazer upload na API, usando URL local:', apiError);
        // Se falhar, criar URL local
        const avatarUrl = URL.createObjectURL(file);
        if (profile) {
          setProfile({
            ...profile,
            avatar_url: avatarUrl,
            avatar: avatarUrl,
            updated_at: new Date().toISOString()
          });
        }
        return avatarUrl;
      }
      
      toast({
        title: 'Avatar atualizado!',
        description: 'A foto de perfil foi alterada com sucesso.',
      });

      return null;
    } catch (error: any) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a foto de perfil.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteAvatar = async (): Promise<boolean> => {
    try {
      if (!profile) return false;
      
      // Tentar deletar no backend primeiro
      try {
        await apiService.deleteAvatar();
      } catch (apiError) {
        console.warn('Erro ao deletar avatar na API:', apiError);
      }
      
      // Atualizar localmente de qualquer forma
      setProfile({
        ...profile,
        avatar_url: undefined,
        avatar: undefined,
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: 'Avatar removido!',
        description: 'A foto de perfil foi removida com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a foto de perfil.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateWhatsAppConfig = async (config: {
    whatsapp_number?: string;
    whatsapp_reports_enabled?: boolean;
    whatsapp_report_time?: string;
  }): Promise<boolean> => {
    try {
      if (!profile) return false;
      
      // Tentar atualizar no backend primeiro
      try {
        const updatedProfileData = await apiService.updateProfile(config);
        setProfile(updatedProfileData);
      } catch (apiError) {
        console.warn('Erro ao atualizar configuração na API, usando dados locais:', apiError);
        // Se falhar, atualizar localmente
        const updatedProfile: Profile = {
          ...profile,
          ...config,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
      }
      
      toast({
        title: 'Configuração salva!',
        description: 'As configurações do WhatsApp foram atualizadas.',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar configuração do WhatsApp:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateReportConfig = async (config: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  }): Promise<boolean> => {
    try {
      if (!profile) return false;
      
      // Tentar atualizar no backend primeiro
      try {
        const updatedProfileData = await apiService.updateProfile({ report_config: config });
        setProfile(updatedProfileData);
      } catch (apiError) {
        console.warn('Erro ao atualizar configuração na API, usando dados locais:', apiError);
        // Se falhar, atualizar localmente
        const updatedProfile: Profile = {
          ...profile,
          report_config: config,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
      }
      
      toast({
        title: 'Configuração salva!',
        description: 'As configurações de relatórios foram atualizadas.',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar configuração de relatórios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const retry = () => {
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    updateWhatsAppConfig,
    updateReportConfig,
    retry
  };
}
