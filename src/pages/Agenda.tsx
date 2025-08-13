import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, User, Plus, Edit, Trash2, RefreshCw, AlertCircle, Repeat, ChevronLeft, ChevronRight, ExternalLink, Calendar, MapPin, Clock as ClockIcon, Search, Filter, X, CreditCard, DollarSign, CheckCircle, CheckCircle2, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { useToast } from "@/hooks/use-toast";
import { useAgendaSessoes } from "@/hooks/useAgendaSessoes";
import { usePacientes } from "@/hooks/usePacientes";
import { usePacotes } from "../hooks/usePacotes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { SessionRecordModal } from "@/components/pacientes/SessionRecordModal";
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
  patientColor?: string | null;
}

interface RecurringAppointmentData {
  isRecurring: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  daysOfWeek: number[]; // Array de dias da semana (0 = Domingo, 1 = Segunda, etc.)
  quantity: number; // Quantidade de sessões por dia selecionado
  daySchedules: { [key: number]: string }; // Horários específicos para cada dia (0-6)
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
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date()); // New
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily'); // New
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null); // New
  const [isSessionRecordModalOpen, setIsSessionRecordModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null); // New
  
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
    daysOfWeek: [new Date().getDay()], // Dia atual por padrão
    quantity: 1,
    daySchedules: {} // Horários específicos para cada dia
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
          patientColor: paciente?.cor || null,
          patientAvatar: paciente?.avatar || null,
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

  // Funções para visualização semanal
  const getWeekDays = (startDate: Date) => {
    const days = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Começar no domingo
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek]);

  const getAppointmentsForWeek = () => {
    const weekAppointments: { [key: string]: any[] } = {};
    
    weekDays.forEach(day => {
      const dateStr = formatDateToYYYYMMDD(day);
      weekAppointments[dateStr] = filteredAgendaSessoes.filter(sessao => sessao.data === dateStr);
    });
    
    return weekAppointments;
  };

  const weekAppointments = useMemo(() => getAppointmentsForWeek(), [weekDays, filteredAgendaSessoes]);

  // Funções para drag and drop
  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    
    if (!draggedAppointment) return;
    
    try {
      const newDate = new Date(targetDate);
      const newData = {
        ...draggedAppointment,
        data: targetDate
      };
      
      await updateAgendaSessao(draggedAppointment.id, newData);
      
      toast({
        title: "Consulta movida",
        description: `Consulta movida para ${newDate.toLocaleDateString('pt-BR')}`,
      });
      
      setDraggedAppointment(null);
    } catch (error) {
      console.error('Erro ao mover consulta:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover consulta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
  };

  // Função para lidar com clique nos dias da semana
  const handleWeekDayClick = (day: Date) => {
    setSelectedDate(day);
    // Scroll para a seção da agenda diária
    const dailyAgendaSection = document.getElementById('daily-agenda-section');
    if (dailyAgendaSection) {
      dailyAgendaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          if (!formData.pacienteId || !formData.data) {
        toast({
          title: "Erro",
          description: "Por favor, preencha o paciente e a data.",
          variant: "destructive"
        });
        return;
      }

      // Validação específica para agendamento único
      if (!recurringData.isRecurring && !formData.horario) {
        toast({
          title: "Erro",
          description: "Por favor, preencha o horário da consulta.",
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

          if (recurringData.isRecurring && (recurringData.daysOfWeek.length === 0 || recurringData.quantity < 1)) {
      toast({
        title: "Erro",
        description: "Para agendamento recorrente, selecione os dias da semana e a quantidade de sessões por dia.",
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
      // Checar conflito de horário (mesma data e horário)
      const conflict = agendaSessoes.some(s => s.data === formData.data && s.horario === formData.horario);
      if (conflict) {
        // Sugerir próxima hora cheia
        const [h, m] = formData.horario.split(':').map(Number);
        const suggestedHour = String(((h || 0) + 1) % 24).padStart(2, '0') + ':' + String(m || 0).padStart(2, '0');
        // Tentar criar do mesmo jeito; backend agora valida e retorna erro se conflito
        // Se backend recusar, exibimos erro; usuário pode ajustar horário manualmente (valor sugerido já preenchido)
        setFormData(prev => ({ ...prev, horario: suggestedHour }));
        toast({ title: 'Horário em conflito', description: `Sugerido ${suggestedHour}. Ajuste e confirme.`, variant: 'destructive' });
        return;
      }
      if (recurringData.isRecurring) {
        // Criar múltiplas consultas recorrentes
        const startDate = new Date(formData.data + 'T00:00:00');
        const recurringAppointments = calculateRecurringDates(
          startDate,
          recurringData.frequency,
          recurringData.daysOfWeek,
          recurringData.quantity,
          recurringData.daySchedules
        );

        const promises = recurringAppointments.map(async appointment => {
          const appointmentData = {
            ...formData,
            data: formatDateToYYYYMMDD(appointment.date),
            horario: appointment.time
          };
          
          // Criar a sessão
          const session = await createAgendaSessao(appointmentData);
          
          // Criar o pagamento correspondente
          const pagamentoData = {
            pacienteId: formData.pacienteId,
            pacoteId: formData.tipoPagamento === 'pacote' ? formData.pacoteId : null,
            agendaSessaoId: session.id, // Vincular ao ID da agenda criada
            data: formatDateToYYYYMMDD(appointment.date),
            vencimento: formatDateToYYYYMMDD(appointment.date), // Vencimento no mesmo dia da consulta
            value: formData.tipoPagamento === 'pacote' 
              ? Number(pacotes?.find(p => p.id === formData.pacoteId)?.value || 0)
              : Number(formData.valorAvulso || 0),
            descricao: `Pagamento para consulta em ${appointment.date.toLocaleDateString('pt-BR')} - ${formData.tipoDaConsulta}`,
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
    } catch (error: any) {
      console.error('Erro ao criar sessão:', error);
      const apiMsg = error?.response?.data?.message || error?.message || 'Erro ao agendar sessão.';
      toast({
        title: "Erro",
        description: apiMsg,
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
      // Checar conflito ao editar
      const conflict = agendaSessoes.some(s => s.id !== editingAppointment.id && s.data === formData.data && s.horario === formData.horario);
      if (conflict) {
        const [h, m] = formData.horario.split(':').map(Number);
        const suggestedHour = String(((h || 0) + 1) % 24).padStart(2, '0') + ':' + String(m || 0).padStart(2, '0');
        const proceed = window.confirm(`Já existe uma consulta em ${formData.data} às ${formData.horario}.\n\nDeseja manter mesmo assim?\nClique em Cancelar para ajustar o horário sugerido: ${suggestedHour}.`);
        if (!proceed) {
          setFormData(prev => ({ ...prev, horario: suggestedHour }));
          return;
        }
      }
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

  const handleEditSessionRecord = (session: any) => {
    setSelectedSession(session);
    setIsSessionRecordModalOpen(true);
  };

  const handleSaveSessionRecord = async (sessionId: string, observacao: string) => {
    try {
      await updateAgendaSessao(sessionId, { observacao });
      toast({
        title: "Sucesso",
        description: "Registro da sessão atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar registro da sessão:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar registro da sessão. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
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
  const calculateRecurringDates = (startDate: Date, frequency: string, daysOfWeek: number[], quantity: number, daySchedules: { [key: number]: string }): Array<{date: Date, time: string}> => {
    const appointments: Array<{date: Date, time: string}> = [];
    
    // Para cada dia da semana selecionado
    for (const dayOfWeek of daysOfWeek) {
      const currentDate = new Date(startDate);
      
      // Encontrar o próximo dia da semana
      while (currentDate.getDay() !== dayOfWeek) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Usar horário específico do dia ou horário padrão
      const dayTime = daySchedules[dayOfWeek] || '09:00';
      
      // Criar as sessões para este dia da semana
      for (let i = 0; i < quantity; i++) {
        const newDate = new Date(currentDate);
        appointments.push({ date: newDate, time: dayTime });
        
        // Avançar para a próxima data baseada na frequência
        if (frequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (frequency === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14);
        } else if (frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
    }
    
    // Ordenar as datas
    return appointments.sort((a, b) => a.date.getTime() - b.date.getTime());
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

  // Função para formatar valor de entrada (100 -> 1,00) - VERSÃO CORRIGIDA
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return '';
    
    // Converte para centavos (100 -> 1.00)
    const cents = parseFloat(numericValue);
    const reais = cents / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(reais);
  };

  // Função para formatar valor avulso igual à página Financeiro
  const formatValorAvulso = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatCurrencyNumberBRL = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleValorAvulsoChange = (value: string) => {
    const formatted = formatValorAvulso(value);
    // Extrair o valor numérico para o estado
    const numericValue = value.replace(/\D/g, '');
    const amount = numericValue ? parseFloat(numericValue) / 100 : 0;
    
    setFormData({
      ...formData, 
      valorAvulso: amount
    });
  };

  const handlePagamentoValueChange = (value: string) => {
    const formatted = formatValorAvulso(value);
    // Extrair o valor numérico para o estado
    const numericValue = value.replace(/\D/g, '');
    const amount = numericValue ? parseFloat(numericValue) / 100 : 0;
    
    setPagamentoForm(prev => ({ ...prev, value: amount }));
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

  // Atualização rápida de status a partir do badge ao lado do nome
  const updateAppointmentStatusInline = async (appointment: any, newStatus: number) => {
    try {
      await updateAgendaSessao(appointment.id, { status: newStatus });
      toast({ title: 'Status atualizado', description: `Novo status: ${getStatusLabel(newStatus)}` });
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o status', variant: 'destructive' });
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
              daysOfWeek: [new Date().getDay()],
              quantity: 1,
              daySchedules: {}
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={!!patientsError}>
              <Plus className="w-4 h-4 mr-2" />
                              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agendar Nova Sessão</DialogTitle>
              <DialogDescription>
                                  Preencha os dados para agendar uma nova sessão
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
              {!recurringData.isRecurring && (
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
              )}
              

              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              {/* Agendamento Recorrente e Pagamento - Layout Compacto */}
              <div className="space-y-4 border-t pt-4">
                {/* Agendamento Recorrente */}
                <div className="space-y-3">
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
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      {/* Frequência */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Frequência</Label>
                        <Select 
                          value={recurringData.frequency} 
                          onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => setRecurringData({
                            ...recurringData,
                            frequency: value
                          })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Toda semana</SelectItem>
                            <SelectItem value="biweekly">A cada 15 dias</SelectItem>
                            <SelectItem value="monthly">Todo mês</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Dias da Semana</Label>
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            { value: 0, label: 'Dom', short: 'D' },
                            { value: 1, label: 'Seg', short: 'S' },
                            { value: 2, label: 'Ter', short: 'T' },
                            { value: 3, label: 'Qua', short: 'Q' },
                            { value: 4, label: 'Qui', short: 'Q' },
                            { value: 5, label: 'Sex', short: 'S' },
                            { value: 6, label: 'Sáb', short: 'S' }
                          ].map((day) => (
                            <div key={day.value} className="flex flex-col items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentDays = recurringData.daysOfWeek || [];
                                  const newDays = currentDays.includes(day.value)
                                    ? currentDays.filter(d => d !== day.value)
                                    : [...currentDays, day.value];
                                  setRecurringData({
                                    ...recurringData,
                                    daysOfWeek: newDays
                                  });
                                }}
                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                                  (recurringData.daysOfWeek || []).includes(day.value)
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                                }`}
                              >
                                {day.short}
                              </button>
                              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {day.label}
                              </span>
                            </div>
                  ))}
                        </div>
                        {(recurringData.daysOfWeek || []).length === 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Selecione pelo menos um dia da semana
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Quantidade de Sessões</Label>
                          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            Criar automaticamente
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="52"
                            value={recurringData.quantity}
                            onChange={(e) => setRecurringData({
                              ...recurringData,
                              quantity: parseFloat(e.target.value) || 1
                            })}
                            placeholder="Ex: 10"
                            className="h-9 flex-1"
                          />
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {recurringData.quantity > 0 && (recurringData.daysOfWeek || []).length > 0 && (
                              <span>
                                = {recurringData.quantity * (recurringData.daysOfWeek || []).length} agendamentos
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Serão criados automaticamente {recurringData.quantity} sessões para cada dia selecionado
                        </p>
                      </div>

                      {/* Horários Específicos por Dia */}
                      {(recurringData.daysOfWeek || []).length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Horários por Dia</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(recurringData.daysOfWeek || []).map((dayValue) => {
                              const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                              const dayName = dayNames[dayValue];
                              const currentTime = recurringData.daySchedules[dayValue] || formData.horario || '09:00';
                              
                              return (
                                <div key={dayValue} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {dayName}
                                    </span>
                                  </div>
                                  <Input
                                    type="time"
                                    value={currentTime}
                                    onChange={(e) => setRecurringData({
                                      ...recurringData,
                                      daySchedules: {
                                        ...recurringData.daySchedules,
                                        [dayValue]: e.target.value
                                      }
                                    })}
                                    className="w-24 h-9 text-sm"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Seção de Pagamento - Design Moderno */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Forma de Pagamento
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Opção Valor Avulso */}
                    <div 
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.tipoPagamento === 'avulso' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setFormData({
                        ...formData, 
                        tipoPagamento: 'avulso',
                        pacoteId: null
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.tipoPagamento === 'avulso' 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {formData.tipoPagamento === 'avulso' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">Valor Avulso</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Definir valor individual</p>
                        </div>
                      </div>
                      
                                              {formData.tipoPagamento === 'avulso' && (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                            <Input
                              type="text"
                              placeholder="R$ 0,00"
                              value={formData.valorAvulso ? formatValorAvulso(String(Math.round(formData.valorAvulso * 100))) : ''}
                              onChange={(e) => handleValorAvulsoChange(e.target.value)}
                              className="h-9 text-sm border-green-300 focus:border-green-500 focus:ring-blue-500"
                            />
                          </div>
                        )}
                    </div>

                    {/* Opção Pacote */}
                    <div 
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.tipoPagamento === 'pacote' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setFormData({
                        ...formData, 
                        tipoPagamento: 'pacote',
                        valorAvulso: 0
                      })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.tipoPagamento === 'pacote' 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {formData.tipoPagamento === 'pacote' && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-sm">Pacote</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Usar pacote existente</p>
                        </div>
                      </div>
                      
                      {formData.tipoPagamento === 'pacote' && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                          {pacotesLoading ? (
                            <div className="h-9 w-full bg-muted animate-pulse rounded" />
                          ) : pacotes?.filter(pacote => pacote.ativo).length === 0 ? (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                  Nenhum pacote ativo
                                </span>
                              </div>
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                Crie pacotes no Financeiro
                              </p>
                            </div>
                          ) : (
                            <Select 
                              value={formData.pacoteId || ''} 
                              onValueChange={(value) => setFormData({...formData, pacoteId: value})}
                            >
                              <SelectTrigger className="h-9 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Escolher pacote" />
                              </SelectTrigger>
                              <SelectContent>
                                {pacotes?.filter(pacote => pacote.ativo).map((pacote) => (
                                  <SelectItem key={pacote.id} value={pacote.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{pacote.title}</span>
                                      <span className="text-green-600 font-medium">
                                        R$ {Number(pacote.value || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
      <Card id="daily-agenda-section" className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
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
                        <div className="flex items-center justify-center gap-1">
                          {/* Compactar em uma "pílula" com contagem para não quebrar layout */}
                          <div className="px-1.5 py-0.5 rounded-full bg-muted/60 dark:bg-muted/30 border text-[10px] leading-none flex items-center gap-1">
                            {/* Até 2 bolinhas para amostra e depois contador */}
                            {appointments.slice(0, 2).map((appointment, apptIndex) => (
                              <span
                                key={apptIndex}
                                className={`inline-block w-1.5 h-1.5 rounded-full
                                  ${appointment.status === 2 ? 'bg-green-500' : ''}
                                  ${appointment.status === 3 ? 'bg-red-500' : ''}
                                  ${appointment.status === 1 ? 'bg-blue-500' : ''}
                                  ${appointment.status === 0 ? 'bg-yellow-500' : ''}
                                `}
                              />
                            ))}
                            <span className="text-muted-foreground">{appointments.length}</span>
                          </div>
                        </div>
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
                    : 'Este dia está livre. Clique em "Nova Sessão" para agendar.'
                  }
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Sessão
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
                          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/20">
                            <AvatarImage 
                              src={getAvatarUrl(appointment.patientAvatar)} 
                              className="object-cover"
                              alt={`Avatar de ${appointment.patientName}`}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                              <User className="w-5 h-5 sm:w-7 sm:h-7" />
                            </AvatarFallback>
                          </Avatar>
                          {/* Indicador de modalidade */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
                            <span className="text-xs">{getModalityIcon(appointment.modalidade)}</span>
                          </div>
                        </div>

                        {/* Informações principais */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg truncate flex items-center gap-2">
                              {appointment.patientColor && (
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: appointment.patientColor }}
                                  title={`Cor: ${appointment.patientColor}`}
                                />
                              )}
                              <span>{appointment.patientName}</span>
                            </h3>
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div className="cursor-pointer">
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => updateAppointmentStatusInline(appointment, 0)}>Pendente</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateAppointmentStatusInline(appointment, 1)}>Confirmado</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateAppointmentStatusInline(appointment, 2)}>Realizado</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateAppointmentStatusInline(appointment, 3)}>Cancelado</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {agendaPagamentos[appointment.id] && agendaPagamentos[appointment.id].length > 0 && (
                                <span>{getPagamentoStatusIcon(agendaPagamentos[appointment.id])}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Horário */}
                          <div className="flex flex-wrap items-center gap-4 mb-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ClockIcon className="w-4 h-4" />
                              <span>{appointment.horario}</span>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSessionRecord(appointment)}
                            className="flex items-center gap-2 flex-1 sm:flex-none"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Registro de Sessão</span>
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
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
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
                value={pagamentoForm.value ? formatValorAvulso((pagamentoForm.value * 100).toString()) : ''}
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
            {/* Descrição removida para simplificar o formulário */}
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
            {/* TXID removido para simplificar o formulário */}
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
            {/* Bloco de status atual removido para simplificar */}
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
                value={pagamentoForm.value ? formatValorAvulso((pagamentoForm.value * 100).toString()) : ''}
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
            {/* Descrição removida para simplificar */}
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
            {/* Campo de status removido para simplificar */}
            {/* TXID removido para simplificar */}
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

      {/* Visualização Semanal */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agenda Semanal
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newWeek = new Date(currentWeek);
                  newWeek.setDate(newWeek.getDate() - 7);
                  setCurrentWeek(newWeek);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newWeek = new Date(currentWeek);
                  newWeek.setDate(newWeek.getDate() + 7);
                  setCurrentWeek(newWeek);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Badge variant="secondary">
                {formatWeekRange()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dateStr = formatDateToYYYYMMDD(day);
                const dayAppointments = weekAppointments[dateStr] || [];
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[120px] p-2 border rounded-lg transition-colors cursor-pointer",
                      isToday && "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
                      isSelected && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
                      dragOverDate === dateStr && "bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700",
                      "hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleWeekDayClick(day)}
                    onDragOver={(e) => handleDragOver(e, dateStr)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className={cn(
                        "text-sm font-medium",
                        isToday && "text-blue-600 dark:text-blue-400",
                        isSelected && "text-green-600 dark:text-green-400"
                      )}>
                        {day.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {dayAppointments.map((appointment) => {
                        const paciente = pacientes.find(p => p.id === appointment.pacienteId);
                        const pagamentos = agendaPagamentos[appointment.id] || [];
                        
                        return (
                          <Tooltip key={appointment.id}>
                            <TooltipTrigger asChild>
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, appointment)}
                                className={cn(
                                  "p-1 text-xs rounded cursor-move transition-colors",
                                  "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700",
                                  "hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {appointment.horario}
                                  </span>
                                  {getPagamentoStatusIcon(pagamentos)}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                                  {paciente?.cor && (
                                    <div 
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: paciente.cor }}
                                      title={`Cor: ${paciente.cor}`}
                                    />
                                  )}
                                  <span>{paciente?.nome || 'Paciente não encontrado'}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div><strong>Paciente:</strong> {paciente?.nome || 'Não encontrado'}</div>
                                <div><strong>Horário:</strong> {appointment.horario}</div>
                                <div><strong>Tipo:</strong> {appointment.tipoDaConsulta}</div>
                                <div><strong>Modalidade:</strong> {appointment.modalidade}</div>
                                <div><strong>Status:</strong> {getStatusLabel(appointment.status)}</div>
                                {appointment.observacao && (
                                  <div><strong>Observação:</strong> {appointment.observacao}</div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span><strong>Total da semana:</strong> {Object.values(weekAppointments).flat().length} consultas</span>
                <span><strong>Confirmadas:</strong> {Object.values(weekAppointments).flat().filter(a => a.status === 1).length}</span>
                <span><strong>Pendentes:</strong> {Object.values(weekAppointments).flat().filter(a => a.status === 0).length}</span>
                <span><strong>Realizadas:</strong> {Object.values(weekAppointments).flat().filter(a => a.status === 2).length}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 Arraste as consultas para mover entre dias
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Record Modal */}
      <SessionRecordModal
        session={selectedSession}
        open={isSessionRecordModalOpen}
        onOpenChange={setIsSessionRecordModalOpen}
        onSave={handleSaveSessionRecord}
      />
    </div>
  );
}
