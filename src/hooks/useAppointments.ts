
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAppointments(mockAppointments);
    } catch (error: any) {
      console.error('Erro ao buscar consultas:', error);
      setError(error.message || 'Erro ao carregar consultas');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as consultas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData): Promise<Appointment | null> => {
    try {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        user_id: 'user-1',
        patient_id: appointmentData.patient_id,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration,
        type: appointmentData.type,
        modality: appointmentData.modality,
        session_type: appointmentData.session_type,
        status: appointmentData.status || 'agendado',
        notes: appointmentData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAppointments(prev => [newAppointment, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Consulta agendada com sucesso!',
      });

      return newAppointment;
    } catch (error: any) {
      console.error('Erro ao criar consulta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível agendar a consulta.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAppointment = async (id: string, appointmentData: UpdateAppointmentData): Promise<boolean> => {
    try {
      setAppointments(prev => prev.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...appointmentData, updated_at: new Date().toISOString() }
          : appointment
      ));

      toast({
        title: 'Sucesso',
        description: 'Consulta atualizada com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar consulta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a consulta.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Consulta removida com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar consulta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a consulta.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getAppointmentById = (id: string): Appointment | undefined => {
    return appointments.find(appointment => appointment.id === id);
  };

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(appointment => appointment.date === date);
  };

  const getAppointmentsByPatient = (patientId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.patient_id === patientId);
  };

  const getAppointmentsByStatus = (status: Appointment['status']): Appointment[] => {
    return appointments.filter(appointment => appointment.status === status);
  };

  const retry = () => {
    fetchAppointments();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
