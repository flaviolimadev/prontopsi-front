
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAgendaSessoesReal } from './useAgendaSessoesReal';

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  date: string;
  time: string;
  duration: number;
  type: 'consulta' | 'avaliacao' | 'retorno' | 'grupo';
  modality: 'online' | 'presencial';
  session_type: 'individual' | 'casal' | 'grupo' | 'familia';
  status: 'agendado' | 'realizado' | 'cancelado' | 'falta';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  patient_id: string;
  date: string;
  time: string;
  duration: number;
  type: 'consulta' | 'avaliacao' | 'retorno' | 'grupo';
  modality: 'online' | 'presencial';
  session_type: 'individual' | 'casal' | 'grupo' | 'familia';
  status?: 'agendado' | 'realizado' | 'cancelado' | 'falta';
  notes?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {}

// Dados mockados
const mockAppointments: Appointment[] = [
  {
    id: '1',
    user_id: 'user-1',
    patient_id: '1',
    date: '2024-01-20',
    time: '14:00',
    duration: 50,
    type: 'consulta',
    modality: 'presencial',
    session_type: 'individual',
    status: 'agendado',
    notes: 'Sessão de acompanhamento',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    patient_id: '2',
    date: '2024-01-20',
    time: '15:30',
    duration: 50,
    type: 'retorno',
    modality: 'online',
    session_type: 'individual',
    status: 'agendado',
    notes: 'Retorno após 2 semanas',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    user_id: 'user-1',
    patient_id: '3',
    date: '2024-01-19',
    time: '16:00',
    duration: 50,
    type: 'consulta',
    modality: 'presencial',
    session_type: 'individual',
    status: 'realizado',
    notes: 'Sessão realizada com sucesso',
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-19T16:50:00Z'
  },
  {
    id: '4',
    user_id: 'user-1',
    patient_id: '5',
    date: '2024-01-18',
    time: '10:00',
    duration: 50,
    type: 'avaliacao',
    modality: 'presencial',
    session_type: 'individual',
    status: 'realizado',
    notes: 'Avaliação inicial concluída',
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-18T10:50:00Z'
  },
  {
    id: '5',
    user_id: 'user-1',
    patient_id: '1',
    date: '2024-01-17',
    time: '14:00',
    duration: 50,
    type: 'consulta',
    modality: 'presencial',
    session_type: 'individual',
    status: 'realizado',
    notes: 'Sessão regular',
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-17T14:50:00Z'
  },
  {
    id: '6',
    user_id: 'user-1',
    patient_id: '2',
    date: '2024-01-16',
    time: '15:30',
    duration: 50,
    type: 'consulta',
    modality: 'online',
    session_type: 'individual',
    status: 'cancelado',
    notes: 'Cancelado pelo paciente',
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-16T12:00:00Z'
  },
  {
    id: '7',
    user_id: 'user-1',
    patient_id: '3',
    date: '2024-01-15',
    time: '16:00',
    duration: 50,
    type: 'consulta',
    modality: 'presencial',
    session_type: 'individual',
    status: 'falta',
    notes: 'Paciente não compareceu',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T16:30:00Z'
  },
  {
    id: '8',
    user_id: 'user-1',
    patient_id: '5',
    date: '2024-01-22',
    time: '09:00',
    duration: 50,
    type: 'consulta',
    modality: 'presencial',
    session_type: 'individual',
    status: 'agendado',
    notes: 'Primeira sessão da semana',
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z'
  }
];

export function useAppointments() {
  const { 
    agendaSessoes, 
    loading, 
    error, 
    createAgendaSessao,
    updateAgendaSessao,
    deleteAgendaSessao,
    getAgendaSessaoById,
    getAgendaSessoesByDate,
    getAgendaSessoesByPatient,
    getTodayAgendaSessoes
  } = useAgendaSessoesReal();
  
  const { toast } = useToast();

  // Converter AgendaSessao para Appointment
  const convertToAppointment = (agendaSessao: any): Appointment => ({
    id: agendaSessao.id,
    user_id: agendaSessao.userId,
    patient_id: agendaSessao.pacienteId,
    date: agendaSessao.data,
    time: agendaSessao.horario,
    duration: agendaSessao.duracao,
    type: agendaSessao.tipo,
    modality: agendaSessao.modalidade,
    session_type: 'individual', // Assumindo individual como padrão
    status: agendaSessao.status,
    notes: agendaSessao.observacoes,
    created_at: agendaSessao.createdAt,
    updated_at: agendaSessao.updatedAt
  });

  // Converter appointments para formato de exibição
  const appointments = agendaSessoes.map(convertToAppointment);

  const fetchAppointments = async () => {
    // Dados já são carregados pelo hook useAgendaSessoesReal
    return;
  };

  const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment | null> => {
    try {
      const agendaSessaoData = {
        pacienteId: appointmentData.patient_id,
        data: appointmentData.date,
        horario: appointmentData.time,
        duracao: appointmentData.duration,
        tipo: appointmentData.type,
        modalidade: appointmentData.modality,
        status: appointmentData.status || 'agendado',
        observacoes: appointmentData.notes
      };

      const newAgendaSessao = await createAgendaSessao(agendaSessaoData);
      
      if (newAgendaSessao) {
        return convertToAppointment(newAgendaSessao);
      }
      
      return null;
    } catch (error: any) {
      console.error('Erro ao criar consulta:', error);
      return null;
    }
  };

  const updateAppointment = async (id: string, appointmentData: UpdateAppointmentData): Promise<boolean> => {
    try {
      const agendaSessaoData: any = {};
      
      if (appointmentData.patient_id) agendaSessaoData.pacienteId = appointmentData.patient_id;
      if (appointmentData.date) agendaSessaoData.data = appointmentData.date;
      if (appointmentData.time) agendaSessaoData.horario = appointmentData.time;
      if (appointmentData.duration) agendaSessaoData.duracao = appointmentData.duration;
      if (appointmentData.type) agendaSessaoData.tipo = appointmentData.type;
      if (appointmentData.modality) agendaSessaoData.modalidade = appointmentData.modality;
      if (appointmentData.status) agendaSessaoData.status = appointmentData.status;
      if (appointmentData.notes) agendaSessaoData.observacoes = appointmentData.notes;

      return await updateAgendaSessao(id, agendaSessaoData);
    } catch (error: any) {
      console.error('Erro ao atualizar consulta:', error);
      return false;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    return await deleteAgendaSessao(id);
  };

  const getAppointmentById = (id: string): Appointment | undefined => {
    return appointments.find(appointment => appointment.id === id);
  };

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return getAgendaSessoesByDate(date).map(convertToAppointment);
  };

  const getAppointmentsByPatient = (patientId: string): Appointment[] => {
    return getAgendaSessoesByPatient(patientId).map(convertToAppointment);
  };

  const getAppointmentsByStatus = (status: Appointment['status']): Appointment[] => {
    return agendaSessoes.filter(agendaSessao => agendaSessao.status === status).map(convertToAppointment);
  };

  const retry = () => {
    // Dados são recarregados automaticamente pelo hook useAgendaSessoesReal
    return;
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    getAppointmentsByStatus,
    retry
  };
}
