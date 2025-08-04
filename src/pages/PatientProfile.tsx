import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowLeft,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Edit,
  FileText,
  Upload,
  Download,
  User,
  Plus,
  Settings,
  Loader2,
  DollarSign,
  CalendarDays,
  FolderOpen,
  UserCheck,
  Clock,
  MapPin,
  Briefcase,
  Users,
  FileIcon,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  Activity,
  Heart,
  Shield,
  Star,
  MessageSquare,
  Save,
} from "lucide-react";

import { usePacientes } from "@/hooks/usePacientes";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { apiService } from "@/services/api.service";

export default function PatientProfile() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patient, setPatient] = useState<any>(null);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [patientFinancials, setPatientFinancials] = useState<any[]>([]);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    getPaciente,
    updatePaciente,
    deletePaciente,
    deactivatePaciente,
    reactivatePaciente,
    loading: actionLoading
  } = usePacientes();

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    address: "",
    profession: "",
    emergency_contact: "",
    medication: "",
    notes: "",
    status: "ativo",
    cpf: "",
    gender: "",
    guardian_name: "",
    guardian_phone: "",
  });

  const fetchPatientData = useCallback(async () => {
    if (!patientId) {
      toast({
        title: "Erro",
        description: "ID do paciente não encontrado.",
        variant: "destructive",
      });
      navigate("/pacientes");
      return;
    }

    setIsLoading(true);
    try {
      // Buscar dados reais do paciente diretamente da API
      const pacienteData = await apiService.getPaciente(patientId);
      
      // Converter dados do paciente para o formato esperado pela interface
      const convertedPatient = {
        id: pacienteData.id,
        name: pacienteData.nome,
        email: pacienteData.email,
        phone: pacienteData.telefone,
        birth_date: pacienteData.nascimento,
        address: pacienteData.endereco,
        profession: pacienteData.profissao,
        emergency_contact: pacienteData.contato_emergencia,
        medication: pacienteData.medicacoes ? JSON.stringify(pacienteData.medicacoes) : null,
        notes: pacienteData.observacao_geral,
        status: pacienteData.status === 1 ? "ativo" : "inativo",
        cpf: pacienteData.cpf,
        sessions_count: 0, // Mock data
        last_session: null, // Mock data
        created_at: pacienteData.createdAt,
        updated_at: pacienteData.updatedAt,
        user_id: pacienteData.userId,
        gender: pacienteData.genero,
        guardian_name: '',
        guardian_phone: '',
        is_minor: false,
        age_group: 'adulto'
      };

      setPatient(convertedPatient);
      setEditForm({
        name: convertedPatient.name,
        email: convertedPatient.email || "",
        phone: convertedPatient.phone || "",
        birth_date: convertedPatient.birth_date || "",
        address: convertedPatient.address || "",
        profession: convertedPatient.profession || "",
        emergency_contact: convertedPatient.emergency_contact || "",
        medication: convertedPatient.medication || "",
        notes: convertedPatient.notes || "",
        status: convertedPatient.status || "ativo",
        cpf: convertedPatient.cpf || "",
        gender: convertedPatient.gender || "",
        guardian_name: convertedPatient.guardian_name || "",
        guardian_phone: convertedPatient.guardian_phone || "",
      });

      // Dados mockados relacionados (mantidos para preservar o visual)
      setPatientAppointments([
        {
          id: '1',
          patient_id: patientId,
          date: '2024-01-20',
          time: '14:00',
          duration: 50,
          type: 'consulta',
          modality: 'presencial',
          session_type: 'individual',
          status: 'agendado',
          notes: 'Sessão de acompanhamento'
        }
      ]);
      
      setPatientFinancials([
        {
          id: '1',
          patient_id: patientId,
          date: '2024-01-19',
          amount: 150.00,
          type: 'receita',
          description: 'Sessão de psicoterapia',
          payment_method: 'pix',
          status: 'pago'
        }
      ]);
      
      setPatientRecords([
        {
          id: '1',
          patient_id: patientId,
          title: 'Avaliação Inicial',
          content: 'Paciente apresenta sintomas de ansiedade generalizada...',
          category: 'avaliacao',
          created_at: '2024-01-15T10:00:00Z'
        }
      ]);
      
      setPatientFiles([
        {
          id: '1',
          patient_id: patientId,
          name: 'Avaliação Psicológica.pdf',
          file_type: 'application/pdf',
          file_size: 245760,
          category: 'relatorio',
          created_at: '2024-01-15T10:00:00Z'
        }
      ]);
    } catch (error: any) {
      console.error('Erro ao carregar paciente:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do paciente.",
        variant: "destructive",
      });
      navigate("/pacientes");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, navigate, toast]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const handleEditPatient = async () => {
    try {
      // Converter dados do formulário para o formato do backend
      const pacienteData = {
        nome: editForm.name,
        email: editForm.email,
        telefone: editForm.phone,
        nascimento: editForm.birth_date,
        endereco: editForm.address,
        profissao: editForm.profession,
        contato_emergencia: editForm.emergency_contact,
        observacao_geral: editForm.notes,
        cpf: editForm.cpf,
        genero: editForm.gender,
        status: editForm.status === "ativo" ? 1 : 0
      };

      const updatedPaciente = await updatePaciente(patientId, pacienteData);
      
      // Atualizar o estado local
      const convertedPatient = {
        ...patient,
        name: updatedPaciente.nome,
        email: updatedPaciente.email,
        phone: updatedPaciente.telefone,
        birth_date: updatedPaciente.nascimento,
        address: updatedPaciente.endereco,
        profession: updatedPaciente.profissao,
        emergency_contact: updatedPaciente.contato_emergencia,
        notes: updatedPaciente.observacao_geral,
        status: updatedPaciente.status === 1 ? "ativo" : "inativo",
        cpf: updatedPaciente.cpf,
        gender: updatedPaciente.genero,
      };

      setPatient(convertedPatient);
      
      toast({
        title: "Sucesso",
        description: "Paciente atualizado com sucesso.",
      });
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar paciente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePatient = async () => {
    if (confirm('Tem certeza que deseja deletar este paciente?')) {
      try {
        await deletePaciente(patientId);
        toast({
          title: "Sucesso",
          description: "Paciente deletado com sucesso.",
        });
        navigate("/pacientes");
      } catch (error: any) {
        toast({
          title: "Erro",
          description: "Erro ao deletar paciente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async () => {
    try {
      if (patient.status === "ativo") {
        await deactivatePaciente(patientId);
        setPatient({ ...patient, status: "inativo" });
        toast({
          title: "Sucesso",
          description: "Paciente desativado com sucesso.",
        });
      } else {
        await reactivatePaciente(patientId);
        setPatient({ ...patient, status: "ativo" });
        toast({
          title: "Sucesso",
          description: "Paciente reativado com sucesso.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do paciente.",
        variant: "destructive",
      });
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
      </div>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Gradiente */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/70 to-primary/50 dark:from-primary/40 dark:to-primary/30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/50 to-primary/60 dark:from-primary/30 dark:via-primary/25 dark:to-primary/30" />
        <div className="relative z-10 container mx-auto py-12">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/pacientes")}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Pacientes
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarFallback className="bg-white/20 text-white text-2xl font-bold backdrop-blur-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h1 className="text-5xl font-bold mb-3">{patient.name}</h1>
                <div className="flex items-center gap-6 text-white/90 mb-4 text-lg">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {patient.birth_date 
                      ? `${calculateAge(patient.birth_date)} anos` 
                      : "Idade não informada"
                    }
                  </span>
                  {patient.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      {patient.phone}
                    </span>
                  )}
                  {patient.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {patient.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={patient.status === "ativo" ? "default" : "secondary"}
                    className="bg-white/15 dark:bg-white/10 text-white border-white/20 dark:border-white/10 text-base px-4 py-2"
                  >
                    {patient.status === "ativo" ? "✓ Paciente Ativo" : "Paciente Inativo"}
                  </Badge>
                  {patient.age_group && (
                    <Badge variant="outline" className="bg-white/10 dark:bg-white/5 text-white border-white/20 dark:border-white/10 text-base px-4 py-2">
                      {patient.age_group}
                    </Badge>
                  )}
                  {patient.is_minor && (
                    <Badge variant="outline" className="bg-yellow-500/15 dark:bg-yellow-400/10 text-white border-yellow-300/20 dark:border-yellow-400/10 text-base px-4 py-2">
                      <Shield className="w-4 h-4 mr-2" />
                      Menor de Idade
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg" className="text-white/80 hover:text-white hover:bg-white/10">
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStatusChange}>
                  {patient.status === "ativo" ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Desativar Paciente
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Ativar Paciente
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeletePatient} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Paciente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 -mt-6 relative z-10">
        {/* Stats Cards Flutuantes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white/90 dark:bg-gray-800/80 shadow-xl border-0 hover:shadow-2xl transition-shadow backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 dark:bg-blue-400/20 flex items-center justify-center">
                  <CalendarDays className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Sessões</p>
                  <p className="text-3xl font-bold">{patientAppointments.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {patientAppointments.filter(a => a.status === "realizado").length} realizadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/80 shadow-xl border-0 hover:shadow-2xl transition-shadow backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 dark:bg-green-400/20 flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(
                      patientFinancials
                        .filter(f => f.type === "pagamento" && f.status === "pago")
                        .reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {patientFinancials.filter(f => f.status === "pendente").length} pendentes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/80 shadow-xl border-0 hover:shadow-2xl transition-shadow backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 dark:bg-purple-400/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prontuários</p>
                  <p className="text-3xl font-bold">{patientRecords.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {patientRecords.length > 0 
                      ? `Último: ${format(new Date(patientRecords[0]?.created_at), "dd/MM/yy", { locale: ptBR })}`
                      : "Nenhum registro"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/80 shadow-xl border-0 hover:shadow-2xl transition-shadow backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 dark:bg-orange-400/20 flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arquivos</p>
                  <p className="text-3xl font-bold">{patientFiles.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {patientFiles.length > 0 
                      ? `${(patientFiles.reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024).toFixed(1)} MB`
                      : "Nenhum arquivo"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Abas Principal */}
        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/90 dark:bg-gray-800/80 shadow-lg border h-16 backdrop-blur-sm">
            <TabsTrigger value="perfil" className="flex items-center gap-2 text-lg h-full data-[state=active]:bg-primary/80 dark:data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground">
              <UserCheck className="w-5 h-5" />
              Perfil Completo
            </TabsTrigger>
            <TabsTrigger value="prontuario" className="flex items-center gap-2 text-lg h-full data-[state=active]:bg-primary/80 dark:data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground">
              <FileText className="w-5 h-5" />
              Prontuário
            </TabsTrigger>
            <TabsTrigger value="sessoes" className="flex items-center gap-2 text-lg h-full data-[state=active]:bg-primary/80 dark:data-[state=active]:bg-primary/60 data-[state=active]:text-primary-foreground">
              <Clock className="w-5 h-5" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center gap-2 text-lg h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-5 h-5" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="arquivos" className="flex items-center gap-2 text-lg h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FolderOpen className="w-5 h-5" />
              Arquivos
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil Completo */}
          <TabsContent value="perfil" className="space-y-8 mt-10">
            <Card className="overflow-hidden shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-8">
                <CardTitle className="text-2xl">Informações Pessoais Completas</CardTitle>
                <CardDescription className="text-lg">
                  Dados completos e atualizados do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Informações Básicas */}
                  <div className="space-y-8">
                    <h4 className="font-bold text-xl flex items-center gap-3 text-primary border-b pb-3">
                      <User className="w-6 h-6" />
                      Dados Básicos
                    </h4>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Mail className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
                          <p className="text-lg font-medium">{patient.email || "Não informado"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <Phone className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Telefone</p>
                          <p className="text-lg font-medium">{patient.phone || "Não informado"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <Calendar className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data de Nascimento</p>
                          <p className="text-lg font-medium">
                            {patient.birth_date
                              ? `${format(new Date(patient.birth_date), "dd/MM/yyyy", { locale: ptBR })} (${calculateAge(patient.birth_date)} anos)`
                              : "Não informada"}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <User className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gênero</p>
                          <p className="text-lg font-medium">{patient.gender || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações Complementares */}
                  <div className="space-y-8">
                    <h4 className="font-bold text-xl flex items-center gap-3 text-primary border-b pb-3">
                      <MapPin className="w-6 h-6" />
                      Dados Complementares
                    </h4>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Endereço</p>
                          <p className="text-lg font-medium">{patient.address || "Não informado"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <Briefcase className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profissão</p>
                          <p className="text-lg font-medium">{patient.profession || "Não informada"}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <CreditCard className="w-6 h-6 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">CPF</p>
                          <p className="text-lg font-medium">{patient.cpf || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informações Médicas e Observações */}
                {(patient.emergency_contact || patient.medication || patient.notes) && (
                  <>
                    <Separator className="my-10" />
                    <div className="space-y-8">
                      <h4 className="font-bold text-xl flex items-center gap-3 text-primary border-b pb-3">
                        <Heart className="w-6 h-6" />
                        Informações Médicas e Observações
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {patient.emergency_contact && (
                          <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contato de Emergência</p>
                              <p className="text-lg font-semibold text-red-600">{patient.emergency_contact}</p>
                            </div>
                          </div>
                        )}
                        {patient.medication && (
                          <div className="flex items-start gap-4">
                            <Heart className="w-6 h-6 text-orange-500 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medicações</p>
                              <p className="text-lg font-medium">{patient.medication}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {patient.notes && (
                        <div className="flex items-start gap-4 mt-6">
                          <MessageSquare className="w-6 h-6 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Observações Gerais</p>
                            <p className="text-lg font-medium leading-relaxed">{patient.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outras abas com conteúdo básico */}
          <TabsContent value="prontuario" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Prontuário Médico</h3>
                  <p className="text-muted-foreground">Seção em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessoes" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Histórico de Sessões</h3>
                  <p className="text-muted-foreground">Seção em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Registros Financeiros</h3>
                  <p className="text-muted-foreground">Seção em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arquivos" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardContent className="p-10">
                <div className="text-center">
                  <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Arquivos do Paciente</h3>
                  <p className="text-muted-foreground">Seção em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Informações do Paciente</DialogTitle>
              <DialogDescription>
                Atualize as informações básicas do paciente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  placeholder="Nome completo"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={editForm.birth_date}
                    onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={editForm.cpf}
                    onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  placeholder="Endereço completo"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Profissão</Label>
                <Input
                  placeholder="Profissão"
                  value={editForm.profession}
                  onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditPatient}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}