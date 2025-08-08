import { useState, useEffect, useMemo } from "react";
import { DollarSign, Plus, TrendingUp, Calendar, Download, User, CreditCard, CalendarIcon, Package, Edit, Trash2, Power, PowerOff, RefreshCw, ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { usePatients } from "@/hooks/usePatients";
import { usePacotes } from "../hooks/usePacotes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFinancialVisibility } from "@/contexts/FinancialVisibilityContext";

// Dados financeiros serão carregados do contexto global

export default function Financeiro() {
  const { patients } = usePatients();
  const { pacotes, loading: pacotesLoading, fetchPacotes, createPacote, updatePacote, deletePacote, activatePacote, deactivatePacote } = usePacotes();
  const { pagamentos, loading: pagamentosLoading, fetchPagamentos, createPagamento, updatePagamento, deletePagamento, updatePagamentoStatus } = usePagamentos();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [filteredPagamentos, setFilteredPagamentos] = useState<any[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const { toast } = useToast();
  const { isFinancialVisible } = useFinancialVisibility();

  // Função para formatar data sem problemas de timezone
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para aplicar filtro por período
  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione as datas inicial e final.",
        variant: "destructive",
      });
      return;
    }

    const filtered = (pagamentos || []).filter(pagamento => {
      const paymentDate = new Date(pagamento.data);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    setFilteredPagamentos(filtered);
    setIsFiltered(true);
    setCurrentPage(1); // Resetar para primeira página
    
    toast({
      title: "Filtro Aplicado",
      description: `${filtered.length} pagamentos encontrados no período selecionado.`,
    });
  };

  // Função para limpar filtro
  const clearDateFilter = () => {
    setFilteredPagamentos([]);
    setIsFiltered(false);
    setCurrentPage(1); // Resetar para primeira página
    
    toast({
      title: "Filtro Limpo",
      description: "Exibindo todos os pagamentos.",
    });
  };

  // Dados a serem exibidos (filtrados ou todos) - ordenados por vencimento mais recente
  const { sortedPagamentos, totalPages, startIndex, endIndex, displayPagamentos } = useMemo(() => {
    const dataToSort = isFiltered ? filteredPagamentos : (pagamentos || []);
    
    const sorted = dataToSort.sort((a, b) => {
      const dateA = new Date(a.vencimento || a.data);
      const dateB = new Date(b.vencimento || b.data);
      return dateB.getTime() - dateA.getTime(); // Ordem decrescente (mais recente primeiro)
    });

    const total = Math.ceil(sorted.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const display = sorted.slice(start, end);

    return {
      sortedPagamentos: sorted,
      totalPages: total,
      startIndex: start,
      endIndex: end,
      displayPagamentos: display
    };
  }, [isFiltered, filteredPagamentos, pagamentos, currentPage, itemsPerPage]);

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Estados para o combobox de pacientes
  const [patientComboOpen, setPatientComboOpen] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  
  // Calcular estatísticas baseadas nos dados reais
  const calculateStats = () => {
    if (!pagamentos || pagamentos.length === 0) {
      return {
        totalReceived: 0,
        totalPending: 0,
        sessionsThisMonth: 0,
        averageValue: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar pagamentos do mês atual
    const currentMonthPayments = (pagamentos || []).filter(pagamento => {
      const paymentDate = new Date(pagamento.data);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    // Calcular totais
    const totalReceived = currentMonthPayments
      .filter(p => p.status === 1 || p.status === 2) // Pago ou Confirmado
      .reduce((sum, p) => sum + Number(p.value || 0), 0);

    const totalPending = currentMonthPayments
      .filter(p => p.status === 0) // Pendente
      .reduce((sum, p) => sum + Number(p.value || 0), 0);

    const sessionsThisMonth = currentMonthPayments.length;

    const averageValue = sessionsThisMonth > 0 ? 
      currentMonthPayments.reduce((sum, p) => sum + Number(p.value || 0), 0) / sessionsThisMonth : 0;

    return {
      totalReceived,
      totalPending,
      sessionsThisMonth,
      averageValue
    };
  };

  const monthlyStats = calculateStats();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Estados para pacotes
  const [isPacoteModalOpen, setIsPacoteModalOpen] = useState(false);
  const [isEditPacoteModalOpen, setIsEditPacoteModalOpen] = useState(false);
  const [selectedPacote, setSelectedPacote] = useState<any>(null);
  const [pacoteForm, setPacoteForm] = useState({
    title: '',
    value: '',
    descricao: '',
    ativo: true
  });

  // Estados para pagamentos
  const [isEditPagamentoModalOpen, setIsEditPagamentoModalOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);
  
  // Estado para controlar expansão do gráfico
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const [pagamentoForm, setPagamentoForm] = useState({
    pacienteId: '',
    pacoteId: '',
    data: formatDateToYYYYMMDD(new Date()),
    vencimento: formatDateToYYYYMMDD(new Date()),
    value: '',
    descricao: '',
    type: null,
    txid: '',
    fiscalIssued: false
  });

  const [newPaymentForm, setNewPaymentForm] = useState({
    patient: "",
    value: "",
    method: "",
    session: "",
    date: formatDateToYYYYMMDD(new Date())
  });

  // Controle local: nota fiscal/recibo emitido por pagamento
  const [fiscalIssuedMap, setFiscalIssuedMap] = useState<Record<string, { recibo: boolean; notaFiscal: boolean }>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pagamentos_fiscal_issued') || '{}');
      // Garante chaves existentes
      const map: Record<string, { recibo: boolean; notaFiscal: boolean }> = { ...stored };
      (pagamentos || []).forEach(p => {
        if (map[p.id] === undefined) map[p.id] = { recibo: false, notaFiscal: false };
        // Migração de formato antigo (boolean) para novo (objeto)
        if (typeof map[p.id] === 'boolean') {
          map[p.id] = { recibo: map[p.id] as boolean, notaFiscal: false };
        }
      });
      setFiscalIssuedMap(map);
      localStorage.setItem('pagamentos_fiscal_issued', JSON.stringify(map));
    } catch {
      setFiscalIssuedMap({});
    }
  }, [pagamentos]);

  const isReciboIssued = (id: string) => !!fiscalIssuedMap[id]?.recibo;
  const isNotaFiscalIssued = (id: string) => !!fiscalIssuedMap[id]?.notaFiscal;

  const handleToggleRecibo = (id: string, value: boolean) => {
    setFiscalIssuedMap(prev => {
      const next = { 
        ...prev, 
        [id]: { 
          ...(prev[id] || { recibo: false, notaFiscal: false }), 
          recibo: value 
        } 
      };
      try { localStorage.setItem('pagamentos_fiscal_issued', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleToggleNotaFiscal = (id: string, value: boolean) => {
    setFiscalIssuedMap(prev => {
      const next = { 
        ...prev, 
        [id]: { 
          ...(prev[id] || { recibo: false, notaFiscal: false }), 
          notaFiscal: value 
        } 
      };
      try { localStorage.setItem('pagamentos_fiscal_issued', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const [quickPaymentForm, setQuickPaymentForm] = useState({
    patient: "",
    value: "",
    method: "",
    date: formatDateToYYYYMMDD(new Date())
  });

  // Carregar pagamentos ao montar o componente (pacotes são carregados automaticamente pelo hook)
  useEffect(() => {
    fetchPagamentos();
  }, [fetchPagamentos]);

  // Função para recarregar pacotes manualmente
  const handleReloadPacotes = () => {
    fetchPacotes();
  };

  const handleExportCSV = () => {
    toast({
      title: "Exportando dados",
      description: "O arquivo CSV será baixado em breve."
    });
  };

  const handleRegisterPayment = () => {
    if (!newPaymentForm.patient || !newPaymentForm.value || !newPaymentForm.method) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Pagamento registrado!",
      description: `Pagamento de R$ ${newPaymentForm.value} registrado para ${newPaymentForm.patient}.`
    });
    setIsPaymentModalOpen(false);
    setNewPaymentForm({ patient: "", value: "", method: "", session: "", date: formatDateToYYYYMMDD(new Date()) });
  };

  const handleQuickPayment = async () => {
    if (!quickPaymentForm.patient || !quickPaymentForm.value || !quickPaymentForm.method) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Encontrar o paciente pelo nome
    const selectedPatient = patients.find(p => p.name === quickPaymentForm.patient);
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Paciente não encontrado.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Converter método para o formato numérico
      const typeMapping: { [key: string]: number } = {
        'PIX': 1,
        'Cartão': 2,
        'Boleto': 3,
        'Dinheiro': 4
      };

      await createPagamento({
        pacienteId: selectedPatient.id,
        pacoteId: null,
        data: quickPaymentForm.date,
        vencimento: quickPaymentForm.date,
        value: Number(quickPaymentForm.value.replace(/\D/g, '')) / 100,
        descricao: `Pagamento rápido via ${quickPaymentForm.method}`,
        type: typeMapping[quickPaymentForm.method] || null,
        txid: undefined
      });

      toast({
        title: "Pagamento registrado!",
        description: `Pagamento rápido de R$ ${quickPaymentForm.value} registrado para ${quickPaymentForm.patient}.`
      });
      
      setQuickPaymentForm({ patient: "", value: "", method: "", date: formatDateToYYYYMMDD(new Date()) });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleMarkAsPaid = (payment: any) => {
    toast({
      title: "Status atualizado",
      description: `Pagamento de ${payment.patient} marcado como pago.`
    });
  };

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setNewPaymentForm({
      patient: payment.patient,
      value: payment.value.toString(),
      method: payment.method,
      session: payment.session.toString(),
      date: payment.date
    });
    setIsEditPaymentModalOpen(true);
  };

  const handleSaveEditPayment = () => {
    if (!newPaymentForm.patient || !newPaymentForm.value || !newPaymentForm.method) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Pagamento atualizado!",
      description: `Dados do pagamento de ${newPaymentForm.patient} foram atualizados.`
    });
    setIsEditPaymentModalOpen(false);
    setNewPaymentForm({ patient: "", value: "", method: "", session: "", date: formatDateToYYYYMMDD(new Date()) });
    setSelectedPayment(null);
  };

  // Função para formatar valor como moeda
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se não há números, retorna vazio
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para ter os centavos
    const amount = parseFloat(numbers) / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Função para tratar mudança no valor
  const handleValueChange = (value: string) => {
    const formatted = formatCurrency(value);
    setQuickPaymentForm({...quickPaymentForm, value: formatted});
  };

  // Funções para gerenciar pacotes
  const handleCreatePacote = async () => {
    if (!pacoteForm.title || !pacoteForm.value) {
      toast({
        title: "Erro",
        description: "Preencha o título e valor do pacote.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPacote({
        title: pacoteForm.title,
        value: parseFloat(pacoteForm.value.replace(/[^\d,]/g, '').replace(',', '.')),
        descricao: pacoteForm.descricao || undefined,
        ativo: pacoteForm.ativo
      });
      
      setIsPacoteModalOpen(false);
      setPacoteForm({ title: '', value: '', descricao: '', ativo: true });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEditPacote = (pacote: any) => {
    setSelectedPacote(pacote);
    setPacoteForm({
      title: pacote.title,
      value: pacote.value.toString(),
      descricao: pacote.descricao || '',
      ativo: pacote.ativo
    });
    setIsEditPacoteModalOpen(true);
  };

  const handleSaveEditPacote = async () => {
    if (!pacoteForm.title || !pacoteForm.value) {
      toast({
        title: "Erro",
        description: "Preencha o título e valor do pacote.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updatePacote(selectedPacote.id, {
        title: pacoteForm.title,
        value: parseFloat(pacoteForm.value.replace(/[^\d,]/g, '').replace(',', '.')),
        descricao: pacoteForm.descricao || undefined,
        ativo: pacoteForm.ativo
      });
      
      setIsEditPacoteModalOpen(false);
      setPacoteForm({ title: '', value: '', descricao: '', ativo: true });
      setSelectedPacote(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDeletePacote = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pacote?')) {
      try {
        await deletePacote(id);
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  const handleTogglePacoteStatus = async (pacote: any) => {
    try {
      if (pacote.ativo) {
        await deactivatePacote(pacote.id);
      } else {
        await activatePacote(pacote.id);
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Função para formatar valor do pacote
  const formatPacoteValue = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePacoteValueChange = (value: string) => {
    const formatted = formatPacoteValue(value);
    setPacoteForm({...pacoteForm, value: formatted});
  };

  // Funções para gerenciar pagamentos
  const handleCreatePagamento = async () => {
    if (!pagamentoForm.pacienteId || !pagamentoForm.value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const created = await createPagamento({
        pacienteId: pagamentoForm.pacienteId,
        pacoteId: pagamentoForm.pacoteId || null,
        data: pagamentoForm.data,
        vencimento: pagamentoForm.vencimento,
        value: Number(pagamentoForm.value.replace(/\D/g, '')) / 100,
        descricao: pagamentoForm.descricao || undefined,
        type: pagamentoForm.type || undefined,
        txid: pagamentoForm.txid || undefined
      });

      // Persistir controle local (se houver ID retornado)
      try {
        const mapKey = 'pagamentos_fiscal_issued';
        const currentMap = JSON.parse(localStorage.getItem(mapKey) || '{}');
        const createdId = (created && (created.id || created?.data?.id)) || null;
        if (createdId) {
          currentMap[createdId] = !!pagamentoForm.fiscalIssued;
          localStorage.setItem(mapKey, JSON.stringify(currentMap));
        }
      } catch {}

      setIsPaymentModalOpen(false);
      setPagamentoForm({
        pacienteId: '',
        pacoteId: '',
        data: formatDateToYYYYMMDD(new Date()),
        vencimento: formatDateToYYYYMMDD(new Date()),
        value: '',
        descricao: '',
        type: null,
        txid: '',
        fiscalIssued: false
      });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEditPagamento = (pagamento: any) => {
    setSelectedPagamento(pagamento);
    // Ler controle local de fiscalIssued
    let fiscalIssuedLocal = false;
    try {
      const map = JSON.parse(localStorage.getItem('pagamentos_fiscal_issued') || '{}');
      fiscalIssuedLocal = !!map[pagamento.id];
    } catch {}
    setPagamentoForm({
      pacienteId: pagamento.pacienteId,
      pacoteId: pagamento.pacoteId || '',
      data: pagamento.data ? new Date(pagamento.data + 'T00:00:00').toISOString().split('T')[0] : formatDateToYYYYMMDD(new Date()),
      vencimento: pagamento.vencimento ? new Date(pagamento.vencimento + 'T00:00:00').toISOString().split('T')[0] : formatDateToYYYYMMDD(new Date()),
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(pagamento.value),
      descricao: pagamento.descricao || '',
      type: pagamento.type || null,
      txid: pagamento.txid || '',
      fiscalIssued: fiscalIssuedLocal
    });
    setIsEditPagamentoModalOpen(true);
  };

  const handleSaveEditPagamento = async () => {
    if (!selectedPagamento || !pagamentoForm.pacienteId || !pagamentoForm.value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updatePagamento(selectedPagamento.id, {
        pacienteId: pagamentoForm.pacienteId,
        pacoteId: pagamentoForm.pacoteId || null,
        data: pagamentoForm.data,
        vencimento: pagamentoForm.vencimento,
        value: Number(pagamentoForm.value.replace(/\D/g, '')) / 100,
        descricao: pagamentoForm.descricao || undefined,
        type: pagamentoForm.type || undefined,
        txid: pagamentoForm.txid || undefined
      });

      // Persistir controle local do fiscalIssued
      try {
        const mapKey = 'pagamentos_fiscal_issued';
        const currentMap = JSON.parse(localStorage.getItem(mapKey) || '{}');
        if (selectedPagamento?.id) {
          currentMap[selectedPagamento.id] = !!pagamentoForm.fiscalIssued;
          localStorage.setItem(mapKey, JSON.stringify(currentMap));
        }
      } catch {}

      setIsEditPagamentoModalOpen(false);
      setSelectedPagamento(null);
      setPagamentoForm({
        pacienteId: '',
        pacoteId: '',
        data: formatDateToYYYYMMDD(new Date()),
        vencimento: formatDateToYYYYMMDD(new Date()),
        value: '',
        descricao: '',
        type: null,
        txid: '',
        fiscalIssued: false
      });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDeletePagamento = async (id: string) => {
    try {
      await deletePagamento(id);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleUpdatePagamentoStatus = async (id: string, status: number) => {
    try {
      await updatePagamentoStatus(id, status);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const formatPagamentoValue = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePagamentoValueChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) {
      setPagamentoForm({...pagamentoForm, value: 0});
      return;
    }
    
    const amount = parseFloat(numbers) / 100;
    setPagamentoForm({...pagamentoForm, value: amount});
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return { label: 'Pendente', variant: 'secondary' as const };
      case 1: return { label: 'Pago', variant: 'default' as const };
      case 2: return { label: 'Confirmado', variant: 'default' as const };
      case 3: return { label: 'Cancelado', variant: 'destructive' as const };
      default: return { label: 'Desconhecido', variant: 'secondary' as const };
    }
  };

  const getTypeLabel = (type: number | null) => {
    switch (type) {
      case 1: return 'PIX';
      case 2: return 'Cartão';
      case 3: return 'Boleto';
      case 4: return 'Dinheiro';
      default: return 'Não informado';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
            {isFiltered && (
              <Badge variant="secondary" className="text-xs">
                <Filter className="w-3 h-3 mr-1" />
                Filtrado
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isFiltered 
              ? `Exibindo ${displayPagamentos.length} pagamentos do período selecionado`
              : "Controle seus ganhos e pagamentos"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                <DialogDescription>Adicione um novo pagamento ao sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paciente *</Label>
                    <Select value={newPaymentForm.patient} onValueChange={(value) => setNewPaymentForm({...newPaymentForm, patient: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.name}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <Input
                      placeholder="180.00"
                      value={newPaymentForm.value}
                      onChange={(e) => setNewPaymentForm({...newPaymentForm, value: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Método de Pagamento *</Label>
                    <Select value={newPaymentForm.method} onValueChange={(value) => setNewPaymentForm({...newPaymentForm, method: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newPaymentForm.date}
                      onChange={(e) => setNewPaymentForm({...newPaymentForm, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número da Sessão</Label>
                  <Input
                    placeholder="Ex: 8"
                    value={newPaymentForm.session}
                    onChange={(e) => setNewPaymentForm({...newPaymentForm, session: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleRegisterPayment}>
                    Registrar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal de Edição de Pagamento */}
          <Dialog open={isEditPaymentModalOpen} onOpenChange={setIsEditPaymentModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Pagamento</DialogTitle>
                <DialogDescription>Editar dados do pagamento de {selectedPayment?.patient}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paciente *</Label>
                    <Select value={newPaymentForm.patient} onValueChange={(value) => setNewPaymentForm({...newPaymentForm, patient: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maria Silva">Maria Silva</SelectItem>
                        <SelectItem value="João Santos">João Santos</SelectItem>
                        <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <Input
                      placeholder="180.00"
                      value={newPaymentForm.value}
                      onChange={(e) => setNewPaymentForm({...newPaymentForm, value: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Método de Pagamento *</Label>
                    <Select value={newPaymentForm.method} onValueChange={(value) => setNewPaymentForm({...newPaymentForm, method: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newPaymentForm.date}
                      onChange={(e) => setNewPaymentForm({...newPaymentForm, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número da Sessão</Label>
                  <Input
                    placeholder="Ex: 8"
                    value={newPaymentForm.session}
                    onChange={(e) => setNewPaymentForm({...newPaymentForm, session: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditPaymentModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEditPayment}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtro por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {/* Período Único */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Período</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-10",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className={cn("rounded-md border w-full pointer-events-auto")}
                      classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg",
                        day_today: "bg-accent text-accent-foreground rounded-lg",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                        day: "h-9 w-9 text-center text-sm p-0 relative hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200",
                        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="text-muted-foreground self-center">até</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-10",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      className={cn("rounded-md border w-full pointer-events-auto")}
                      classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg",
                        day_today: "bg-accent text-accent-foreground rounded-lg",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                        day: "h-9 w-9 text-center text-sm p-0 relative hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200",
                        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ações</Label>
              <div className="flex gap-2">
                <Button
                  onClick={applyDateFilter}
                  disabled={!startDate || !endDate}
                  className="flex-1"
                  size="sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
                {isFiltered && (
                  <Button
                    variant="outline"
                    onClick={clearDateFilter}
                    className="flex-1"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Período Selecionado Info */}
          {startDate && endDate && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Período: {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} dias
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Gráfico Animado */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="h-6 w-6" />
                Resumo Visual - Período Selecionado
              </CardTitle>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Análise gráfica dos seus dados financeiros
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGraphExpanded(!isGraphExpanded)}
              className="gap-2"
            >
              {isGraphExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expandir
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isGraphExpanded && (
          <CardContent className="space-y-6">
            {/* Gráfico de Barras Animado - Status dos Pagamentos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Status dos Pagamentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pendentes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pendentes</span>
                  <span className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                    {displayPagamentos.filter(p => p.status === 0).length}
                  </span>
                </div>
                <div className="w-full bg-yellow-100 dark:bg-yellow-900 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-1000 ease-out animate-pulse"
                    style={{
                      width: `${displayPagamentos.length > 0 ? (displayPagamentos.filter(p => p.status === 0).length / displayPagamentos.length) * 100 : 0}%`,
                      animationDelay: '0.1s'
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  {isFinancialVisible 
                    ? `R$ ${displayPagamentos.filter(p => p.status === 0).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : "••••••••"
                  }
                </div>
              </div>

              {/* Pagos (inclui status 1 e 2) */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Pagos</span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-200">
                    {displayPagamentos.filter(p => p.status === 1 || p.status === 2).length}
                  </span>
                </div>
                <div className="w-full bg-green-100 dark:bg-green-900 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${displayPagamentos.length > 0 ? (displayPagamentos.filter(p => p.status === 1 || p.status === 2).length / displayPagamentos.length) * 100 : 0}%`,
                      animationDelay: '0.2s'
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  {isFinancialVisible 
                    ? `R$ ${displayPagamentos.filter(p => p.status === 1 || p.status === 2).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : "••••••••"
                  }
                </div>
              </div>

              {/* Cancelados */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Cancelados</span>
                  <span className="text-lg font-bold text-red-800 dark:text-red-200">
                    {displayPagamentos.filter(p => p.status === 3).length}
                  </span>
                </div>
                <div className="w-full bg-red-100 dark:bg-red-900 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${displayPagamentos.length > 0 ? (displayPagamentos.filter(p => p.status === 3).length / displayPagamentos.length) * 100 : 0}%`,
                      animationDelay: '0.3s'
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {isFinancialVisible 
                    ? `R$ ${displayPagamentos.filter(p => p.status === 3).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : "••••••••"
                  }
                </div>
              </div>
            </div>
          </div>

            {/* Gráfico Circular Animado - Tipos de Pagamento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Tipos de Pagamento</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico Circular com CSS */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Background circle */}
                  <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  
                  {/* Animated segments */}
                  {(() => {
                    // Filtrar apenas pagamentos pagos/confirmados para o gráfico de tipos
                    const paidPayments = displayPagamentos.filter(p => p.status === 1 || p.status === 2);
                    const totalPayments = paidPayments.length;
                    const pixCount = paidPayments.filter(p => p.type === 1).length;
                    const cardCount = paidPayments.filter(p => p.type === 2).length;
                    const boletoCount = paidPayments.filter(p => p.type === 3).length;
                    const dinheiroCount = paidPayments.filter(p => p.type === 4).length;
                    
                    const pixPercent = totalPayments > 0 ? (pixCount / totalPayments) * 100 : 0;
                    const cardPercent = totalPayments > 0 ? (cardCount / totalPayments) * 100 : 0;
                    const boletoPercent = totalPayments > 0 ? (boletoCount / totalPayments) * 100 : 0;
                    const dinheiroPercent = totalPayments > 0 ? (dinheiroCount / totalPayments) * 100 : 0;
                    
                    return (
                      <>
                        {/* PIX */}
                        <div 
                          className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            background: `conic-gradient(from 0deg, #10b981 0%, #10b981 ${pixPercent}%, transparent ${pixPercent}%, transparent 100%)`,
                            transform: 'rotate(-90deg)',
                            animationDelay: '0.5s'
                          }}
                        ></div>
                        
                        {/* Cartão */}
                        <div 
                          className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            background: `conic-gradient(from ${pixPercent * 3.6}deg, #3b82f6 0%, #3b82f6 ${cardPercent}%, transparent ${cardPercent}%, transparent 100%)`,
                            transform: 'rotate(-90deg)',
                            animationDelay: '0.7s'
                          }}
                        ></div>
                        
                        {/* Boleto */}
                        <div 
                          className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            background: `conic-gradient(from ${(pixPercent + cardPercent) * 3.6}deg, #f59e0b 0%, #f59e0b ${boletoPercent}%, transparent ${boletoPercent}%, transparent 100%)`,
                            transform: 'rotate(-90deg)',
                            animationDelay: '0.9s'
                          }}
                        ></div>
                        
                        {/* Dinheiro */}
                        <div 
                          className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            background: `conic-gradient(from ${(pixPercent + cardPercent + boletoPercent) * 3.6}deg, #8b5cf6 0%, #8b5cf6 ${dinheiroPercent}%, transparent ${dinheiroPercent}%, transparent 100%)`,
                            transform: 'rotate(-90deg)',
                            animationDelay: '1.1s'
                          }}
                        ></div>
                        
                        {/* Center circle */}
                        <div className="absolute inset-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPayments}</div>
                            <div className="text-xs text-gray-700 dark:text-white">Pagos</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Legenda */}
              <div className="space-y-3">
                {(() => {
                  // Filtrar apenas pagamentos pagos/confirmados para a legenda
                  const paidPayments = pagamentos.filter(p => p.status === 1 || p.status === 2);
                  
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-white">PIX</span>
                            <span className="text-sm font-bold text-green-600 dark:text-white">{paidPayments.filter(p => p.type === 1).length}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            {isFinancialVisible 
                              ? `R$ ${paidPayments.filter(p => p.type === 1).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                              : "••••••••"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-white">Cartão</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-white">{paidPayments.filter(p => p.type === 2).length}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            {isFinancialVisible 
                              ? `R$ ${paidPayments.filter(p => p.type === 2).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                              : "••••••••"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-white">Boleto</span>
                            <span className="text-sm font-bold text-yellow-600 dark:text-white">{paidPayments.filter(p => p.type === 3).length}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            {isFinancialVisible 
                              ? `R$ ${paidPayments.filter(p => p.type === 3).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                              : "••••••••"
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-white">Dinheiro</span>
                            <span className="text-sm font-bold text-purple-600 dark:text-white">{paidPayments.filter(p => p.type === 4).length}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-white">
                            {isFinancialVisible 
                              ? `R$ ${paidPayments.filter(p => p.type === 4).reduce((sum, p) => sum + Number(p.value || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                              : "••••••••"
                            }
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

            {/* Evolução Temporal Animada - Gráfico de Linha */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Evolução dos Pagamentos</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              {(() => {
                // Agrupar pagamentos por semana dos últimos 4 semanas
                const weeks = [];
                
                for (let i = 3; i >= 0; i--) {
                  const weekStart = new Date();
                  weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
                  const weekEnd = new Date();
                  weekEnd.setDate(weekEnd.getDate() - i * 7);
                  
                  const weekPayments = pagamentos.filter(p => {
                    const paymentDate = new Date(p.data);
                    return paymentDate >= weekStart && paymentDate < weekEnd;
                  });
                  
                  weeks.push({
                    label: `S${4-i}`,
                    value: weekPayments.reduce((sum, p) => sum + Number(p.value || 0), 0),
                    count: weekPayments.length,
                    date: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`
                  });
                }
                
                const maxValue = Math.max(...weeks.map(w => w.value), 100);
                const minValue = Math.min(...weeks.map(w => w.value), 0);
                const range = maxValue - minValue || 1;
                
                // Calcular pontos da linha
                const points = weeks.map((week, index) => {
                  const x = (index / (weeks.length - 1)) * 100;
                  const y = 100 - ((week.value - minValue) / range) * 100;
                  return `${x},${y}`;
                }).join(' ');
                
                // Calcular pontos para a área sob a linha
                const areaPoints = `0,100 ${points} 100,100`;
                
                return (
                  <div className="relative">
                    {/* Área do gráfico */}
                    <div className="h-40 relative">
                      {/* Grid de fundo */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Linhas horizontais do grid */}
                        {[0, 25, 50, 75, 100].map(y => (
                          <line
                            key={y}
                            x1="0" y1={y} x2="100" y2={y}
                            stroke="currentColor"
                            strokeWidth="0.2"
                            className="text-gray-300 dark:text-gray-600"
                          />
                        ))}
                        {/* Linhas verticais do grid */}
                        {weeks.map((_, index) => {
                          const x = (index / (weeks.length - 1)) * 100;
                          return (
                            <line
                              key={index}
                              x1={x} y1="0" x2={x} y2="100"
                              stroke="currentColor"
                              strokeWidth="0.2"
                              className="text-gray-300 dark:text-gray-600"
                            />
                          );
                        })}
                      </svg>
                      
                      {/* Área sob a linha (gradiente) */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={areaPoints}
                          fill="url(#areaGradient)"
                          className="transition-all duration-1000 ease-out"
                          style={{ animationDelay: '0.5s' }}
                        />
                      </svg>
                      
                      {/* Linha principal */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={points}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="0.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="drop-shadow-sm transition-all duration-1000 ease-out"
                          style={{
                            strokeDasharray: '200',
                            strokeDashoffset: '200',
                            animation: 'drawLine 1.5s ease-out 0.3s forwards'
                          }}
                        />
                      </svg>
                      
                      {/* Pontos da linha */}
                      {weeks.map((week, index) => {
                        const x = (index / (weeks.length - 1)) * 100;
                        const y = 100 - ((week.value - minValue) / range) * 100;
                        return (
                          <div
                            key={index}
                            className="absolute w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full shadow-lg transition-all duration-300 hover:scale-125 hover:bg-blue-600 cursor-pointer group"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${0.8 + index * 0.1}s`,
                              opacity: 0,
                              animation: 'fadeInPoint 0.5s ease-out forwards'
                            }}
                            title={`Semana ${index + 1}: R$ ${week.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${week.count} pagamentos)`}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              {week.label}: {isFinancialVisible ? `R$ ${week.value.toLocaleString('pt-BR')}` : "••••••••"}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Labels do eixo X */}
                    <div className="flex justify-between mt-4 px-2">
                      {weeks.map((week, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs font-medium text-gray-700 dark:text-white">{week.label}</div>
                          <div className="text-xs text-gray-500 dark:text-white">{week.date}</div>
                                                      <div className="text-xs text-blue-600 dark:text-white font-semibold">
                              {week.count} pag.
                            </div>
                            <div className="text-xs text-gray-500 dark:text-white">
                              {isFinancialVisible 
                                ? `R$ ${week.value.toLocaleString('pt-BR')}`
                                : "••••••••"
                              }
                            </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legenda de valores */}
                    <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-white">
                      <span>Min: {isFinancialVisible ? `R$ ${minValue.toLocaleString('pt-BR')}` : "••••••••"}</span>
                      <span className="text-center">Últimas 4 semanas</span>
                      <span>Max: {isFinancialVisible ? `R$ ${maxValue.toLocaleString('pt-BR')}` : "••••••••"}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          
          {/* CSS Animations para o gráfico de linha */}
          <style jsx>{`
            @keyframes drawLine {
              to {
                stroke-dashoffset: 0;
              }
            }
            
            @keyframes fadeInPoint {
              to {
                opacity: 1;
              }
            }
          `}</style>
          </CardContent>
        )}
      </Card>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recebido</p>
                <p className="text-2xl font-bold text-success">
                  {isFinancialVisible 
                    ? `R$ ${monthlyStats.totalReceived.toLocaleString('pt-BR')}`
                    : "••••••••"
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-warning">
                  {isFinancialVisible 
                    ? `R$ ${monthlyStats.totalPending.toLocaleString('pt-BR')}`
                    : "••••••••"
                  }
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões</p>
                <p className="text-2xl font-bold text-primary">
                  {monthlyStats.sessionsThisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                <p className="text-2xl font-bold text-accent">
                  {isFinancialVisible 
                    ? `R$ ${monthlyStats.averageValue.toLocaleString('pt-BR')}`
                    : "••••••••"
                  }
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Pacotes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Meus Pacotes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie seus pacotes de serviços
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReloadPacotes} disabled={pacotesLoading}>
                {pacotesLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recarregar
                  </>
                )}
              </Button>
              <Button className="gap-2" onClick={() => setIsPacoteModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Pacote
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pacotesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando pacotes...</p>
            </div>
          ) : pacotes?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum pacote criado ainda
              </p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsPacoteModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar Primeiro Pacote
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pacotes?.map((pacote) => (
                <Card key={pacote.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pacote.title}</h3>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {isFinancialVisible 
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(pacote.value)
                            : "••••••••"
                          }
                        </p>
                      </div>
                      <Badge variant={pacote.ativo ? "default" : "secondary"}>
                        {pacote.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    {pacote.descricao && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {pacote.descricao}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Criado em {new Date(pacote.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPacote(pacote)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePacoteStatus(pacote)}
                        className="flex-1"
                      >
                        {pacote.ativo ? (
                          <>
                            <PowerOff className="h-3 w-3 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="h-3 w-3 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePacote(pacote.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação de Pacote */}
      <Dialog open={isPacoteModalOpen} onOpenChange={setIsPacoteModalOpen}>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Pacote</DialogTitle>
                  <DialogDescription>Adicione um novo pacote de serviços</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título do Pacote *</Label>
                    <Input
                      placeholder="Ex: Pacote Mensal - 4 Sessões"
                      value={pacoteForm.title}
                      onChange={(e) => setPacoteForm({...pacoteForm, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="0,00"
                        value={pacoteForm.value}
                        onChange={(e) => handlePacoteValueChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva o que está incluído no pacote..."
                      value={pacoteForm.descricao}
                      onChange={(e) => setPacoteForm({...pacoteForm, descricao: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={pacoteForm.ativo}
                      onChange={(e) => setPacoteForm({...pacoteForm, ativo: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="ativo" className="text-sm">Pacote ativo</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPacoteModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePacote}>
                      Criar Pacote
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

      {/* Modal de Edição de Pacote */}
      <Dialog open={isEditPacoteModalOpen} onOpenChange={setIsEditPacoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pacote</DialogTitle>
            <DialogDescription>Editar dados do pacote "{selectedPacote?.title}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Pacote *</Label>
              <Input
                placeholder="Ex: Pacote Mensal - 4 Sessões"
                value={pacoteForm.title}
                onChange={(e) => setPacoteForm({...pacoteForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="0,00"
                  value={pacoteForm.value}
                  onChange={(e) => handlePacoteValueChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o que está incluído no pacote..."
                value={pacoteForm.descricao}
                onChange={(e) => setPacoteForm({...pacoteForm, descricao: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-ativo"
                checked={pacoteForm.ativo}
                onChange={(e) => setPacoteForm({...pacoteForm, ativo: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-ativo" className="text-sm">Pacote ativo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditPacoteModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEditPacote}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seção de Pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Meus Pagamentos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isFiltered 
                  ? `Exibindo ${displayPagamentos.length} de ${sortedPagamentos.length} pagamentos do período selecionado`
                  : `Exibindo ${displayPagamentos.length} de ${sortedPagamentos.length} pagamentos (ordenados por vencimento mais recente)`
                }
              </p>
            </div>
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Pagamento</DialogTitle>
                  <DialogDescription>Adicione um novo pagamento para um paciente</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Paciente *</Label>
                    <Select value={pagamentoForm.pacienteId} onValueChange={(value) => setPagamentoForm({...pagamentoForm, pacienteId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pacote (Opcional)</Label>
                    <Select value={pagamentoForm.pacoteId || 'nenhum'} onValueChange={(value) => {
                      const newPacoteId = value === 'nenhum' ? null : value;
                      const selectedPacote = value !== 'nenhum' ? pacotes?.find(p => p.id === value) : null;
                      setPagamentoForm({
                        ...pagamentoForm, 
                        pacoteId: newPacoteId,
                        value: selectedPacote ? Number(selectedPacote.value) : pagamentoForm.value
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar pacote (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum pacote</SelectItem>
                        {pacotes?.filter(pacote => pacote.ativo).map((pacote) => (
                          <SelectItem key={pacote.id} value={pacote.id}>
                            {pacote.title} - {isFinancialVisible ? `R$ ${Number(pacote.value || 0).toFixed(2)}` : "••••••••"}
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
                        value={pagamentoForm.data}
                        onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vencimento *</Label>
                      <Input
                        type="date"
                        value={pagamentoForm.vencimento}
                        onChange={(e) => setPagamentoForm({...pagamentoForm, vencimento: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="0,00"
                        value={formatPagamentoValue(pagamentoForm.value?.toString() || '0')}
                        onChange={(e) => handlePagamentoValueChange(e.target.value)}
                        className="pl-10"
                        disabled={pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'nenhum'}
                      />
                    </div>
                    {pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'nenhum' && (
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
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Pagamento</Label>
                      <Select value={pagamentoForm.type?.toString() || ''} onValueChange={(value) => setPagamentoForm({...pagamentoForm, type: value ? parseInt(value) : null})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">PIX</SelectItem>
                          <SelectItem value="2">Cartão</SelectItem>
                          <SelectItem value="3">Boleto</SelectItem>
                          <SelectItem value="4">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>TXID (Opcional)</Label>
                      <Input
                        placeholder="ID da transação"
                        value={pagamentoForm.txid}
                        onChange={(e) => setPagamentoForm({...pagamentoForm, txid: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePagamento}>
                      Criar Pagamento
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {pagamentosLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando pagamentos...</p>
            </div>
          ) : displayPagamentos.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isFiltered 
                  ? "Nenhum pagamento encontrado no período selecionado"
                  : "Nenhum pagamento registrado ainda"
                }
              </p>
              {!isFiltered && (
                <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsPaymentModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Pagamento
                </Button>
              )}
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {pagamento.paciente?.nome || 'Paciente não encontrado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {isFinancialVisible 
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(pagamento.value)
                        : "••••••••"
                      }
                    </TableCell>
                    <TableCell>
                      {pagamento.pacote?.title || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusLabel(pagamento.status).variant}>
                        {getStatusLabel(pagamento.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getTypeLabel(pagamento.type)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-3 items-center">
                        {/* Controle local: Nota fiscal/recibo emitido */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Recibo?</span>
                          <Switch
                            checked={isReciboIssued(pagamento.id)}
                            onCheckedChange={(checked) => handleToggleRecibo(pagamento.id, checked)}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>N.Fiscal?</span>
                          <Switch
                            checked={isNotaFiscalIssued(pagamento.id)}
                            onCheckedChange={(checked) => handleToggleNotaFiscal(pagamento.id, checked)}
                          />
                        </div>
                        {pagamento.status === 0 && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdatePagamentoStatus(pagamento.id, 1)}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditPagamento(pagamento)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeletePagamento(pagamento.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Paginação */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground flex items-center gap-3">
                  <span>
                    Mostrando {startIndex + 1} a {Math.min(endIndex, sortedPagamentos.length)} de {sortedPagamentos.length} pagamentos
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Itens por página:</span>
                    <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="h-8 w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição de Pagamento */}
      <Dialog open={isEditPagamentoModalOpen} onOpenChange={setIsEditPagamentoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
            <DialogDescription>Editar dados do pagamento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={pagamentoForm.pacienteId} onValueChange={(value) => setPagamentoForm({...pagamentoForm, pacienteId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pacote (Opcional)</Label>
              <Select value={pagamentoForm.pacoteId || 'nenhum'} onValueChange={(value) => {
                const newPacoteId = value === 'nenhum' ? null : value;
                const selectedPacote = value !== 'nenhum' ? pacotes?.find(p => p.id === value) : null;
                setPagamentoForm({
                  ...pagamentoForm, 
                  pacoteId: newPacoteId,
                  value: selectedPacote ? Number(selectedPacote.value) : pagamentoForm.value
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar pacote (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum pacote</SelectItem>
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
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={pagamentoForm.data}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Vencimento *</Label>
                <Input
                  type="date"
                  value={pagamentoForm.vencimento}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, vencimento: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="0,00"
                  value={formatPagamentoValue(pagamentoForm.value?.toString() || '0')}
                  onChange={(e) => handlePagamentoValueChange(e.target.value)}
                  className="pl-10"
                  disabled={pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'nenhum'}
                />
              </div>
              {pagamentoForm.pacoteId && pagamentoForm.pacoteId !== 'nenhum' && (
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
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <Label>Nota fiscal ou recibo emitido?</Label>
                <p className="text-xs text-muted-foreground">Somente controle do psicólogo</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm">Não</span>
                <Switch
                  checked={pagamentoForm.fiscalIssued}
                  onCheckedChange={(checked) => setPagamentoForm({...pagamentoForm, fiscalIssued: checked})}
                />
                <span className="text-sm">Sim</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Pagamento</Label>
                <Select value={pagamentoForm.type?.toString() || ''} onValueChange={(value) => setPagamentoForm({...pagamentoForm, type: value ? parseInt(value) : null})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">PIX</SelectItem>
                    <SelectItem value="2">Cartão</SelectItem>
                    <SelectItem value="3">Boleto</SelectItem>
                    <SelectItem value="4">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>TXID (Opcional)</Label>
                <Input
                  placeholder="ID da transação"
                  value={pagamentoForm.txid}
                  onChange={(e) => setPagamentoForm({...pagamentoForm, txid: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditPagamentoModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEditPagamento}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Payment Form - Redesigned */}
      <Card className="border-muted/40 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Registro Rápido
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Registre um pagamento de forma rápida e simples
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Campo Paciente */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Paciente</Label>
              <Popover open={patientComboOpen} onOpenChange={setPatientComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={patientComboOpen}
                    className="w-full justify-between h-11 bg-background border-input hover:bg-muted/50 transition-colors"
                  >
                    {quickPaymentForm.patient
                      ? patients.find((patient) => patient.name === quickPaymentForm.patient)?.name
                      : "Selecionar paciente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start" style={{backgroundColor: 'white', border: '1px solid #e5e7eb'}}>
                  <Command style={{backgroundColor: 'white'}}>
                    <CommandInput 
                      placeholder="Buscar paciente..." 
                      className="h-9 border-0"
                      style={{backgroundColor: 'white', color: 'black'}}
                    />
                    <CommandEmpty className="py-4 text-center text-sm" style={{color: '#6b7280'}}>
                      Nenhum paciente encontrado.
                    </CommandEmpty>
                    <CommandList style={{backgroundColor: 'white'}}>
                      <CommandGroup style={{backgroundColor: 'white'}}>
                        {patients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.name}
                            onSelect={(currentValue) => {
                              setQuickPaymentForm({
                                ...quickPaymentForm, 
                                patient: currentValue === quickPaymentForm.patient ? "" : currentValue
                              });
                              setPatientComboOpen(false);
                            }}
                            className="cursor-pointer py-2 px-3"
                            style={{
                              backgroundColor: 'white',
                              color: 'black'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            <User className="mr-2 h-4 w-4" style={{color: '#6b7280'}} />
                            <span style={{color: 'black'}}>{patient.name}</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                quickPaymentForm.patient === patient.name ? "opacity-100" : "opacity-0"
                              )}
                              style={{color: '#6b7280'}}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Campo Valor */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="0,00"
                  value={quickPaymentForm.value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="pl-10 h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Campo Método */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Método</Label>
              <Select value={quickPaymentForm.method} onValueChange={(value) => setQuickPaymentForm({...quickPaymentForm, method: value})}>
                <SelectTrigger className="h-11 bg-background border-input hover:bg-muted/50 transition-colors">
                  <SelectValue placeholder="Selecionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      PIX
                    </div>
                  </SelectItem>
                  <SelectItem value="cartao" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Cartão
                    </div>
                  </SelectItem>
                  <SelectItem value="dinheiro" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Dinheiro
                    </div>
                  </SelectItem>
                  <SelectItem value="transferencia" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Transferência
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Data</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={quickPaymentForm.date}
                  onChange={(e) => setQuickPaymentForm({...quickPaymentForm, date: e.target.value})}
                  className="pl-10 h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Botão Registrar */}
            <div className="space-y-2 flex flex-col justify-end">
              <Button 
                className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md" 
                onClick={handleQuickPayment}
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}