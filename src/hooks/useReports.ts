
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  type: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';
  period_start: string;
  period_end: string;
  data: {
    total_patients: number;
    total_sessions: number;
    total_revenue: number;
    average_session_duration: number;
    patient_retention_rate: number;
    top_diagnoses: string[];
    session_distribution: {
      completed: number;
      cancelled: number;
      no_show: number;
    };
    revenue_by_month: {
      month: string;
      amount: number;
    }[];
  };
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  title: string;
  type: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';
  period_start: string;
  period_end: string;
}

// Dados mockados
const mockReports: Report[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: 'Relatório Mensal - Janeiro 2024',
    type: 'mensal',
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    data: {
      total_patients: 25,
      total_sessions: 89,
      total_revenue: 13350.00,
      average_session_duration: 50,
      patient_retention_rate: 85,
      top_diagnoses: ['Ansiedade', 'Depressão', 'TOC', 'Transtorno de Personalidade'],
      session_distribution: {
        completed: 78,
        cancelled: 8,
        no_show: 3
      },
      revenue_by_month: [
        { month: 'Janeiro', amount: 13350.00 }
      ]
    },
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    title: 'Relatório Trimestral - Q4 2023',
    type: 'trimestral',
    period_start: '2023-10-01',
    period_end: '2023-12-31',
    data: {
      total_patients: 30,
      total_sessions: 245,
      total_revenue: 36750.00,
      average_session_duration: 50,
      patient_retention_rate: 82,
      top_diagnoses: ['Depressão', 'Ansiedade', 'Transtorno de Estresse Pós-Traumático'],
      session_distribution: {
        completed: 220,
        cancelled: 18,
        no_show: 7
      },
      revenue_by_month: [
        { month: 'Outubro', amount: 12000.00 },
        { month: 'Novembro', amount: 11800.00 },
        { month: 'Dezembro', amount: 12950.00 }
      ]
    },
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '3',
    user_id: 'user-1',
    title: 'Relatório Anual - 2023',
    type: 'anual',
    period_start: '2023-01-01',
    period_end: '2023-12-31',
    data: {
      total_patients: 45,
      total_sessions: 890,
      total_revenue: 133500.00,
      average_session_duration: 50,
      patient_retention_rate: 78,
      top_diagnoses: ['Ansiedade', 'Depressão', 'TOC', 'Transtorno de Personalidade', 'TEPT'],
      session_distribution: {
        completed: 820,
        cancelled: 52,
        no_show: 18
      },
      revenue_by_month: [
        { month: 'Janeiro', amount: 10500.00 },
        { month: 'Fevereiro', amount: 11200.00 },
        { month: 'Março', amount: 10800.00 },
        { month: 'Abril', amount: 11500.00 },
        { month: 'Maio', amount: 12000.00 },
        { month: 'Junho', amount: 11800.00 },
        { month: 'Julho', amount: 12500.00 },
        { month: 'Agosto', amount: 12200.00 },
        { month: 'Setembro', amount: 11900.00 },
        { month: 'Outubro', amount: 12000.00 },
        { month: 'Novembro', amount: 11800.00 },
        { month: 'Dezembro', amount: 12950.00 }
      ]
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

export function useReports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReports(mockReports);
    } catch (error: any) {
      console.error('Erro ao buscar relatórios:', error);
      setError(error.message || 'Erro ao carregar relatórios');
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os relatórios.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportData: CreateReportData): Promise<Report | null> => {
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: Report = {
        id: Date.now().toString(),
        user_id: 'user-1',
        title: reportData.title,
        type: reportData.type,
        period_start: reportData.period_start,
        period_end: reportData.period_end,
        data: {
          total_patients: Math.floor(Math.random() * 50) + 20,
          total_sessions: Math.floor(Math.random() * 200) + 50,
          total_revenue: Math.floor(Math.random() * 20000) + 10000,
          average_session_duration: 50,
          patient_retention_rate: Math.floor(Math.random() * 30) + 70,
          top_diagnoses: ['Ansiedade', 'Depressão', 'TOC'],
          session_distribution: {
            completed: Math.floor(Math.random() * 100) + 50,
            cancelled: Math.floor(Math.random() * 20) + 5,
            no_show: Math.floor(Math.random() * 10) + 1
          },
          revenue_by_month: [
            { month: 'Janeiro', amount: Math.floor(Math.random() * 5000) + 8000 }
          ]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
      
      toast({
        title: 'Relatório gerado!',
        description: 'O relatório foi criado com sucesso.',
      });

      return newReport;
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    try {
      setReports(prev => prev.filter(report => report.id !== id));

      toast({
        title: 'Relatório removido!',
        description: 'O relatório foi excluído com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o relatório.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getReportById = (id: string): Report | undefined => {
    return reports.find(report => report.id === id);
  };

  const getReportsByType = (type: Report['type']): Report[] => {
    return reports.filter(report => report.type === type);
  };

  const getReportsByPeriod = (startDate: string, endDate: string): Report[] => {
    return reports.filter(report => 
      report.period_start >= startDate && report.period_end <= endDate
    );
  };

  const searchReports = (query: string): Report[] => {
    const lowerQuery = query.toLowerCase();
    return reports.filter(report => 
      report.title.toLowerCase().includes(lowerQuery) ||
      report.type.toLowerCase().includes(lowerQuery)
    );
  };

  const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<string | null> => {
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report = reports.find(r => r.id === reportId);
      if (!report) return null;
      
      toast({
        title: 'Relatório exportado!',
        description: `O relatório foi exportado em formato ${format.toUpperCase()}.`,
      });
      
      return `relatorio_${report.title.replace(/\s+/g, '_').toLowerCase()}.${format}`;
    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const retry = () => {
    fetchReports();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    generateReport,
    deleteReport,
    getReportById,
    getReportsByType,
    getReportsByPeriod,
    searchReports,
    exportReport,
    retry
  };
}
