import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePagamentos } from './usePagamentos';

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
  const { 
    pagamentos, 
    loading, 
    error 
  } = usePagamentos();
  
  const { toast } = useToast();

  // Converter Pagamento para FinancialRecord
  const convertToFinancialRecord = (pagamento: any): FinancialRecord => ({
    id: pagamento.id,
    user_id: pagamento.userId || 'user-1',
    patient_id: pagamento.pacienteId,
    appointment_id: pagamento.agendaSessaoId,
    date: pagamento.data,
    amount: Number(pagamento.value || 0),
    type: 'receita', // Assumindo receita como padrão
    description: pagamento.descricao || 'Pagamento de sessão',
    payment_method: pagamento.type === 1 ? 'pix' : 
                   pagamento.type === 2 ? 'cartao_credito' :
                   pagamento.type === 3 ? 'transferencia' :
                   pagamento.type === 4 ? 'dinheiro' : undefined,
    status: pagamento.status === 1 || pagamento.status === 2 ? 'pago' : 
           pagamento.status === 0 ? 'pendente' : 'atrasado',
    session_date: pagamento.data,
    created_at: pagamento.createdAt || new Date().toISOString(),
    updated_at: pagamento.updatedAt || new Date().toISOString()
  });

  // Converter pagamentos para formato de exibição
  const financialRecords = pagamentos.map(convertToFinancialRecord);

  const fetchFinancialRecords = async () => {
    // Dados já são carregados pelo hook usePagamentos
    return;
  };

  const createFinancialRecord = async (recordData: CreateFinancialRecordData): Promise<FinancialRecord | null> => {
    // Implementação simplificada - os dados financeiros vêm dos pagamentos
    console.log('createFinancialRecord não implementado - use usePagamentos');
    return null;
  };

  const updateFinancialRecord = async (id: string, recordData: UpdateFinancialRecordData): Promise<boolean> => {
    // Implementação simplificada - os dados financeiros vêm dos pagamentos
    console.log('updateFinancialRecord não implementado - use usePagamentos');
    return false;
  };

  const deleteFinancialRecord = async (id: string): Promise<boolean> => {
    // Implementação simplificada - os dados financeiros vêm dos pagamentos
    console.log('deleteFinancialRecord não implementado - use usePagamentos');
    return false;
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
    // Dados são recarregados automaticamente pelo hook usePagamentos
    return;
  };

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