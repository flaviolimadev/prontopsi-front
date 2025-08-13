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
  ClipboardList,
} from "lucide-react";

import { usePacientes } from "@/hooks/usePacientes";
import { PacienteForm } from "@/components/pacientes/PacienteForm";
import { SessionRecordModal } from "@/components/pacientes/SessionRecordModal";
import { apiService } from "@/services/api.service";
import { useAgendaSessoesReal } from "@/hooks/useAgendaSessoesReal";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useFinancialVisibility } from "@/contexts/FinancialVisibilityContext";

export default function PatientProfile() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patient, setPatient] = useState<any>(null);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [patientFinancials, setPatientFinancials] = useState<any[]>([]);
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [fileUploading, setFileUploading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isEmergencyContactModalOpen, setIsEmergencyContactModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isSessionRecordModalOpen, setIsSessionRecordModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [medications, setMedications] = useState<Array<{id: string, nome: string, prescricao: string}>>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{id: string, nome: string, telefone: string}>>([]);
  const [newMedication, setNewMedication] = useState({ nome: '', prescricao: '' });
  const [newEmergencyContact, setNewEmergencyContact] = useState({ nome: '', telefone: '' });
  const [notes, setNotes] = useState('');
  const [anamnese, setAnamnese] = useState<any>(null);
  const [anamneseTipo, setAnamneseTipo] = useState<'adulto' | 'menor'>('adulto');
  const [anamneseRespostas, setAnamneseRespostas] = useState<Record<string, string>>({});

  const {
    getPaciente,
    updatePaciente,
    deletePaciente,
    deactivatePaciente,
    reactivatePaciente,
    loading: actionLoading
  } = usePacientes();

  // Hooks para buscar dados relacionados
  const { agendaSessoes } = useAgendaSessoesReal();
  const { pagamentos } = usePagamentos();
  const { loading: addressLoading, addressData, searchByCEP, searchByStreet, clearAddress } = useAddressSearch();
  const { isFinancialVisible } = useFinancialVisibility();

  const adultoPerguntas: string[] = [
    'Qual é a sua queixa principal? (O que motivou você a procurar terapia? Há quanto tempo isso acontece? Com que frequência e intensidade esses sintomas ocorrem?)',
    'De que maneira esse problema tem afetado seus relacionamentos, seu trabalho (ou estudos) e sua rotina?',
    'Que estratégias, recursos ou tratamentos você já tentou até agora para lidar com esse problema?',
    'Você já teve algum episódio anterior de sofrimento emocional mais intenso, como depressão, ansiedade ou pensamentos suicidas? Já fez uso de medicação, tratamento ou passou por internação?',
    'Algum familiar próximo já teve problemas emocionais, psicológicos, uso abusivo de álcool ou outras drogas, doenças importantes ou alguma situação envolvendo tentativa de suicídio?',
    'Como você se lembrava de ser quando criança? Teve alguma dificuldade ou desafio no seu desenvolvimento nessa época?',
    'Como foi seu comportamento e desempenho na escola? Você conseguia acompanhar as atividades e se relacionar bem com colegas e professores?',
    'Você passou por alguma situação difícil, traumática ou marcante na vida? Já teve alguma experiência de abuso?',
    'Já teve alguma ideia ou vontade de se machucar, como se cortar?',
    'Como você descreve sua relação com a família atualmente? E como ela costumava ser no passado?',
    'Quem são as pessoas mais importantes e próximas na sua vida hoje, e com quem você costuma contar quando enfrenta dificuldades?',
    'Como tem sido sua rotina ultimamente? Como você avalia a qualidade do seu sono? Você tem praticado alguma atividade física?',
    'Você faz uso de alguma substância, como álcool, maconha ou outras drogas? Se sim, com que frequência e em quais contextos costuma utilizá-las?',
    'O que você mais gosta de fazer nas horas de lazer? Há alguma atividade que você gostaria de fazer mais atualmente?',
    'Quais são seus principais objetivos com o tratamento? Tem alguma mudança específica que gostaria de ver na sua vida ou no que está enfrentando?'
  ];

  const menorPerguntas: string[] = [
    'Qual o motivo da busca pelo atendimento psicológico?',
    'Quais são as expectativas de vocês em relação à psicoterapia? O que gostariam que mudasse ou melhorasse com o acompanhamento?',
    'O que a criança/adolescente sabe sobre estar em acompanhamento psicológico? Alguém contou? Se sim, como foi para ela saber disso?',
    'A criança/adolescente foi desejada? Me conte um pouco sobre como foi essa gestação. Nasceu com quantos meses? Qual foi a via de parto?',
    'Como foi o processo da amamentação?',
    'Como foram os marcos importantes, como o controle da cabeça, sentar, engatinhar, andar e falar? Tudo aconteceu conforme esperado ou houve alguma dificuldade?',
    'Como está a vida escolar atualmente? Em que série está? Como você observa a relação dele(a) com os colegas e professores?',
    'Você percebe se há alguma dificuldade em determinadas matérias? Já houve alguma reprovação? A escola já trouxe alguma queixa ou preocupação? Se sim, poderia me contar um pouco sobre o que foi relatado?',
    'Me conta um pouco sobre como é a rotina dele(a) no dia a dia? Quais atividades ele(a) mais gosta de fazer? Ele(a) passa muito tempo em frente às telas? E com quem costuma ficar durante o dia?',
    'Ele(a) já consegue tomar banho sozinho(a)? Caso não, quem costuma ajudá-lo(a) nessa tarefa?',
    'Existe alguma rotina de sono estabelecida? Se sim, ele(a) costuma seguir essa rotina com regularidade?',
    'Quem mora com a criança/adolescente?',
    'Essa criança/adolescente já passou por alguma situação difícil, como uma perda significativa, separação, mudança brusca ou algum evento que possa ter sido traumático para ela? Se sim, como ela lidou com isso na época?',
    'Existe algum problema de saúde atual ou passado que seja importante mencionar? A criança/adolescente faz uso de alguma medicação regularmente?',
    'Na história da família, há casos de situações emocionais mais delicadas, como depressão, ansiedade, uso problemático de álcool ou outras substâncias, ou algo que tenha exigido acompanhamento psicológico ou psiquiátrico?',
    'Para adolescente: Você já teve alguma experiência sexual? Foi uma decisão sua? Você costuma usar preservativo nessas ocasiões?',
    'Para adolescente: Você já namorou? Se sim, seus pais sabem sobre isso? Como foi ou está sendo essa experiência para você',
    'Você tem alguma doença? Toma algum remédio?'
  ];

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

  // Estados para busca de endereço
  const [addressSearchType, setAddressSearchType] = useState<'cep' | 'street'>('cep');
  const [addressSearchData, setAddressSearchData] = useState({
    cep: '',
    street: '',
    city: '',
    state: ''
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
      
      // Carregar medicamentos
      if (pacienteData.medicacoes && Array.isArray(pacienteData.medicacoes)) {
        setMedications(pacienteData.medicacoes);
      } else {
        setMedications([]);
      }
      
      // Carregar contatos de emergência
      if (pacienteData.contatos_emergencia && Array.isArray(pacienteData.contatos_emergencia)) {
        setEmergencyContacts(pacienteData.contatos_emergencia);
      } else {
        setEmergencyContacts([]);
      }
      
      // Carregar observações
      setNotes(pacienteData.observacao_geral || '');

      // Definir tipo de anamnese automaticamente pelo nascimento (adulto x menor)
      try {
        if (pacienteData.nascimento) {
          const birth = new Date(pacienteData.nascimento);
          if (!Number.isNaN(birth.getTime())) {
            const years = differenceInYears(new Date(), birth);
            setAnamneseTipo(years < 18 ? 'menor' : 'adulto');
          }
        }
      } catch {}

      // Carregar anamnese
      try {
        const anam = await apiService.getAnamnese(patientId);
        if (anam) {
          setAnamnese(anam);
          // Tipo permanece o detectado automaticamente pela data de nascimento
          setAnamneseRespostas(anam.respostas || {});
        }
      } catch {}
      
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

      // Buscar agendamentos reais do paciente
      const patientAgendaSessoes = agendaSessoes.filter(sessao => sessao.pacienteId === patientId);
      setPatientAppointments(patientAgendaSessoes.map(sessao => ({
        id: sessao.id,
        patient_id: sessao.pacienteId,
        date: sessao.data,
        time: sessao.horario,
        duration: sessao.duracao,
        type: sessao.tipoDaConsulta,
        modality: sessao.modalidade,
        session_type: sessao.tipoAtendimento,
        status: sessao.status === 0 ? 'agendado' : 
                sessao.status === 1 ? 'em_andamento' : 
                sessao.status === 2 ? 'realizado' : 'cancelado',
        notes: sessao.observacao,
        value: sessao.value
      })));
      
      // Buscar pagamentos reais do paciente
      const patientPagamentos = pagamentos.filter(pagamento => pagamento.pacienteId === patientId);
      setPatientFinancials(patientPagamentos.map(pagamento => ({
        id: pagamento.id,
        patient_id: pagamento.pacienteId,
        date: pagamento.data,
        amount: Number(pagamento.value) || 0, // Converter para número e usar 0 como fallback
        type: 'pagamento',
        description: pagamento.descricao || 'Pagamento de sessão',
        payment_method: pagamento.type === 1 ? 'pix' : 
                       pagamento.type === 2 ? 'cartão' : 
                       pagamento.type === 3 ? 'boleto' : 'espécie',
        status: pagamento.status === 0 ? 'pendente' : 
                pagamento.status === 1 ? 'pago' : 
                pagamento.status === 2 ? 'confirmado' : 'cancelado'
      })));
      
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
      
      try {
        const files = await apiService.getPacienteFiles(patientId);
        setPatientFiles(files || []);
      } catch (e) {
        setPatientFiles([]);
      }
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

  // Atualizar dados relacionados quando os hooks carregarem
  useEffect(() => {
    if (patientId && agendaSessoes.length > 0) {
      const patientAgendaSessoes = agendaSessoes.filter(sessao => sessao.pacienteId === patientId);
      setPatientAppointments(patientAgendaSessoes.map(sessao => ({
        id: sessao.id,
        patient_id: sessao.pacienteId,
        date: sessao.data,
        time: sessao.horario,
        duration: sessao.duracao,
        type: sessao.tipoDaConsulta,
        modality: sessao.modalidade,
        session_type: sessao.tipoAtendimento,
        status: sessao.status === 0 ? 'agendado' : 
                sessao.status === 1 ? 'em_andamento' : 
                sessao.status === 2 ? 'realizado' : 'cancelado',
        notes: sessao.observacao,
        value: sessao.value
      })));
    }
  }, [patientId, agendaSessoes]);

  useEffect(() => {
    if (patientId && pagamentos.length > 0) {
      const patientPagamentos = pagamentos.filter(pagamento => pagamento.pacienteId === patientId);
      

      setPatientFinancials(patientPagamentos.map(pagamento => ({
        id: pagamento.id,
        patient_id: pagamento.pacienteId,
        date: pagamento.data,
        amount: Number(pagamento.value) || 0, // Converter para número e usar 0 como fallback
        type: 'pagamento',
        description: pagamento.descricao || 'Pagamento de sessão',
        payment_method: pagamento.type === 1 ? 'pix' : 
                       pagamento.type === 2 ? 'cartão' : 
                       pagamento.type === 3 ? 'boleto' : 'espécie',
        status: pagamento.status === 0 ? 'pendente' : 
                pagamento.status === 1 ? 'pago' : 
                pagamento.status === 2 ? 'confirmado' : 'cancelado'
      })));
    }
  }, [patientId, pagamentos]);

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

  const handleAddMedication = async () => {
    if (!newMedication.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do medicamento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const medicationToAdd = {
        id: Date.now().toString(), // ID temporário
        nome: newMedication.nome.trim(),
        prescricao: newMedication.prescricao.trim()
      };

      const updatedMedications = [...medications, medicationToAdd];
      
      // Debug: verificar dados antes de enviar
      console.log('Dados sendo enviados para o backend:', {
        patientId,
        pacienteData: { medicacoes: updatedMedications }
      });
      
      // Atualizar no backend - enviar apenas o campo medicacoes
      const pacienteData = {
        medicacoes: updatedMedications
      };

      const result = await updatePaciente(patientId, pacienteData);
      
      // Debug: verificar resposta do backend
      console.log('Resposta do backend:', result);
      
      // Atualizar estado local
      setMedications(updatedMedications);
      setNewMedication({ nome: '', prescricao: '' });
      
      toast({
        title: "Sucesso",
        description: "Medicamento adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao adicionar medicamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar medicamento.",
        variant: "destructive",
      });
    }
  };

  const formatCEP = (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length <= 5) {
      return cleanCEP;
    }
    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5, 8)}`;
  };

  const handleSearchAddress = async () => {
    if (addressSearchType === 'cep') {
      const result = await searchByCEP(addressSearchData.cep);
      if (result) {
        const fullAddress = `${result.logradouro}, ${result.bairro}, ${result.localidade} - ${result.uf}, CEP: ${result.cep}`;
        setEditForm(prev => ({ ...prev, address: fullAddress }));
      }
    } else {
      const result = await searchByStreet(addressSearchData.street, addressSearchData.city, addressSearchData.state);
      if (result) {
        const fullAddress = `${result.logradouro}, ${result.bairro}, ${result.localidade} - ${result.uf}, CEP: ${result.cep}`;
        setEditForm(prev => ({ ...prev, address: fullAddress }));
      }
    }
  };

  const handleRemoveMedication = async (medicationId: string) => {
    try {
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      
      // Debug: verificar dados antes de enviar
      console.log('Removendo medicamento - dados sendo enviados:', {
        patientId,
        pacienteData: { medicacoes: updatedMedications }
      });
      
      // Atualizar no backend - enviar apenas o campo medicacoes
      const pacienteData = {
        medicacoes: updatedMedications
      };

      const result = await updatePaciente(patientId, pacienteData);
      
      // Debug: verificar resposta do backend
      console.log('Resposta do backend (remoção):', result);
      
      // Atualizar estado local
      setMedications(updatedMedications);
      
      toast({
        title: "Sucesso",
        description: "Medicamento removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover medicamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover medicamento.",
        variant: "destructive",
      });
    }
  };

  const handleAddEmergencyContact = async () => {
    if (!newEmergencyContact.nome.trim() || !newEmergencyContact.telefone.trim()) {
      toast({
        title: "Erro",
        description: "Nome e telefone do contato de emergência são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const contactToAdd = {
        id: Date.now().toString(),
        nome: newEmergencyContact.nome.trim(),
        telefone: newEmergencyContact.telefone.trim()
      };

      const updatedContacts = [...emergencyContacts, contactToAdd];
      
      const pacienteData = {
        contatos_emergencia: updatedContacts
      };

      const result = await updatePaciente(patientId, pacienteData);
      
      setEmergencyContacts(updatedContacts);
      setNewEmergencyContact({ nome: '', telefone: '' });
      
      toast({
        title: "Sucesso",
        description: "Contato de emergência adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao adicionar contato de emergência:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar contato de emergência.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveEmergencyContact = async (contactId: string) => {
    try {
      const updatedContacts = emergencyContacts.filter(contact => contact.id !== contactId);
      
      const pacienteData = {
        contatos_emergencia: updatedContacts
      };

      const result = await updatePaciente(patientId, pacienteData);
      
      setEmergencyContacts(updatedContacts);
      
      toast({
        title: "Sucesso",
        description: "Contato de emergência removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover contato de emergência:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover contato de emergência.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      const pacienteData = {
        observacao_geral: notes.trim()
      };

      const result = await updatePaciente(patientId, pacienteData);
      
      toast({
        title: "Sucesso",
        description: "Observações salvas com sucesso.",
      });
      setIsNotesModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar observações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar observações.",
        variant: "destructive",
      });
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

  const handleEditSessionRecord = (session: any) => {
    setSelectedSession(session);
    setIsSessionRecordModalOpen(true);
  };

  const handleSaveSessionRecord = async (sessionId: string, observacao: string) => {
    try {
      await apiService.updateSessionRecord(sessionId, observacao);
      
      // Atualizar a sessão na lista local
      setPatientAppointments(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, observacao, notes: observacao } 
            : session
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Registro da sessão salvo com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao salvar registro da sessão:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar registro da sessão.",
        variant: "destructive",
      });
      throw error;
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
    // Verificar se o valor é válido
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00';
    }
    
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
                    <span key="phone" className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      {patient.phone}
                    </span>
                  )}
                  {patient.email && (
                    <span key="email" className="flex items-center gap-2">
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
                    <Badge key="age-group" variant="outline" className="bg-white/10 dark:bg-white/5 text-white border-white/20 dark:border-white/10 text-base px-4 py-2">
                      {patient.age_group}
                    </Badge>
                  )}
                  {patient.is_minor && (
                    <Badge key="is-minor" variant="outline" className="bg-yellow-500/15 dark:bg-yellow-400/10 text-white border-yellow-300/20 dark:border-yellow-400/10 text-base px-4 py-2">
                      <Shield className="w-4 h-4 mr-2" />
                      Menor de Idade
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => setIsEditModalOpen(true)}
                className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                <span className="text-sm font-medium">Editar</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleStatusChange}
                className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
              >
                {patient.status === "ativo" ? (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Desativar</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Ativar</span>
                  </>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleDeletePatient}
                className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Deletar</span>
              </Button>
            </div>
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
                    {isFinancialVisible 
                      ? formatCurrency(
                          patientFinancials
                            .filter(f => f.status === "pago" || f.status === "confirmado")
                            .reduce((sum, f) => {
                              const amount = Number(f.amount) || 0;
                              return sum + amount;
                            }, 0)
                        )
                      : "••••••••"
                    }
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
                  <p className="text-sm text-muted-foreground">Remarcações</p>
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">
                    Nenhuma remarcação
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
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">
                    Nenhum arquivo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Abas Principal */}
        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/90 dark:bg-gray-800/80 shadow-lg border h-16 backdrop-blur-sm">
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
            <TabsTrigger value="anamnese" className="flex items-center gap-2 text-lg h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="w-5 h-5" />
              Anamnese
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
                <div key="medical-info">
                  <Separator className="my-10" />
                  <div className="space-y-8">
                    <h4 className="font-bold text-xl flex items-center gap-3 text-primary border-b pb-3">
                      <Heart className="w-6 h-6" />
                      Informações Médicas e Observações
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contatos de Emergência</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEmergencyContactModalOpen(true)}
                              className="text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Gerenciar
                            </Button>
                          </div>
                          {emergencyContacts.length > 0 ? (
                            <div className="space-y-2">
                              {emergencyContacts.map((contact, idx) => (
                                <div key={contact.id || idx} className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-800/30">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-red-900 dark:text-red-100">{contact.nome}</p>
                                      <p className="text-sm text-red-700 dark:text-red-300">{contact.telefone}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveEmergencyContact(contact.id)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-muted-foreground">Nenhum contato de emergência registrado</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Heart className="w-6 h-6 text-orange-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medicações</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsMedicationModalOpen(true)}
                              className="text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Gerenciar
                            </Button>
                          </div>
                          {medications.length > 0 ? (
                            <div className="space-y-2">
                              {medications.map((med, idx) => (
                                <div key={med.id || idx} className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800/30">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-orange-900 dark:text-orange-100">{med.nome}</p>
                                      <p className="text-sm text-orange-700 dark:text-orange-300">{med.prescricao}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMedication(med.id)}
                                      className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-muted-foreground">Nenhuma medicação registrada</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mt-6">
                      <MessageSquare className="w-6 h-6 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Observações Gerais</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsNotesModalOpen(true)}
                            className="text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                        <p className="text-lg font-medium leading-relaxed">
                          {notes || "Nenhuma observação registrada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anamnese" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <ClipboardList className="w-6 h-6" />
                  Anamnese
                </CardTitle>
                <CardDescription>
                  Responda às perguntas padrão de anamnese
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-3 items-center">
                  <Label>Tipo</Label>
                  <Badge variant="outline">{anamneseTipo === 'menor' ? 'Menor' : 'Adulto'}</Badge>
                  <Button className="ml-auto" onClick={async () => {
                    if (!patientId) return;
                    await apiService.upsertAnamnese({ pacienteId: patientId, tipo: anamneseTipo, respostas: anamneseRespostas });
                    toast({ title: 'Sucesso', description: 'Anamnese salva com sucesso.' });
                  }}>Salvar</Button>
                </div>

                {/* Perguntas padrão - Adulto */}
                {anamneseTipo === 'adulto' && (
                  <div className="space-y-4">
                    {adultoPerguntas.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label>{q}</Label>
                        <Textarea
                          value={anamneseRespostas[idx]?.toString() || ''}
                          onChange={(e) => setAnamneseRespostas({ ...anamneseRespostas, [idx]: e.target.value })}
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Perguntas padrão - Menor */}
                {anamneseTipo === 'menor' && (
                  <div className="space-y-4">
                    {menorPerguntas.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label>{q}</Label>
                        <Textarea
                          value={anamneseRespostas[idx]?.toString() || ''}
                          onChange={(e) => setAnamneseRespostas({ ...anamneseRespostas, [idx]: e.target.value })}
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
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
                  <h3 className="text-xl font-semibold mb-2">Prontuário Psicológico</h3>
                  <p className="text-muted-foreground mb-6">
                    Acesse o prontuário completo com todas as informações do paciente, 
                    avaliação da demanda, evolução das sessões e anexos.
                  </p>
                  <Button 
                    onClick={() => navigate(`/prontuarios/${patientId}`)}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Acessar Prontuário Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessoes" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  Histórico de Sessões
                </CardTitle>
                <CardDescription>
                  Todas as sessões agendadas e realizadas para este paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {patientAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma sessão encontrada</h3>
                    <p className="text-muted-foreground">Este paciente ainda não possui sessões agendadas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold">Total de Sessões: {patientAppointments.length}</h4>
                      <Badge variant="outline" className="text-sm">
                        {patientAppointments.filter(a => a.status === "realizado").length} realizadas
                      </Badge>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Modalidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Observações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientAppointments
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {appointment.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {appointment.modality}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  appointment.status === "realizado" ? "default" :
                                  appointment.status === "agendado" ? "secondary" :
                                  appointment.status === "em_andamento" ? "outline" : "destructive"
                                }
                                className="text-xs"
                              >
                                {appointment.status === "realizado" ? "✓ Realizado" :
                                 appointment.status === "agendado" ? "⏰ Agendado" :
                                 appointment.status === "em_andamento" ? "🔄 Em Andamento" : "❌ Cancelado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {appointment.value ? formatCurrency(appointment.value) : "-"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {appointment.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSessionRecord(appointment)}
                                className="h-8 px-2"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Editar Registro
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <DollarSign className="w-6 h-6" />
                  Registros Financeiros
                </CardTitle>
                <CardDescription>
                  Histórico completo de pagamentos e transações financeiras
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {patientFinancials.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum registro financeiro</h3>
                    <p className="text-muted-foreground">Este paciente ainda não possui registros financeiros.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-800 dark:text-green-200">Total Pago</span>
                          </div>
                          <div className="text-xl font-bold text-green-900 dark:text-green-100">
                            {isFinancialVisible 
                              ? formatCurrency(
                                  patientFinancials
                                    .filter(f => f.status === "pago" || f.status === "confirmado")
                                    .reduce((sum, f) => sum + f.amount, 0)
                                )
                              : "••••••••"
                            }
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Pendente</span>
                          </div>
                          <div className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                            {isFinancialVisible 
                              ? formatCurrency(
                                  patientFinancials
                                    .filter(f => f.status === "pendente")
                                    .reduce((sum, f) => {
                                      const amount = Number(f.amount) || 0;
                                      return sum + amount;
                                    }, 0)
                                )
                              : "••••••••"
                            }
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-semibold text-red-800 dark:text-red-200">Cancelado</span>
                          </div>
                          <div className="text-xl font-bold text-red-900 dark:text-red-100">
                            {isFinancialVisible 
                              ? formatCurrency(
                                  patientFinancials
                                    .filter(f => f.status === "cancelado")
                                    .reduce((sum, f) => sum + f.amount, 0)
                                )
                              : "••••••••"
                            }
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Total Geral</span>
                          </div>
                          <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            {isFinancialVisible 
                              ? formatCurrency(
                                  patientFinancials
                                    .reduce((sum, f) => sum + f.amount, 0)
                                )
                              : "••••••••"
                            }
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Tabela de Pagamentos */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Histórico de Pagamentos</h4>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patientFinancials
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-medium">
                                {format(new Date(payment.date), "dd/MM/yyyy", { locale: ptBR })}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {payment.description}
                              </TableCell>
                              <TableCell className="font-bold">
                                {isFinancialVisible 
                                  ? formatCurrency(payment.amount)
                                  : "••••••••"
                                }
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {payment.payment_method}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    payment.status === "pago" || payment.status === "confirmado" ? "default" :
                                    payment.status === "pendente" ? "secondary" : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {payment.status === "pago" ? "✓ Pago" :
                                   payment.status === "confirmado" ? "✓ Confirmado" :
                                   payment.status === "pendente" ? "⏰ Pendente" : "❌ Cancelado"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arquivos" className="space-y-6 mt-10">
            <Card className="shadow-xl">
              <CardContent className="p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Arquivos do Paciente</h3>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !patientId) return;
                        try {
                          setFileUploading(true);
                          await apiService.uploadPacienteFile(patientId, file);
                          const files = await apiService.getPacienteFiles(patientId);
                          setPatientFiles(files || []);
                        } finally {
                          setFileUploading(false);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button disabled={fileUploading} variant="outline" size="sm" asChild>
                      <span>{fileUploading ? 'Enviando...' : 'Enviar Arquivo'}</span>
                    </Button>
                  </label>
                </div>

                {(!patientFiles || patientFiles.length === 0) ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum arquivo enviado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientFiles.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[50vw]">{file.nome}</p>
                          <p className="text-xs text-muted-foreground">{file.tipo || 'arquivo'} • {(file.tamanho || 0) / 1024 | 0} KB</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.url && (
                            <Button asChild size="sm" variant="outline">
                              <a href={file.url} target="_blank" rel="noreferrer">Abrir</a>
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={async () => {
                            await apiService.deletePacienteFile(patientId, file.id);
                            const files = await apiService.getPacienteFiles(patientId);
                            setPatientFiles(files || []);
                          }}>Excluir</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            // Limpar dados de busca quando fechar o modal
            setAddressSearchData({ cep: '', street: '', city: '', state: '' });
            clearAddress();
          }
        }}>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Buscar Endereço</Label>
                  <div className="flex gap-2">
                    <Select value={addressSearchType} onValueChange={(value: 'cep' | 'street') => setAddressSearchType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cep">Por CEP</SelectItem>
                        <SelectItem value="street">Por Rua</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSearchAddress}
                      disabled={addressLoading}
                      className="flex-shrink-0"
                    >
                      {addressLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>

                {addressSearchType === 'cep' ? (
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      placeholder="00000-000"
                      value={addressSearchData.cep}
                      onChange={(e) => setAddressSearchData({ ...addressSearchData, cep: formatCEP(e.target.value) })}
                      maxLength={9}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>Rua</Label>
                      <Input
                        placeholder="Nome da rua"
                        value={addressSearchData.street}
                        onChange={(e) => setAddressSearchData({ ...addressSearchData, street: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        placeholder="Nome da cidade"
                        value={addressSearchData.city}
                        onChange={(e) => setAddressSearchData({ ...addressSearchData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={addressSearchData.state} onValueChange={(value) => setAddressSearchData({ ...addressSearchData, state: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Endereço Completo</Label>
                  <Textarea
                    placeholder="Endereço completo (será preenchido automaticamente ou pode ser editado manualmente)"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    rows={3}
                  />
                </div>
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

        {/* Modal de Gerenciamento de Medicamentos */}
        <Dialog open={isMedicationModalOpen} onOpenChange={setIsMedicationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-500" />
                Gerenciar Medicações
              </DialogTitle>
              <DialogDescription>
                Adicione, edite ou remova medicamentos do paciente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Lista de medicamentos existentes */}
              {medications.filter(Boolean).length > 0 && (
                <div key="existing-medications" className="space-y-4">
                  <h4 className="font-semibold text-sm">Medicações Atuais</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {medications.filter(Boolean).map((med, idx) => (
                      <div key={med.id || idx} className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-orange-900 dark:text-orange-100">{med.nome}</p>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">{med.prescricao}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(med.id)}
                            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário para adicionar novo medicamento */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Adicionar Nova Medicação</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication-name">Nome do Medicamento *</Label>
                    <Input
                      id="medication-name"
                      placeholder="Ex: Paracetamol, Ibuprofeno..."
                      value={newMedication.nome}
                      onChange={(e) => setNewMedication({ ...newMedication, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medication-prescription">Prescrição do Médico</Label>
                    <Textarea
                      id="medication-prescription"
                      placeholder="Ex: 1 comprimido de 500mg a cada 6 horas, com alimentos..."
                      value={newMedication.prescricao}
                      onChange={(e) => setNewMedication({ ...newMedication, prescricao: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMedicationModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddMedication}
                disabled={!newMedication.nome.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Medicamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Gerenciamento de Contatos de Emergência */}
        <Dialog open={isEmergencyContactModalOpen} onOpenChange={setIsEmergencyContactModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Gerenciar Contatos de Emergência
              </DialogTitle>
              <DialogDescription>
                Adicione ou remova contatos de emergência do paciente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Lista de contatos existentes */}
              {emergencyContacts.length > 0 && (
                <div key="existing-contacts" className="space-y-4">
                  <h4 className="font-semibold text-sm">Contatos Atuais</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {emergencyContacts.map((contact, idx) => (
                      <div key={contact.id || idx} className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-red-900 dark:text-red-100">{contact.nome}</p>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{contact.telefone}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmergencyContact(contact.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário para adicionar novo contato */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Adicionar Novo Contato</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Nome do Responsável *</Label>
                    <Input
                      id="contact-name"
                      placeholder="Ex: Maria Silva, João Santos..."
                      value={newEmergencyContact.nome}
                      onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Telefone *</Label>
                    <Input
                      id="contact-phone"
                      placeholder="Ex: (11) 99999-9999"
                      value={newEmergencyContact.telefone}
                      onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, telefone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmergencyContactModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddEmergencyContact}
                disabled={!newEmergencyContact.nome.trim() || !newEmergencyContact.telefone.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Contato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Observações */}
        <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Editar Observações Gerais
              </DialogTitle>
              <DialogDescription>
                Adicione ou edite observações gerais sobre o paciente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  placeholder="Digite aqui as observações gerais sobre o paciente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNotesModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNotes}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Observações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Registro de Sessão */}
        <SessionRecordModal
          session={selectedSession}
          open={isSessionRecordModalOpen}
          onOpenChange={setIsSessionRecordModalOpen}
          onSave={handleSaveSessionRecord}
          loading={actionLoading}
        />
      </div>
    </div>
  );
}