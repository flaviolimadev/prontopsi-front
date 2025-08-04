import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface FinancialRecord {
  id: string;
  user_id: string;
  patient_id: string;
  appointment_id?: string;
  date: string;
  amount: number;
  type: 'receita' | 'despesa';
  description: string;
  payment_method?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia';
  status: 'pago' | 'pendente' | 'atrasado';
  session_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFinancialRecordData {
  patient_id: string;
  appointment_id?: string;
  date: string;
  amount: number;
  type: 'receita' | 'despesa';
  description: string;
  payment_method?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia';
  status?: 'pago' | 'pendente' | 'atrasado';
  session_date?: string;
}

export interface UpdateFinancialRecordData extends Partial<CreateFinancialRecordData> {}

// Dados mockados
const mockFinancialRecords: FinancialRecord[] = [
  {
    id: '1',
    user_id: 'user-1',
    patient_id: '1',
    appointment_id: '3',
    date: '2024-01-19',
    amount: 150.00,
    type: 'receita',
    description: 'Sessão de psicoterapia',
    payment_method: 'pix',
    status: 'pago',
    session_date: '2024-01-19',
    created_at: '2024-01-19T16:50:00Z',
    updated_at: '2024-01-19T16:50:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    patient_id: '2',
    appointment_id: '4',
    date: '2024-01-18',
    amount: 150.00,
    type: 'receita',
    description: 'Avaliação psicológica',
    payment_method: 'cartao_credito',
    status: 'pago',
    session_date: '2024-01-18',
    created_at: '2024-01-18T10:50:00Z',
    updated_at: '2024-01-18T10:50:00Z'
  },
  {
    id: '3',
    user_id: 'user-1',
    patient_id: '1',
    appointment_id: '5',
    date: '2024-01-17',
    amount: 150.00,
    type: 'receita',
    description: 'Sessão de psicoterapia',
    payment_method: 'dinheiro',
    status: 'pago',
    session_date: '2024-01-17',
    created_at: '2024-01-17T14:50:00Z',
    updated_at: '2024-01-17T14:50:00Z'
  },
  {
    id: '4',
    user_id: 'user-1',
    patient_id: '5',
    date: '2024-01-16',
    amount: 200.00,
    type: 'despesa',
    description: 'Compra de material terapêutico',
    payment_method: 'cartao_debito',
    status: 'pago',
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z'
  },
  {
    id: '5',
    user_id: 'user-1',
    patient_id: '3',
    date: '2024-01-15',
    amount: 150.00,
    type: 'receita',
    description: 'Sessão cancelada - taxa de cancelamento',
    payment_method: 'pix',
    status: 'pago',
    created_at: '2024-01-15T16:30:00Z',
    updated_at: '2024-01-15T16:30:00Z'
  },
  {
    id: '6',
    user_id: 'user-1',
    patient_id: '2',
    date: '2024-01-14',
    amount: 150.00,
    type: 'receita',
    description: 'Sessão de psicoterapia',
    payment_method: 'transferencia',
    status: 'pendente',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z'
  },
  {
    id: '7',
    user_id: 'user-1',
    patient_id: '4',
    date: '2024-01-13',
    amount: 150.00,
    type: 'receita',
    description: 'Sessão de psicoterapia',
    payment_method: 'dinheiro',
    status: 'atrasado',
    created_at: '2024-01-13T14:00:00Z',
    updated_at: '2024-01-13T14:00:00Z'
  },
  {
    id: '8',
    user_id: 'user-1',
    patient_id: '1',
    date: '2024-01-12',
    amount: 80.00,
    type: 'despesa',
    description: 'Assinatura de software',
    payment_method: 'cartao_credito',
    status: 'pago',
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-12T10:00:00Z'
  }
];

export function useFinancials() {
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(mockFinancialRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFinancialRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFinancialRecords(mockFinancialRecords);
    } catch (error: any) {
      console.error('Erro ao buscar registros financeiros:', error);
      setError(error.message || 'Erro ao carregar registros financeiros');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os registros financeiros.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createFinancialRecord = async (recordData: CreateFinancialRecordData): Promise<FinancialRecord | null> => {
    try {
      const newRecord: FinancialRecord = {
        id: Date.now().toString(),
        user_id: 'user-1',
        patient_id: recordData.patient_id,
        appointment_id: recordData.appointment_id,
        date: recordData.date,
        amount: recordData.amount,
        type: recordData.type,
        description: recordData.description,
        payment_method: recordData.payment_method,
        status: recordData.status || 'pago',
        session_date: recordData.session_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setFinancialRecords(prev => [newRecord, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Registro financeiro criado com sucesso!',
      });

      return newRecord;
    } catch (error: any) {
      console.error('Erro ao criar registro financeiro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o registro financeiro.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateFinancialRecord = async (id: string, recordData: UpdateFinancialRecordData): Promise<boolean> => {
    try {
      setFinancialRecords(prev => prev.map(record => 
        record.id === id 
          ? { ...record, ...recordData, updated_at: new Date().toISOString() }
          : record
      ));

      toast({
        title: 'Sucesso',
        description: 'Registro financeiro atualizado com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar registro financeiro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o registro financeiro.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteFinancialRecord = async (id: string): Promise<boolean> => {
    try {
      setFinancialRecords(prev => prev.filter(record => record.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Registro financeiro removido com sucesso!',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar registro financeiro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o registro financeiro.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getFinancialRecordById = (id: string): FinancialRecord | undefined => {
    return financialRecords.find(record => record.id === id);
  };

  const getFinancialRecordsByPatient = (patientId: string): FinancialRecord[] => {
    return financialRecords.filter(record => record.patient_id === patientId);
  };

  const getFinancialRecordsByType = (type: 'receita' | 'despesa'): FinancialRecord[] => {
    return financialRecords.filter(record => record.type === type);
  };

  const getFinancialRecordsByStatus = (status: 'pago' | 'pendente' | 'atrasado'): FinancialRecord[] => {
    return financialRecords.filter(record => record.status === status);
  };

  const getFinancialRecordsByDateRange = (startDate: string, endDate: string): FinancialRecord[] => {
    return financialRecords.filter(record => 
      record.date >= startDate && record.date <= endDate
    );
  };

  const getTotalRevenue = (): number => {
    return financialRecords
      .filter(record => record.type === 'receita' && record.status === 'pago')
      .reduce((total, record) => total + record.amount, 0);
  };

  const getTotalExpenses = (): number => {
    return financialRecords
      .filter(record => record.type === 'despesa' && record.status === 'pago')
      .reduce((total, record) => total + record.amount, 0);
  };

  const getPendingAmount = (): number => {
    return financialRecords
      .filter(record => record.status === 'pendente')
      .reduce((total, record) => total + record.amount, 0);
  };

  const getOverdueAmount = (): number => {
    return financialRecords
      .filter(record => record.status === 'atrasado')
      .reduce((total, record) => total + record.amount, 0);
  };

  const retry = () => {
    fetchFinancialRecords();
  };

  useEffect(() => {
    fetchFinancialRecords();
  }, []);

  return {
    financialRecords,
    loading,
    error,
    createFinancialRecord,
    updateFinancialRecord,
    deleteFinancialRecord,
    getFinancialRecordById,
    getFinancialRecordsByPatient,
    getFinancialRecordsByType,
    getFinancialRecordsByStatus,
    getFinancialRecordsByDateRange,
    getTotalRevenue,
    getTotalExpenses,
    getPendingAmount,
    getOverdueAmount,
    retry
  };
}