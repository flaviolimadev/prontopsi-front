import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, User, Plus, Edit, Trash2, RefreshCw, AlertCircle, Repeat, ChevronLeft, ChevronRight, ExternalLink, Calendar as CalendarIcon, MapPin, Clock as ClockIcon, Search, Filter, X, CreditCard, DollarSign, CheckCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAgendaSessoes } from "@/hooks/useAgendaSessoes";
import { usePacientes } from "@/hooks/usePacientes";
import { usePacotes } from "../hooks/usePacotes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { AgendaSkeleton } from "@/components/ui/agenda-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface AppointmentFormData {
  pacienteId: string;
  data: string;
  horario: string;
  duracao: number;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  status: number;
  observacao?: string;
  value?: number;
  pacoteId?: string | null;
  valorAvulso?: number;
  tipoPagamento?: 'pacote' | 'avulso';
}

interface RecurringAppointmentData {
  isRecurring: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number; // 0 = Domingo, 1 = Segunda, etc.
  quantity: number;
}

export default function Agenda() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Função auxiliar para formatar data sem problemas de fuso horário
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const { 
    agendaSessoes, 
    loading: appointmentsLoading, 
    error: appointmentsError,
    createAgendaSessao, 
    updateAgendaSessao, 
    deleteAgendaSessao,
    retry: retryAppointments
  } = useAgendaSessoes();
  
  const { 
    pacientes, 
    loading: patientsLoading, 
    error: patientsError
  } = usePacientes();

  const { 
    pacotes, 
    loading: pacotesLoading,
    fetchPacotes
  } = usePacotes();

  const { 
    createPagamento,
    updatePagamento,
    deletePagamento,
    fetchPagamentosByAgendaSessao
  } = usePagamentos();

  // Carregar pacotes ao montar o componente
  useEffect(() => {
    fetchPacotes();
  }, [fetchPacotes]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  
  // Estados para modais de pagamento
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [isEditPagamentoModalOpen, setIsEditPagamentoModalOpen] = useState(false);
  const [selectedAgendaSessao, setSelectedAgendaSessao] = useState<any>(null);
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);
  const [agendaPagamentos, setAgendaPagamentos] = useState<{[key: string]: any[]}>({});
  const [pagamentoForm, setPagamentoForm] = useState({
    pacienteId: '',
    pacoteId: null as string | null,
    data: formatDateToYYYYMMDD(new Date()),
    vencimento: formatDateToYYYYMMDD(new Date()),
    value: 0,
    descricao: '',
    type: null as number | null,
    status: 0 as number,
    txid: '',
  });
  
  // Estados para filtros de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    pacienteId: "",
    data: formatDateToYYYYMMDD(new Date()),
    horario: "09:00",
    duracao: 50,
    tipoDaConsulta: "Consulta",
    modalidade: "Presencial",
    tipoAtendimento: "Individual",
    status: 0,
    observacao: "",
    value: 0,
    pacoteId: null,
    valorAvulso: 0,
    tipoPagamento: 'avulso'
  });

  const [recurringData, setRecurringData] = useState<RecurringAppointmentData>({
    isRecurring: false,
    frequency: 'weekly',
    dayOfWeek: new Date().getDay(),
    quantity: 1
  });

  // Filtrar apenas pacientes ativos
  const activePatients = useMemo(() => {
    return pacientes.filter(paciente => paciente.status === 1);
  }, [pacientes]);



  // Função para verificar se há filtros ativos
  const hasActiveFilters = searchTerm.trim() || statusFilter !== null || dateRangeFilter.startDate || dateRangeFilter.endDate;

  // Função para filtrar consultas
  const filteredAgendaSessoes = useMemo(() => {
    let filtered = agendaSessoes;

    // Filtro por termo de busca (nome, CPF, email do paciente)
    if (searchTerm.trim()) {
      filtered = filtered.filter(sessao => {
        const paciente = pacientes.find(p => p.id === sessao.pacienteId);
        if (!paciente) return false;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          paciente.nome.toLowerCase().includes(searchLower) ||
          (paciente.cpf && paciente.cpf.includes(searchTerm)) ||
          (paciente.email && paciente.email.toLowerCase().includes(searchLower))
        );
      });
    }

    // Filtro por status
    if (statusFilter !== null) {
      filtered = filtered.filter(sessao => sessao.status === statusFilter);
    }

    // Filtro por período
    if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
      filtered = filtered.filter(sessao => {
        const sessaoDate = new Date(sessao.data);
        const startDate = new Date(dateRangeFilter.startDate);
        const endDate = new Date(dateRangeFilter.endDate);
        return sessaoDate >= startDate && sessaoDate <= endDate;
      });
    }

    return filtered;
  }, [agendaSessoes, pacientes, searchTerm, statusFilter, dateRangeFilter]);

  // Consultas a serem exibidas (do dia selecionado ou todas filtradas)
  const dayAppointments = useMemo(() => {
    let appointmentsToShow;
    
    if (hasActiveFilters) {
      // Se há filtros ativos, mostrar todas as consultas filtradas
      appointmentsToShow = filteredAgendaSessoes;
    } else {
      // Se não há filtros, mostrar apenas as consultas do dia selecionado
      const selectedDateStr = formatDateToYYYYMMDD(selectedDate);
      appointmentsToShow = filteredAgendaSessoes.filter(sessao => sessao.data === selectedDateStr);
    }
    
    return appointmentsToShow
      .map(sessao => {
        const paciente = pacientes.find(p => p.id === sessao.pacienteId);
        return {
          ...sessao,
          patientName: paciente?.nome || sessao.paciente?.nome || 'Paciente não encontrado',
          time: sessao.horario,
          date: sessao.data,
          patient_id: sessao.pacienteId,
          type: sessao.tipoDaConsulta,
          modality: sessao.modalidade,
          session_type: sessao.tipoAtendimento,
          duration: sessao.duracao,
          notes: sessao.observacao
        };
      })
      .sort((a, b) => {
        // Ordenar por data primeiro, depois por horário
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.horario.localeCompare(b.horario);
      });
  }, [filteredAgendaSessoes, pacientes, selectedDate, hasActiveFilters]);

  // Carregar pagamentos para todas as sessões visíveis (filtradas ou do dia)
  useEffect(() => {
    const loadPagamentosForVisible = async () => {
      if (dayAppointments.length === 0) return;
      
      const pagamentosMap: {[key: string]: any[]} = {};
      
      // Carregar pagamentos para cada sessão visível
      await Promise.all(
        dayAppointments.map(async (appointment) => {
          // Só carregar se ainda não estiver no estado
          if (!agendaPagamentos[appointment.id]) {
            try {
              const pagamentos = await fetchPagamentosByAgendaSessao(appointment.id);
              pagamentosMap[appointment.id] = pagamentos || [];
            } catch (error) {
              console.error(`Erro ao carregar pagamentos para sessão ${appointment.id}:`, error);
              pagamentosMap[appointment.id] = [];
            }
          }
        })
      );
      
      if (Object.keys(pagamentosMap).length > 0) {
        setAgendaPagamentos(prev => ({
          ...prev,
          ...pagamentosMap
        }));
      }
    };

    loadPagamentosForVisible();
  }, [dayAppointments, agendaPagamentos, fetchPagamentosByAgendaSessao]);

  // Se ambos ainda estão carregando inicialmente, mostrar skeleton
  if (appointmentsLoading && patientsLoading) {
    return <AgendaSkeleton />;
  }

  // Se há erros críticos em ambos, mostrar erro
  if (appointmentsError && patientsError) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Não foi possível carregar os dados da agenda. Verifique sua conexão com a internet.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                retryAppointments();
                // Recarregar dados
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleCreateAppointment = async () => {
    if (!formData.pacienteId || !formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validar pagamento
    if (formData.tipoPagamento === 'avulso' && (!formData.valorAvulso || formData.valorAvulso <= 0)) {
      toast({
        title: "Erro",
        description: "Por favor, informe um valor válido para a consulta.",
        variant: "destructive"
      });
      return;
    }

    if (formData.tipoPagamento === 'pacote' && !formData.pacoteId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um pacote.",
        variant: "destructive"
      });
      return;
    }

    if (recurringData.isRecurring && (!recurringData.dayOfWeek || recurringData.quantity < 1)) {
      toast({
        title: "Erro",
        description: "Para agendamento recorrente, preencha o dia da semana e a quantidade de sessões.",
        variant: "destructive"
      });
      return;
    }

    if (recurringData.isRecurring && recurringData.quantity > 52) {
      toast({
        title: "Erro",
        description: "A quantidade máxima de sessões é 52.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (recurringData.isRecurring) {
        // Criar múltiplas consultas recorrentes
        const startDate = new Date(formData.data + 'T00:00:00');
        const dates = calculateRecurringDates(
          startDate,
          recurringData.frequency,
          recurringData.dayOfWeek!,
          recurringData.quantity
        );

        const promises = dates.map(async date => {
          const appointmentData = {
            ...formData,
            data: formatDateToYYYYMMDD(date)
          };
          
          // Criar a sessão
          const session = await createAgendaSessao(appointmentData);
          
          // Criar o pagamento correspondente
          const pagamentoData = {
            pacienteId: formData.pacienteId,
            pacoteId: formData.tipoPagamento === 'pacote' ? formData.pacoteId : null,
            agendaSessaoId: session.id, // Vincular ao ID da agenda criada
            data: formatDateToYYYYMMDD(date),
            vencimento: formatDateToYYYYMMDD(date), // Vencimento no mesmo dia da consulta
            value: formData.tipoPagamento === 'pacote' 
              ? Number(pacotes?.find(p => p.id === formData.pacoteId)?.value || 0)
              : Number(formData.valorAvulso || 0),
            descricao: `Pagamento para consulta em ${date.toLocaleDateString('pt-BR')} - ${formData.tipoDaConsulta}`,
            type: null, // Será definido quando o pagamento for realizado
            txid: null
          };
          
          await createPagamento(pagamentoData);
          
          return session;
        });

        await Promise.all(promises);

        toast({
          title: "Sucesso",
          description: `${recurringData.quantity} consultas agendadas e pagamentos criados com sucesso!`,
        });
      } else {
        // Criar consulta única
        const session = await createAgendaSessao(formData);
        
        // Criar o pagamento correspondente
        const pagamentoData = {
          pacienteId: formData.pacienteId,
          pacoteId: formData.tipoPagamento === 'pacote' ? formData.pacoteId : null,
          agendaSessaoId: session.id, // Vincular ao ID da agenda criada
          data: formData.data,
          vencimento: formData.data, // Vencimento no mesmo dia da consulta
          value: formData.tipoPagamento === 'pacote' 
            ? Number(pacotes?.find(p => p.id === formData.pacoteId)?.value || 0)
            : Number(formData.valorAvulso || 0),
          descricao: `Pagamento para consulta em ${new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')} - ${formData.tipoDaConsulta}`,
          type: null, // Será definido quando o pagamento for realizado
          txid: null
        };
        
        await createPagamento(pagamentoData);
        
        toast({
          title: "Sucesso",
          description: "Consulta agendada e pagamento criado com sucesso!",
        });
      }

      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro",
        description: "Erro ao agendar consulta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditAppointment = async () => {
    if (!editingAppointment || !formData.pacienteId || !formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateAgendaSessao(editingAppointment.id, formData);
      setIsEditModalOpen(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      // Primeiro, verificar se há pagamentos vinculados a esta sessão
      const pagamentosVinculados = agendaPagamentos[appointmentId];
      
      // Se há pagamentos vinculados, excluí-los primeiro
      if (pagamentosVinculados && pagamentosVinculados.length > 0) {
        await Promise.all(
          pagamentosVinculados.map(async (pagamento) => {
            try {
              await deletePagamento(pagamento.id);
            } catch (error) {
              console.error(`Erro ao excluir pagamento ${pagamento.id}:`, error);
              // Continua mesmo se falhar para excluir outros pagamentos
            }
          })
        );
        
        // Remover pagamentos do estado local
        setAgendaPagamentos(prev => {
          const newState = { ...prev };
          delete newState[appointmentId];
          return newState;
        });
      }
      
      // Depois excluir a sessão
      await deleteAgendaSessao(appointmentId);
      
      toast({
        title: "Sessão excluída",
        description: pagamentosVinculados && pagamentosVinculados.length > 0 
          ? "A sessão e seus pagamentos foram removidos com sucesso."
          : "A sessão foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a sessão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      pacienteId: appointment.pacienteId,
      data: appointment.data,
      horario: appointment.horario,
      duracao: appointment.duracao,
      tipoDaConsulta: appointment.tipoDaConsulta,
      modalidade: appointment.modalidade,
      tipoAtendimento: appointment.tipoAtendimento,
      status: appointment.status,
      observacao: appointment.observacao || "",
      value: appointment.value || 0
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge className="bg-blue-500">Pendente</Badge>;
      case 1:
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case 2:
        return <Badge className="bg-purple-500">Realizado</Badge>;
      case 3:
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getModalityIcon = (modality: string) => {
    return modality === "Online" ? "🖥️" : "🏢";
  };

  // Função para calcular datas recorrentes
  const calculateRecurringDates = (startDate: Date, frequency: string, dayOfWeek: number, quantity: number): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    // Ajustar para o dia da semana desejado
    while (currentDate.getDay() !== dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    for (let i = 0; i < quantity; i++) {
      const newDate = new Date(currentDate);
      dates.push(newDate);
      
      // Calcular próxima data baseada na frequência
      if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return dates;
  };

  // Função para gerar o calendário do mês
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Função para obter consultas de um dia específico
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    return filteredAgendaSessoes.filter(sessao => sessao.data === dateStr);
  };

  // Função para verificar se um dia tem consultas
  const hasAppointments = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  // Função para obter o status das consultas de um dia
  const getDayStatus = (date: Date) => {
    const appointments = getAppointmentsForDate(date);
    if (appointments.length === 0) return null;
    
    const hasPending = appointments.some(a => a.status === 0);
    const hasConfirmed = appointments.some(a => a.status === 1);
    const hasCompleted = appointments.some(a => a.status === 2);
    const hasCancelled = appointments.some(a => a.status === 3);
    
    if (hasCompleted) return 'completed';
    if (hasCancelled) return 'cancelled';
    if (hasConfirmed) return 'confirmed';
    if (hasPending) return 'pending';
    
    return null;
  };

  // Função para navegar ao perfil do paciente
  const navigateToPatientProfile = (pacienteId: string) => {
    navigate(`/pacientes/${pacienteId}`);
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setDateRangeFilter({ startDate: '', endDate: '' });
  };

  // Funções para gerenciar pagamentos
  const openPagamentoModal = async (agendaSessao: any) => {
    setSelectedAgendaSessao(agendaSessao);
    
    // Buscar pagamentos existentes para esta agenda
    try {
      const pagamentos = await fetchPagamentosByAgendaSessao(agendaSessao.id);
      
      // Atualizar o estado local com os pagamentos encontrados
      setAgendaPagamentos(prev => ({
        ...prev,
        [agendaSessao.id]: pagamentos || []
      }));
      
      if (pagamentos && pagamentos.length > 0) {
        // Se já existe pagamento, abrir modal de edição
        setSelectedPagamento(pagamentos[0]);
        setPagamentoForm({
          pacienteId: agendaSessao.pacienteId,
          pacoteId: pagamentos[0].pacoteId,
          data: pagamentos[0].data,
          vencimento: pagamentos[0].vencimento,
          value: pagamentos[0].value,
          descricao: pagamentos[0].descricao || '',
          type: pagamentos[0].type,
          status: pagamentos[0].status || 0,
          txid: pagamentos[0].txid || '',
        });
        setIsEditPagamentoModalOpen(true);
      } else {
        // Se não existe pagamento, abrir modal de criação
        setPagamentoForm({
          pacienteId: agendaSessao.pacienteId,
          pacoteId: null,
          data: agendaSessao.data,
          vencimento: agendaSessao.data,
          value: agendaSessao.value || 0,
          descricao: `Pagamento para consulta em ${new Date(agendaSessao.data).toLocaleDateString('pt-BR')}`,
          type: null,
          status: 0,
          txid: '',
        });
        setIsPagamentoModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      // Em caso de erro, abrir modal de criação
              setPagamentoForm({
          pacienteId: agendaSessao.pacienteId,
          pacoteId: null,
          data: agendaSessao.data,
          vencimento: agendaSessao.data,
          value: agendaSessao.value || 0,
          descricao: `Pagamento para consulta em ${new Date(agendaSessao.data).toLocaleDateString('pt-BR')}`,
          type: null,
          status: 0,
          txid: '',
        });
      setIsPagamentoModalOpen(true);
    }
  };

  const handleCreatePagamento = async () => {
    try {
      const newPagamento = await createPagamento({
        ...pagamentoForm,
        agendaSessaoId: selectedAgendaSessao.id,
      });
      
      // Atualizar o estado local com o novo pagamento
      setAgendaPagamentos(prev => ({
        ...prev,
        [selectedAgendaSessao.id]: [newPagamento]
      }));
      
      setIsPagamentoModalOpen(false);
      setSelectedAgendaSessao(null);
      setPagamentoForm({
        pacienteId: '',
        pacoteId: null,
        data: formatDateToYYYYMMDD(new Date()),
        vencimento: formatDateToYYYYMMDD(new Date()),
        value: 0,
        descricao: '',
        type: null,
        status: 0,
        txid: '',
      });
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
    }
  };

  const handleUpdatePagamento = async () => {
    try {
      const updatedPagamento = await updatePagamento(selectedPagamento.id, {
        ...pagamentoForm,
        agendaSessaoId: selectedAgendaSessao.id,
      });
      
      // Atualizar o estado local com o pagamento atualizado
      setAgendaPagamentos(prev => ({
        ...prev,
        [selectedAgendaSessao.id]: [updatedPagamento]
      }));
      
      setIsEditPagamentoModalOpen(false);
      setSelectedAgendaSessao(null);
      setSelectedPagamento(null);
      setPagamentoForm({
        pacienteId: '',
        pacoteId: null,
        data: formatDateToYYYYMMDD(new Date()),
        vencimento: formatDateToYYYYMMDD(new Date()),
        value: 0,
        descricao: '',
        type: null,
        status: 0,
        txid: '',
      });
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
    }
  };

  const handleDeletePagamento = async () => {
    if (!selectedPagamento) return;
    
    try {
      await deletePagamento(selectedPagamento.id);
      
      // Remover o pagamento do estado local
      setAgendaPagamentos(prev => {
        const newState = { ...prev };
        delete newState[selectedAgendaSessao.id];
        return newState;
      });
      
      setIsEditPagamentoModalOpen(false);
      setSelectedAgendaSessao(null);
      setSelectedPagamento(null);
      setPagamentoForm({
        pacienteId: '',
        pacoteId: null,
        data: formatDateToYYYYMMDD(new Date()),
        vencimento: formatDateToYYYYMMDD(new Date()),
        value: 0,
        descricao: '',
        type: null,
        status: 0,
        txid: '',
      });
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
    }
  };

  const formatPagamentoValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePagamentoValueChange = (value: string) => {
    const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    setPagamentoForm(prev => ({ ...prev, value: parseFloat(numericValue) || 0 }));
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Pendente';
      case 1: return 'Pago';
      case 2: return 'Confirmado';
      case 3: return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const getTypeLabel = (type: number | null) => {
    switch (type) {
      case 1: return 'PIX';
      case 2: return 'Cartão';
      case 3: return 'Boleto';
      case 4: return 'Espécie';
      default: return 'Não informado';
    }
  };

  // Função utilitária para exibir o ícone de status do pagamento
  function getPagamentoStatusIcon(pagamentos: any[]): JSX.Element | null {
    if (!pagamentos || pagamentos.length === 0) return null;
    const status = pagamentos.some(p => p.status === 3)
      ? 3
      : pagamentos.some(p => p.status === 0)
      ? 0
      : pagamentos.some(p => p.status === 2)
      ? 2
      : pagamentos.some(p => p.status === 1)
      ? 1
      : null;
    if (status === 0) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    if (status === 1) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 2) return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
    if (status === 3) return <X className="w-5 h-5 text-red-500" />;
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            // Resetar formulário quando fechar
            setFormData({
              pacienteId: "",
              data: new Date().toISOString().split('T')[0],
              horario: "09:00",
              duracao: 50,
              tipoDaConsulta: "Consulta",
              modalidade: "Presencial",
              tipoAtendimento: "Individual",
              status: 0,
              observacao: "",
              value: 0,
              pacoteId: null,
              valorAvulso: 0,
              tipoPagamento: 'avulso'
            });
            setRecurringData({
              isRecurring: false,
              frequency: 'weekly',
              dayOfWeek: new Date().getDay(),
              quantity: 1
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={!!patientsError}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
              <DialogDescription>
                Preencha os dados para agendar uma nova consulta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                {patientsLoading ? (
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                ) : (
                  <Select value={formData.pacienteId} onValueChange={(value) => setFormData({...formData, pacienteId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePatients.map((paciente) => (
                        <SelectItem key={paciente.id} value={paciente.id}>
                          {paciente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Input
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({...formData, horario: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo da Consulta</Label>
                  <Select value={formData.tipoDaConsulta} onValueChange={(value: any) => setFormData({...formData, tipoDaConsulta: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Avaliação">Avaliação</SelectItem>
                      <SelectItem value="Retorno">Retorno</SelectItem>
                      <SelectItem value="Grupo">Grupo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <Select value={formData.modalidade} onValueChange={(value: any) => setFormData({...formData, modalidade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Atendimento</Label>
                <Select value={formData.tipoAtendimento} onValueChange={(value: any) => setFormData({...formData, tipoAtendimento: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Casal">Casal</SelectItem>
                    <SelectItem value="Grupo">Grupo</SelectItem>
                    <SelectItem value="Família">Família</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duração (minutos)</Label>
                <Input
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => setFormData({...formData, duracao: parseInt(e.target.value) || 50})}
                />
              </div>
              
              {/* Agendamento Recorrente */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={recurringData.isRecurring}
                    onChange={(e) => setRecurringData({
                      ...recurringData,
                      isRecurring: e.target.checked
                    })}
                    className="rounded"
                  />
                  <Label htmlFor="recurring" className="font-medium flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Agendamento Recorrente
                  </Label>
                </div>
                
                {recurringData.isRecurring && (
                  <div className="space-y-3 pl-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frequência</Label>
                        <Select 
                          value={recurringData.frequency} 
                          onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => setRecurringData({
                            ...recurringData,
                            frequency: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Toda semana</SelectItem>
                            <SelectItem value="biweekly">A cada 15 dias</SelectItem>
                            <SelectItem value="monthly">Todo mês</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Dia da Semana</Label>
                        <Select 
                          value={recurringData.dayOfWeek?.toString()} 
                          onValueChange={(value) => setRecurringData({
                            ...recurringData,
                            dayOfWeek: parseInt(value)
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Domingo</SelectItem>
                            <SelectItem value="1">Segunda-feira</SelectItem>
                            <SelectItem value="2">Terça-feira</SelectItem>
                            <SelectItem value="3">Quarta-feira</SelectItem>
                            <SelectItem value="4">Quinta-feira</SelectItem>
                            <SelectItem value="5">Sexta-feira</SelectItem>
                            <SelectItem value="6">Sábado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade de Sessões</Label>
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={recurringData.quantity}
                        onChange={(e) => setRecurringData({
                          ...recurringData,
                          quantity: parseInt(e.target.value) || 1
                        })}
                        placeholder="Ex: 5"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seção de Pagamento */}
              <div className="space-y-3 border-t pt-4">
                <Label className="text-base font-medium">Pagamento</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="tipo-avulso"
                        name="tipoPagamento"
                        value="avulso"
                        checked={formData.tipoPagamento === 'avulso'}
                        onChange={(e) => setFormData({
                          ...formData, 
                          tipoPagamento: e.target.value as 'pacote' | 'avulso',
                          pacoteId: null
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="tipo-avulso" className="text-sm">Valor Avulso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="tipo-pacote"
                        name="tipoPagamento"
                        value="pacote"
                        checked={formData.tipoPagamento === 'pacote'}
                        onChange={(e) => setFormData({
                          ...formData, 
                          tipoPagamento: e.target.value as 'pacote' | 'avulso',
                          valorAvulso: 0
                        })}
                        className="rounded"
                      />
                      <Label htmlFor="tipo-pacote" className="text-sm">Pacote</Label>
                    </div>
                  </div>

                  {formData.tipoPagamento === 'avulso' && (
                    <div className="space-y-2">
                      <Label>Valor da Consulta (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={formData.valorAvulso || ''}
                        onChange={(e) => setFormData({
                          ...formData, 
                          valorAvulso: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  )}

                  {formData.tipoPagamento === 'pacote' && (
                    <div className="space-y-2">
                      <Label>Selecionar Pacote</Label>
                      {pacotesLoading ? (
                        <div className="h-10 w-full bg-muted animate-pulse rounded" />
                      ) : pacotes?.filter(pacote => pacote.ativo).length === 0 ? (
                        <div className="p-3 bg-muted rounded-md border">
                          <p className="text-sm text-muted-foreground">
                            Nenhum pacote ativo encontrado. 
                            <br />
                            Crie pacotes na página Financeiro para poder selecioná-los aqui.
                          </p>
                        </div>
                      ) : (
                        <Select 
                          value={formData.pacoteId || ''} 
                          onValueChange={(value) => setFormData({...formData, pacoteId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um pacote" />
                          </SelectTrigger>
                          <SelectContent>
                            {pacotes?.filter(pacote => pacote.ativo).map((pacote) => (
                              <SelectItem key={pacote.id} value={pacote.id}>
                                {pacote.title} - R$ {Number(pacote.value || 0).toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Observações sobre a consulta..."
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAppointment}>
                  Agendar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sistema de Busca e Filtros */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Barra de busca principal */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, CPF ou email do paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-12 text-base"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {[
                      searchTerm.trim() && '1',
                      statusFilter !== null && '1',
                      (dateRangeFilter.startDate || dateRangeFilter.endDate) && '1'
                    ].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Painel de filtros avançados */}
            {isFilterPanelOpen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                {/* Filtro por status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={statusFilter?.toString() || 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? null : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="0">Pendente</SelectItem>
                      <SelectItem value="1">Confirmado</SelectItem>
                      <SelectItem value="2">Realizado</SelectItem>
                      <SelectItem value="3">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por período - Data inicial */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data inicial</Label>
                  <Input
                    type="date"
                    value={dateRangeFilter.startDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="h-10"
                  />
                </div>

                {/* Filtro por período - Data final */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data final</Label>
                  <Input
                    type="date"
                    value={dateRangeFilter.endDate}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-10"
                  />
                </div>
              </div>
            )}

            {/* Resultados da busca */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="w-4 h-4" />
                  <span>
                    {filteredAgendaSessoes.length} consulta{filteredAgendaSessoes.length !== 1 ? 's' : ''} encontrada{filteredAgendaSessoes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {searchTerm.trim() && (
                    <Badge variant="outline" className="text-xs">
                      Busca: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== null && (
                    <Badge variant="outline" className="text-xs">
                      Status: {statusFilter === 0 ? 'Pendente' : statusFilter === 1 ? 'Confirmado' : statusFilter === 2 ? 'Realizado' : 'Cancelado'}
                    </Badge>
                  )}
                  {(dateRangeFilter.startDate || dateRangeFilter.endDate) && (
                    <Badge variant="outline" className="text-xs">
                      Período: {dateRangeFilter.startDate || '...'} até {dateRangeFilter.endDate || '...'}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status Alerts - Only show persistent errors */}
      {((appointmentsError && !appointmentsLoading) || (patientsError && !patientsLoading)) && (
        <div className="space-y-2">
          {appointmentsError && !appointmentsLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Não foi possível carregar os dados da agenda. Verifique sua conexão com a internet.</span>
                <Button variant="outline" size="sm" onClick={retryAppointments}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {patientsError && !patientsLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Não foi possível carregar os pacientes. Verifique sua conexão com a internet.</span>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Navegação do calendário */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex flex-col items-center">
                <h3 className="font-semibold">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      const today = new Date();
                      setCurrentMonth(today);
                      setSelectedDate(today);
                    }}
                  >
                    Hoje
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {filteredAgendaSessoes.filter(sessao => {
                      const sessaoDate = new Date(sessao.data);
                      return sessaoDate.getMonth() === currentMonth.getMonth() && 
                             sessaoDate.getFullYear() === currentMonth.getFullYear();
                    }).length} consultas
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(currentMonth).map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                const hasAppts = hasAppointments(date);
                const dayStatus = getDayStatus(date);
                const appointments = getAppointmentsForDate(date);

                return (
                  <div
                    key={index}
                    className={`
                      relative min-h-[40px] p-1 text-center cursor-pointer rounded-md border transition-colors
                      ${!isCurrentMonth ? 'text-muted-foreground/50' : 'hover:bg-muted/50'}
                      ${isSelected ? 'bg-primary text-primary-foreground border-primary' : ''}
                      ${isToday && !isSelected ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : ''}
                    `}
                                         onClick={() => {
                       setSelectedDate(date);
                       // Se a data selecionada for de outro mês, navegar para esse mês
                       if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
                         setCurrentMonth(date);
                       }
                     }}
                  >
                    <div className="text-sm font-medium">
                      {date.getDate()}
                    </div>
                    
                    {/* Indicadores de consultas */}
                    {hasAppts && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {appointments.slice(0, 3).map((appointment, apptIndex) => (
                            <div
                              key={apptIndex}
                              className={`
                                w-1.5 h-1.5 rounded-full
                                ${appointment.status === 2 ? 'bg-green-500' : ''}
                                ${appointment.status === 3 ? 'bg-red-500' : ''}
                                ${appointment.status === 1 ? 'bg-blue-500' : ''}
                                ${appointment.status === 0 ? 'bg-yellow-500' : ''}
                              `}
                            />
                          ))}
                        </div>
                        {appointments.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center mt-0.5">
                            +{appointments.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-muted-foreground mb-2">Legenda:</div>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Pendente</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Confirmado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Realizado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Cancelado</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Schedule */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {hasActiveFilters ? 'Consultas Encontradas' : selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {dayAppointments.length} consulta{dayAppointments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-4 p-4 border rounded-xl">
                      <div className="w-16 h-16 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-5 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="w-20 h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-muted-foreground mb-2 text-lg">
                  {hasActiveFilters ? 'Nenhuma consulta encontrada' : 'Nenhuma consulta agendada'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {hasActiveFilters 
                    ? 'Tente ajustar os filtros de busca para encontrar mais resultados.'
                    : 'Este dia está livre. Clique em "Nova Consulta" para agendar.'
                  }
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Consulta
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {dayAppointments.map((appointment) => (
                  <div key={appointment.id} className={`group relative bg-card border rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20 ${
                  agendaPagamentos[appointment.id] && 
                  agendaPagamentos[appointment.id].length > 0 && 
                  agendaPagamentos[appointment.id].some((p: any) => p.status === 0) 
                    ? 'border-red-300 border-2' 
                    : ''
                }`}>
                    {/* Status indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
                      appointment.status === 0 ? 'bg-yellow-500' :
                      appointment.status === 1 ? 'bg-blue-500' :
                      appointment.status === 2 ? 'bg-green-500' :
                      'bg-red-500'
                    }`} />
                    
                    {/* Layout Mobile-First Responsivo */}
                    <div className="space-y-4">
                      {/* Cabeçalho com Avatar e Info Principal */}
                      <div className="flex items-start gap-3">
                        {/* Avatar do paciente */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                            <User className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                          </div>
                          {/* Indicador de modalidade */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
                            <span className="text-xs">{getModalityIcon(appointment.modalidade)}</span>
                          </div>
                        </div>

                        {/* Informações principais */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{appointment.patientName}</h3>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(appointment.status)}
                              {agendaPagamentos[appointment.id] && agendaPagamentos[appointment.id].length > 0 && (
                                <span>{getPagamentoStatusIcon(agendaPagamentos[appointment.id])}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Horário e Duração */}
                          <div className="flex flex-wrap items-center gap-4 mb-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ClockIcon className="w-4 h-4" />
                              <span>{appointment.horario}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{appointment.duracao}min</span>
                            </div>
                          </div>
                          
                          {/* Mostrar data quando há filtros ativos */}
                          {hasActiveFilters && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <CalendarDays className="w-4 h-4" />
                              <span>
                                {new Date(appointment.data).toLocaleDateString('pt-BR', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          )}

                          {/* Badges de Tipo */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {appointment.tipoDaConsulta}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {appointment.tipoAtendimento}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Observações */}
                      {appointment.observacao && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">
                            {appointment.observacao}
                          </p>
                        </div>
                      )}

                      {/* Ações - Layout Responsivo */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                        {/* Primeira linha de ações em mobile, linha única em desktop */}
                        <div className="flex flex-wrap gap-2 flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigateToPatientProfile(appointment.pacienteId)}
                            className="flex items-center gap-2 flex-1 sm:flex-none"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Perfil</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(appointment)}
                            className="flex items-center gap-2 flex-1 sm:flex-none"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </Button>
                        </div>
                        
                        {/* Segunda linha em mobile, continuação da linha em desktop */}
                        <div className="flex flex-wrap gap-2 flex-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPagamentoModal(appointment)}
                            className={`flex items-center gap-2 flex-1 sm:flex-none ${
                              agendaPagamentos[appointment.id] && 
                              agendaPagamentos[appointment.id].length > 0 && 
                              agendaPagamentos[appointment.id].some((p: any) => p.status === 0) 
                                ? 'text-red-600 hover:text-red-700' 
                                : ''
                            }`}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span className="truncate">
                              {agendaPagamentos[appointment.id] && agendaPagamentos[appointment.id].length > 0 ? 'Editar Pagamento' : 'Adicionar Pagamento'}
                            </span>
                            {agendaPagamentos[appointment.id] && 
                             agendaPagamentos[appointment.id].length > 0 && 
                             agendaPagamentos[appointment.id].some((p: any) => p.status === 0) && (
                              <Badge variant="destructive" className="ml-1 text-xs hidden sm:inline-flex">
                                Pendente
                              </Badge>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
            <DialogDescription>
              Altere os dados da consulta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={formData.pacienteId} onValueChange={(value) => setFormData({...formData, pacienteId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {activePatients.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Input
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo da Consulta</Label>
                <Select value={formData.tipoDaConsulta} onValueChange={(value: any) => setFormData({...formData, tipoDaConsulta: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Avaliação">Avaliação</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Grupo">Grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={formData.modalidade} onValueChange={(value: any) => setFormData({...formData, modalidade: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Atendimento</Label>
              <Select value={formData.tipoAtendimento} onValueChange={(value: any) => setFormData({...formData, tipoAtendimento: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Casal">Casal</SelectItem>
                  <SelectItem value="Grupo">Grupo</SelectItem>
                  <SelectItem value="Família">Família</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status.toString()} onValueChange={(value: any) => setFormData({...formData, status: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pendente</SelectItem>
                  <SelectItem value="1">Confirmado</SelectItem>
                  <SelectItem value="2">Realizado</SelectItem>
                  <SelectItem value="3">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                value={formData.duracao}
                onChange={(e) => setFormData({...formData, duracao: parseInt(e.target.value) || 50})}
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre a consulta..."
                value={formData.observacao}
                onChange={(e) => setFormData({...formData, observacao: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditAppointment}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Criar Pagamento */}
      <Dialog open={isPagamentoModalOpen} onOpenChange={setIsPagamentoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Pagamento</DialogTitle>
            <DialogDescription>
              Crie um pagamento para esta consulta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pacote (opcional)</Label>
              <Select 
                value={pagamentoForm.pacoteId || 'avulso'} 
                onValueChange={(value) => {
                  const newPacoteId = value === 'avulso' ? null : value;
                  const selectedPacote = value !== 'avulso' ? pacotes?.find(p => p.id === value) : null;
                  setPagamentoForm({
                    ...pagamentoForm, 
                    pacoteId: newPacoteId,
                    value: selectedPacote ? Number(selectedPacote.value) : pagamentoForm.value
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pacote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avulso">Valor avulso</SelectItem>
                  {pacotes?.filter(pacote => pacote.ativo).map((pacote) => (
                    <SelectItem key={pacote.id} value={pacote.id}>
                      {pacote.title} - R$ {Number(pacote.value || 0).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={pagamentoForm.data}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={pagamentoForm.vencimento}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, vencimento: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                placeholder="R$ 0,00"
                value={formatPagamentoValue(pagamentoForm.value)}
                onChange={(e) => handlePagamentoValueChange(e.target.value)}
                disabled={pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'avulso'}
                className={pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'avulso' ? 'bg-muted cursor-not-allowed' : ''}
              />
              {pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'avulso' && (
                <p className="text-xs text-muted-foreground">
                  Valor definido automaticamente pelo pacote selecionado
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do pagamento..."
                value={pagamentoForm.descricao}
                onChange={(e) => setPagamentoForm({...pagamentoForm, descricao: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Pagamento</Label>
              <Select 
                value={pagamentoForm.type?.toString() || ''} 
                onValueChange={(value) => setPagamentoForm({...pagamentoForm, type: value ? parseInt(value) : null})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">PIX</SelectItem>
                  <SelectItem value="2">Cartão</SelectItem>
                  <SelectItem value="3">Boleto</SelectItem>
                  <SelectItem value="4">Espécie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>TXID (opcional)</Label>
              <Input
                placeholder="ID da transação..."
                value={pagamentoForm.txid}
                onChange={(e) => setPagamentoForm({...pagamentoForm, txid: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPagamentoModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePagamento}>
                Criar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Pagamento */}
      <Dialog open={isEditPagamentoModalOpen} onOpenChange={setIsEditPagamentoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
            <DialogDescription>
              Edite o pagamento desta consulta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPagamento && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Status atual:</span>
                  <Badge variant={selectedPagamento.status === 1 ? "default" : "secondary"}>
                    {getStatusLabel(selectedPagamento.status)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Tipo: {getTypeLabel(selectedPagamento.type)}</div>
                  <div>Valor: {formatPagamentoValue(selectedPagamento.value)}</div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Pacote (opcional)</Label>
              <Select 
                value={pagamentoForm.pacoteId || 'avulso'} 
                onValueChange={(value) => {
                  const newPacoteId = value === 'avulso' ? null : value;
                  const selectedPacote = value !== 'avulso' ? pacotes?.find(p => p.id === value) : null;
                  setPagamentoForm({
                    ...pagamentoForm, 
                    pacoteId: newPacoteId,
                    value: selectedPacote ? Number(selectedPacote.value) : pagamentoForm.value
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pacote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avulso">Valor avulso</SelectItem>
                  {pacotes?.filter(pacote => pacote.ativo).map((pacote) => (
                    <SelectItem key={pacote.id} value={pacote.id}>
                      {pacote.title} - R$ {Number(pacote.value || 0).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={pagamentoForm.data}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={pagamentoForm.vencimento}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, vencimento: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                placeholder="R$ 0,00"
                value={formatPagamentoValue(pagamentoForm.value)}
                onChange={(e) => handlePagamentoValueChange(e.target.value)}
                disabled={pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'avulso'}
                className={pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'avulso' ? 'bg-muted cursor-not-allowed' : ''}
              />
              {pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'avulso' && (
                <p className="text-xs text-muted-foreground">
                  Valor definido automaticamente pelo pacote selecionado
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do pagamento..."
                value={pagamentoForm.descricao}
                onChange={(e) => setPagamentoForm({...pagamentoForm, descricao: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Pagamento</Label>
              <Select 
                value={pagamentoForm.type?.toString() || ''} 
                onValueChange={(value) => setPagamentoForm({...pagamentoForm, type: value ? parseInt(value) : null})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">PIX</SelectItem>
                  <SelectItem value="2">Cartão</SelectItem>
                  <SelectItem value="3">Boleto</SelectItem>
                  <SelectItem value="4">Espécie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status do Pagamento</Label>
              <Select 
                value={pagamentoForm.status?.toString() || '0'} 
                onValueChange={(value) => setPagamentoForm({...pagamentoForm, status: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pendente</SelectItem>
                  <SelectItem value="1">Pago</SelectItem>
                  <SelectItem value="2">Confirmado</SelectItem>
                  <SelectItem value="3">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>TXID (opcional)</Label>
              <Input
                placeholder="ID da transação..."
                value={pagamentoForm.txid}
                onChange={(e) => setPagamentoForm({...pagamentoForm, txid: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="destructive" 
                onClick={handleDeletePagamento}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
              <Button variant="outline" onClick={() => setIsEditPagamentoModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePagamento}>
                Atualizar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
