
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  emergency_contact?: string;
  status: 'ativo' | 'inativo';
  notes?: string;
  cpf?: string;
  address?: string;
  profession?: string;
  medication?: string;
  sessions_count: number;
  last_session?: string;
  gender?: 'masculino' | 'feminino' | 'nao-binario' | 'prefiro-nao-informar';
  age_group?: 'infantil' | 'adolescente' | 'adulto' | 'idoso';
  is_minor?: boolean;
  guardian_name?: string;
  guardian_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  name: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  emergency_contact?: string;
  status?: 'ativo' | 'inativo';
  notes?: string;
  cpf?: string;
  address?: string;
  profession?: string;
  medication?: string;
  gender?: 'masculino' | 'feminino' | 'nao-binario' | 'prefiro-nao-informar';
  guardian_name?: string;
  guardian_phone?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

// Dados mockados
const mockPatients: Patient[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Maria Silva',
    birth_date: '1990-05-15',
    phone: '(11) 99999-1111',
    email: 'maria.silva@email.com',
    emergency_contact: '(11) 88888-1111',
    status: 'ativo',
    notes: 'Paciente em tratamento para ansiedade',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    profession: 'Advogada',
    medication: 'Sertralina 50mg',
    sessions_count: 12,
    last_session: '2024-01-15',
    gender: 'feminino',
    age_group: 'adulto',
    is_minor: false,
    created_at: '2023-08-01T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'João Santos',
    birth_date: '1985-12-03',
    phone: '(11) 99999-2222',
    email: 'joao.santos@email.com',
    emergency_contact: '(11) 88888-2222',
    status: 'ativo',
    notes: 'Tratamento para depressão',
    cpf: '987.654.321-00',
    address: 'Av. Paulista, 456 - São Paulo/SP',
    profession: 'Engenheiro',
    medication: 'Venlafaxina 75mg',
    sessions_count: 8,
    last_session: '2024-01-10',
    gender: 'masculino',
    age_group: 'adulto',
    is_minor: false,
    created_at: '2023-09-15T10:00:00Z',
    updated_at: '2024-01-10T16:00:00Z'
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Ana Costa',
    birth_date: '2005-03-20',
    phone: '(11) 99999-3333',
    email: 'ana.costa@email.com',
    emergency_contact: '(11) 88888-3333',
    status: 'ativo',
    notes: 'Adolescente com problemas de autoestima',
    cpf: '111.222.333-44',
    address: 'Rua do Comércio, 789 - São Paulo/SP',
    profession: 'Estudante',
    medication: '',
    sessions_count: 5,
    last_session: '2024-01-12',
    gender: 'feminino',
    age_group: 'adolescente',
    is_minor: true,
    guardian_name: 'Carlos Costa',
    guardian_phone: '(11) 88888-3333',
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2024-01-12T15:30:00Z'
  },
  {
    id: '4',
    user_id: 'user-1',
    name: 'Pedro Oliveira',
    birth_date: '1978-07-08',
    phone: '(11) 99999-4444',
    email: 'pedro.oliveira@email.com',
    emergency_contact: '(11) 88888-4444',
    status: 'inativo',
    notes: 'Paciente que interrompeu tratamento',
    cpf: '555.666.777-88',
    address: 'Rua das Palmeiras, 321 - São Paulo/SP',
    profession: 'Médico',
    medication: '',
    sessions_count: 3,
    last_session: '2023-11-20',
    gender: 'masculino',
    age_group: 'adulto',
    is_minor: false,
    created_at: '2023-11-01T10:00:00Z',
    updated_at: '2023-11-20T17:00:00Z'
  },
  {
    id: '5',
    user_id: 'user-1',
    name: 'Lucia Ferreira',
    birth_date: '1992-11-25',
    phone: '(11) 99999-5555',
    email: 'lucia.ferreira@email.com',
    emergency_contact: '(11) 88888-5555',
    status: 'ativo',
    notes: 'Tratamento para TOC',
    cpf: '999.888.777-66',
    address: 'Av. Brigadeiro Faria Lima, 1000 - São Paulo/SP',
    profession: 'Designer',
    medication: 'Fluoxetina 20mg',
    sessions_count: 15,
    last_session: '2024-01-14',
    gender: 'feminino',
    age_group: 'adulto',
    is_minor: false,
    created_at: '2023-07-15T10:00:00Z',
    updated_at: '2024-01-14T13:45:00Z'
  }
];

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPatients(mockPatients);
    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error);
      setError(error.message || 'Erro ao carregar pacientes');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacientes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: CreatePatientData): Promise<Patient | null> => {
    try {
      const newPatient: Patient = {
        id: Date.now().toString(),
        user_id: 'user-1',
        name: patientData.name,
        birth_date: patientData.birth_date,
        phone: patientData.phone,
        email: patientData.email,
        emergency_contact: patientData.emergency_contact,
        status: patientData.status || 'ativo',
        notes: patientData.notes,
        cpf: patientData.cpf,
        address: patientData.address,
        profession: patientData.profession,
        medication: patientData.medication,
        sessions_count: 0,
        gender: patientData.gender,
        age_group: patientData.age_group,
        is_minor: patientData.is_minor,
        guardian_name: patientData.guardian_name,
        guardian_phone: patientData.guardian_phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPatients(prev => [newPatient, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Paciente criado com sucesso!',
      });

      return newPatient;
    } catch (error: any) {
      console.error('Erro ao criar paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o paciente.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePatient = async (id: string, patientData: UpdatePatientData): Promise<boolean> => {
    try {
      setPatients(prev => prev.map(patient => 
        patient.id === id 
          ? { ...patient, ...patientData, updated_at: new Date().toISOString() }
          : patient
      ));

      toast({
        title: 'Sucesso',
        description: 'Paciente atualizado com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o paciente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      setPatients(prev => prev.filter(patient => patient.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Paciente removido com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar paciente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o paciente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const getPatientsByStatus = (status: 'ativo' | 'inativo'): Patient[] => {
    return patients.filter(patient => patient.status === status);
  };

  const retry = () => {
    fetchPatients();
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    getPatientsByStatus,
    retry
  };
}
