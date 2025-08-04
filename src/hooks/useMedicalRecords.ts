import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MedicalRecord {
  id: string;
  user_id: string;
  patient_id: string;
  appointment_id?: string;
  title: string;
  content: string;
  category: 'avaliacao' | 'sessao' | 'observacao' | 'diagnostico' | 'evolucao';
  created_at: string;
  updated_at: string;
}

export interface CreateMedicalRecordData {
  patient_id: string;
  appointment_id?: string;
  title: string;
  content: string;
  category: 'avaliacao' | 'sessao' | 'observacao' | 'diagnostico' | 'evolucao';
}

export interface UpdateMedicalRecordData extends Partial<CreateMedicalRecordData> {}

// Dados mockados
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    user_id: 'user-1',
    patient_id: '1',
    appointment_id: '3',
    title: 'Avaliação Inicial - Maria Silva',
    content: 'Paciente apresenta sintomas de ansiedade generalizada, com relatos de preocupação excessiva, dificuldade para dormir e tensão muscular. Relata histórico de estresse no trabalho e problemas familiares. Avaliação inicial concluída com sucesso.',
    category: 'avaliacao',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    patient_id: '2',
    appointment_id: '4',
    title: 'Sessão 8 - João Santos',
    content: 'Sessão focada em técnicas de respiração e mindfulness. Paciente demonstrou melhora significativa nos sintomas depressivos. Relatou conseguir aplicar as técnicas aprendidas no dia a dia. Próxima sessão agendada para 2 semanas.',
    category: 'sessao',
    created_at: '2024-01-18T14:30:00Z',
    updated_at: '2024-01-18T14:30:00Z'
  },
  {
    id: '3',
    user_id: 'user-1',
    patient_id: '3',
    title: 'Observação - Ana Costa',
    content: 'Adolescente apresenta baixa autoestima e dificuldades de socialização. Observa-se melhora gradual na participação das sessões. Recomenda-se continuar com abordagem cognitivo-comportamental.',
    category: 'observacao',
    created_at: '2024-01-12T16:00:00Z',
    updated_at: '2024-01-12T16:00:00Z'
  },
  {
    id: '4',
    user_id: 'user-1',
    patient_id: '5',
    appointment_id: '8',
    title: 'Diagnóstico - Lucia Ferreira',
    content: 'Transtorno Obsessivo-Compulsivo (TOC) com sintomas moderados. Obsessões relacionadas à limpeza e organização. Compulsões incluem lavagem excessiva das mãos e verificação repetitiva. Iniciado tratamento com TCC.',
    category: 'diagnostico',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z'
  },
  {
    id: '5',
    user_id: 'user-1',
    patient_id: '1',
    title: 'Evolução - Maria Silva',
    content: 'Paciente demonstra progresso significativo no controle da ansiedade. Redução de 60% nos sintomas relatados. Aplicação consistente das técnicas aprendidas. Manutenção do tratamento recomendada.',
    category: 'evolucao',
    created_at: '2024-01-17T11:45:00Z',
    updated_at: '2024-01-17T11:45:00Z'
  }
];

export function useMedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(mockMedicalRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMedicalRecords(mockMedicalRecords);
    } catch (error: any) {
      console.error('Erro ao buscar prontuários:', error);
      setError(error.message || 'Erro ao carregar prontuários');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os prontuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (recordData: CreateMedicalRecordData): Promise<MedicalRecord | null> => {
    try {
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        user_id: 'user-1',
        patient_id: recordData.patient_id,
        appointment_id: recordData.appointment_id,
        title: recordData.title,
        content: recordData.content,
        category: recordData.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setMedicalRecords(prev => [newRecord, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Prontuário criado com sucesso!',
      });

      return newRecord;
    } catch (error: any) {
      console.error('Erro ao criar prontuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o prontuário.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRecord = async (id: string, recordData: UpdateMedicalRecordData): Promise<boolean> => {
    try {
      setMedicalRecords(prev => prev.map(record => 
        record.id === id 
          ? { ...record, ...recordData, updated_at: new Date().toISOString() }
          : record
      ));

      toast({
        title: 'Sucesso',
        description: 'Prontuário atualizado com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar prontuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o prontuário.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteRecord = async (id: string): Promise<boolean> => {
    try {
      setMedicalRecords(prev => prev.filter(record => record.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Prontuário removido com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar prontuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o prontuário.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getRecordById = (id: string): MedicalRecord | undefined => {
    return medicalRecords.find(record => record.id === id);
  };

  const getRecordsByPatient = (patientId: string): MedicalRecord[] => {
    return medicalRecords.filter(record => record.patient_id === patientId);
  };

  const getRecordsByCategory = (category: MedicalRecord['category']): MedicalRecord[] => {
    return medicalRecords.filter(record => record.category === category);
  };

  const getRecordsByAppointment = (appointmentId: string): MedicalRecord[] => {
    return medicalRecords.filter(record => record.appointment_id === appointmentId);
  };

  const searchRecords = (query: string): MedicalRecord[] => {
    const lowerQuery = query.toLowerCase();
    return medicalRecords.filter(record => 
      record.title.toLowerCase().includes(lowerQuery) ||
      record.content.toLowerCase().includes(lowerQuery) ||
      record.category.toLowerCase().includes(lowerQuery)
    );
  };

  const retry = () => {
    fetchRecords();
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    medicalRecords,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordById,
    getRecordsByPatient,
    getRecordsByCategory,
    getRecordsByAppointment,
    searchRecords,
    retry
  };
}