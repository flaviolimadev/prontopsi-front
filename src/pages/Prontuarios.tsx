import { useState, useEffect } from "react";
import { FileText, Plus, Lock, Calendar, User, Search, Paperclip, Edit, Save, Download, Upload, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { generateProntuarioPDF } from "@/components/prontuario/ProntuarioPDF";
import { usePatients } from "@/hooks/usePatients";
import { apiService } from "@/services/api.service";
import { useAgendaSessoes } from "@/hooks/useAgendaSessoes";
import { useProntuarios, ProntuarioUpdateData } from "@/hooks/useProntuarios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProntuarioEntry {
  id: string;
  date: string;
  type: 'avaliacao' | 'evolucao' | 'encaminhamento';
  content: string;
  psychologist: string;
}

interface Anexo {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

export default function Prontuarios() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { toast } = useToast();
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [isAnexoModalOpen, setIsAnexoModalOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Dados do prontuário
  const [prontuarioData, setProntuarioData] = useState({
    avaliacaoDemanda: "",
    evolucao: [] as ProntuarioEntry[],
    encaminhamento: "",
    anexos: [] as Anexo[]
  });

  // Hooks para integração com backend
  const { getProntuario, saveProntuario, addEvolucao, deleteEvolucao, addAnexo, deleteAnexo, loading } = useProntuarios();
  const { agendaSessoes } = useAgendaSessoes();

  const [newEntryForm, setNewEntryForm] = useState({
    type: 'evolucao' as 'avaliacao' | 'evolucao' | 'encaminhamento',
    content: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Utilitário para interpretar datas YYYY-MM-DD como data local (evita voltar 1 dia por fuso)
  const toLocalDate = (yyyyMMdd?: string) => {
    if (!yyyyMMdd) return null;
    const [y, m, d] = yyyyMMdd.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  // Reset quando patientId mudar
  useEffect(() => {
    if (patientId) {
      setIsDataLoaded(false);
      setSelectedPatient(null);
    }
  }, [patientId]);

  // Carregar dados do paciente
  useEffect(() => {
    console.log('useEffect - patientId:', patientId);
    console.log('useEffect - patients.length:', patients.length);
    console.log('useEffect - isDataLoaded:', isDataLoaded);
    
    if (patientId && patients.length > 0 && !isDataLoaded) {
      const patient = patients.find(p => p.id === patientId);
      console.log('Paciente encontrado:', patient);
      
      if (patient) {
        setSelectedPatient(patient);
        // Aqui você carregaria os dados do prontuário do backend
        loadProntuarioData(patientId);
        setIsDataLoaded(true);
      } else {
        console.log('Paciente não encontrado, redirecionando...');
        navigate("/pacientes");
      }
    }
  }, [patientId, patients.length, isDataLoaded]);

  const loadProntuarioData = async (patientId: string) => {
    console.log('Carregando dados do prontuário para paciente:', patientId);
    try {
      const prontuario = await getProntuario(patientId);
      console.log('Dados do prontuário carregados:', prontuario);

      // Normalizar prontuário mesmo se vier nulo/indefinido
      const prontuarioNormalizado = {
        avaliacaoDemanda: prontuario?.avaliacaoDemanda || "",
        encaminhamento: prontuario?.encaminhamento || "",
        evolucao: prontuario?.evolucao || [],
        anexos: prontuario?.anexos || [],
      } as { avaliacaoDemanda: string; encaminhamento: string; evolucao: ProntuarioEntry[]; anexos: Anexo[] };
      console.log('Prontuário normalizado:', prontuarioNormalizado);

      // Buscar também arquivos enviados na página do paciente e exibir aqui
      try {
        const files = await apiService.getPacienteFiles(patientId);
        const mappedFromPaciente: Anexo[] = (files || []).map((f: any) => {
          const created = f.createdAt || f.uploadedAt || f.data || f.created_at;
          const dateStr = created ? new Date(created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          return {
            id: f.id,
            name: f.nome || f.name || 'arquivo',
            type: f.tipo || f.type || 'arquivo',
            size: `${((f.tamanho || f.size || 0) / 1024) | 0} KB`,
            uploadDate: dateStr,
          };
        });

        // Mesclar, evitando duplicados por id
        const existingIds = new Set(prontuarioNormalizado.anexos.map((a: Anexo) => a.id));
        const mergedAnexos = [
          ...prontuarioNormalizado.anexos,
          ...mappedFromPaciente.filter((a) => a && a.id && !existingIds.has(a.id)),
        ];

        setProntuarioData({ ...prontuarioNormalizado, anexos: mergedAnexos });
      } catch (e) {
        // Fallback: se não conseguir buscar arquivos do paciente, manter apenas os anexos do prontuário
        setProntuarioData(prontuarioNormalizado);
      }
    } catch (error) {
      console.error('Erro ao carregar prontuário:', error);
    }
  };

  const handleSaveProntuario = async () => {
    console.log('Salvando prontuário - patientId:', patientId);
    console.log('Dados do prontuário:', prontuarioData);
    
    if (!patientId) {
      console.error('patientId não encontrado');
      toast({
        title: "Erro",
        description: "ID do paciente não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Enviar apenas os campos editáveis, sem sobrescrever evoluções e anexos
    const dataToSave: ProntuarioUpdateData = {
      pacienteId: patientId,
      avaliacaoDemanda: prontuarioData.avaliacaoDemanda,
      encaminhamento: prontuarioData.encaminhamento
      // NÃO incluir evolucao e anexos para não sobrescrever
    };
    
    console.log('Dados que serão salvos (sem evoluções/anexos):', dataToSave);
    
    const success = await saveProntuario(dataToSave);
    
    if (success) {
      // Recarregar dados do prontuário para sincronizar o estado
      await loadProntuarioData(patientId);
      setIsEditMode(false);
    }
  };

  const handleAddEntry = async () => {
    console.log('Adicionando entrada - patientId:', patientId);
    console.log('Formulário:', newEntryForm);
    
    if (!newEntryForm.content.trim() || !patientId) {
      toast({
        title: "Erro",
        description: "Conteúdo é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: ProntuarioEntry = {
      id: Date.now().toString(),
      // Normalizar para ISO local (meia-noite local) evitando fuso
      date: toLocalDate(newEntryForm.date)?.toISOString().split('T')[0] || newEntryForm.date,
      type: newEntryForm.type,
      content: newEntryForm.content,
      psychologist: "Dra. Maria Silva" // Substitua pelo usuário logado
    };

    console.log('Nova entrada criada:', newEntry);
    const success = await addEvolucao(patientId, newEntry);
    
    if (success) {
      // Recarregar dados do prontuário
      await loadProntuarioData(patientId);
      
      setNewEntryForm({
        type: 'evolucao',
        content: "",
        date: new Date().toISOString().split('T')[0]
      });
      setIsNewEntryModalOpen(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!patientId) return;
    
    const success = await deleteEvolucao(patientId, entryId);
    
    if (success) {
      // Recarregar dados do prontuário
      await loadProntuarioData(patientId);
    }
  };

  const handleUploadAnexo = async (file: File) => {
    if (!patientId) return;
    
    const newAnexo: Anexo = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    const success = await addAnexo(patientId, newAnexo);
    
    if (success) {
      // Recarregar dados do prontuário
      await loadProntuarioData(patientId);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedPatient) return;

    try {
      // Debug: verificar dados do paciente
      console.log('=== DADOS DO PACIENTE ===');
      console.log('selectedPatient:', selectedPatient);
      console.log('selectedPatient.name:', selectedPatient.name);
      console.log('selectedPatient.nome:', selectedPatient.nome);
      console.log('selectedPatient.cpf:', selectedPatient.cpf);
      console.log('selectedPatient.address:', selectedPatient.address);
      console.log('selectedPatient.endereco:', selectedPatient.endereco);
      console.log('selectedPatient.birthDate:', selectedPatient.birthDate);
      console.log('selectedPatient.nascimento:', selectedPatient.nascimento);
      console.log('selectedPatient.profession:', selectedPatient.profession);
      console.log('selectedPatient.profissao:', selectedPatient.profissao);
      console.log('selectedPatient.phone:', selectedPatient.phone);
      console.log('selectedPatient.telefone:', selectedPatient.telefone);
      console.log('selectedPatient.email:', selectedPatient.email);

      // Debug: verificar dados do prontuário
      console.log('=== DADOS DO PRONTUÁRIO ===');
      console.log('prontuarioData:', prontuarioData);
      console.log('prontuarioData.avaliacaoDemanda:', prontuarioData.avaliacaoDemanda);
      console.log('prontuarioData.encaminhamento:', prontuarioData.encaminhamento);
      console.log('prontuarioData.evolucao:', prontuarioData.evolucao);
      console.log('prontuarioData.anexos:', prontuarioData.anexos);

      // Preparar dados reais para o PDF (sem placeholders)
      const evolucao = (prontuarioData.evolucao || []).map(entry => ({
        data: entry.date,
        registro: entry.content
      }));

      const dadosPDF = {
        paciente: {
          nome: selectedPatient.name || 'Não informado',
          cpf: selectedPatient.cpf || 'Não informado',
          endereco: selectedPatient.address || 'Não informado',
          nascimento: selectedPatient.birth_date || 'Não informado',
          profissao: selectedPatient.profession || 'Não informado',
          telefone: selectedPatient.phone || 'Não informado',
          email: selectedPatient.email || 'Não informado'
        },
        evolucao,
        avaliacaoDemanda: prontuarioData.avaliacaoDemanda || '',
        encaminhamento: prontuarioData.encaminhamento || '',
        anexos: (prontuarioData.anexos || []).map(anexo => `${anexo.name} (${anexo.uploadDate})`).join(', ')
      };

      console.log('=== DADOS FINAIS PARA PDF ===');
      console.log('dadosPDF:', dadosPDF);

      await generateProntuarioPDF(dadosPDF);

      toast({
        title: "Sucesso",
        description: "PDF do prontuário gerado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF do prontuário.",
        variant: "destructive",
      });
    }
  };

  if (!patientId) {
    // Página de listagem de prontuários
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prontuários Psicológicos</h1>
            <p className="text-gray-600 mt-1">Selecione um paciente para acessar seu prontuário</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={getAvatarUrl(patient.avatar)} 
                      className="object-cover"
                      alt={`Avatar de ${patient.name}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-sm text-gray-600">{patient.email || "Sem email"}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CPF:</span>
                    <span>{patient.cpf || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Telefone:</span>
                    <span>{patient.phone || "Não informado"}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/prontuarios/${patient.id}`)}
                  className="w-full gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Acessar Prontuário
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {patients.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-600 mb-4">
              Adicione pacientes para começar a criar prontuários psicológicos.
            </p>
            <Button onClick={() => navigate("/pacientes")}>
              Ir para Pacientes
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Carregando...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/pacientes/${patientId}`)}
            className="gap-2"
          >
            ← Voltar ao Perfil
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={getAvatarUrl(selectedPatient.avatar)} 
                className="object-cover"
                alt={`Avatar de ${selectedPatient.name}`}
              />
              <AvatarFallback className="text-lg font-bold">
                {selectedPatient.name?.charAt(0)?.toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Prontuário Psicológico</h1>
              <p className="text-muted-foreground mt-1">Paciente: {selectedPatient.name}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditMode ? "Salvar" : "Editar"}
          </Button>
          {isEditMode && (
            <Button onClick={handleSaveProntuario}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          )}
        </div>
                </div>

      <Tabs defaultValue="dados" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dados">Dados do Paciente</TabsTrigger>
          <TabsTrigger value="avaliacao">Avaliação da Demanda</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="encaminhamento">Encaminhamento</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        {/* Dados do Paciente */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={selectedPatient.name} disabled />
                </div>
              <div>
                <Label>CPF</Label>
                <Input value={selectedPatient.cpf || "Não informado"} disabled />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={selectedPatient.address || "Não informado"} disabled />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <Input value={selectedPatient.birth_date || "Não informado"} disabled />
              </div>
              <div>
                <Label>Profissão</Label>
                <Input value={selectedPatient.profession || "Não informado"} disabled />
              </div>
              <div>
                <Label>Telefone de Contato</Label>
                <Input value={selectedPatient.phone || "Não informado"} disabled />
            </div>
              <div>
                <Label>E-mail</Label>
                <Input value={selectedPatient.email || "Não informado"} disabled />
      </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avaliação da Demanda */}
        <TabsContent value="avaliacao" className="space-y-4">
      <Card>
            <CardHeader>
              <CardTitle>Avaliação da Demanda e Definição dos Objetivos do Trabalho</CardTitle>
              <p className="text-sm text-muted-foreground">
                Descrever o motivo da busca por atendimento psicológico e os objetivos terapêuticos iniciais, 
                bem como a metodologia a ser adotada no processo terapêutico.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prontuarioData.avaliacaoDemanda}
                onChange={(e) => setProntuarioData(prev => ({ ...prev, avaliacaoDemanda: e.target.value }))}
                disabled={!isEditMode}
                placeholder="Descreva a avaliação da demanda, objetivos terapêuticos e metodologia..."
                rows={10}
                className="min-h-[200px]"
              />
        </CardContent>
      </Card>
        </TabsContent>

        {/* Evolução */}
        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Evolução</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Registro de sessão. Registro sucinto e objetivo das intervenções psicológicas, 
                    observações relevantes e estratégias utilizadas em cada sessão.
                  </p>
                </div>
                {isEditMode && (
                  <Button onClick={() => setIsNewEntryModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Entrada
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seção de Agendamentos do Paciente */}
              {patientId && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <h4 className="font-semibold text-lg">Agendamentos do Paciente</h4>
                  </div>
                  
                  {(() => {
                    const patientAppointments = agendaSessoes.filter(appointment => 
                      appointment.pacienteId === patientId
                    );
                    
                    if (patientAppointments.length === 0) {
                      return (
                        <div className="text-center py-4 text-muted-foreground border border-border rounded-lg bg-muted/30">
                          <Clock className="mx-auto h-8 w-8 mb-2" />
                          <p>Nenhum agendamento encontrado para este paciente.</p>
                        </div>
                      );
                    }
                    
                                         return (
                       <div className="grid gap-3">
                         {patientAppointments
                           .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                           .map((appointment) => (
                           <div key={appointment.id} className="border border-border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors">
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                   <Calendar className="w-4 h-4 text-muted-foreground" />
                                   <span className="font-medium">
                                     {new Date(appointment.data).toLocaleDateString('pt-BR')} às {appointment.horario}
                                   </span>
                                   <Badge variant="outline" className="text-xs">
                                     {appointment.status === 1 ? "✓ Realizado" :
                                      appointment.status === 0 ? "⏰ Agendado" :
                                      appointment.status === 2 ? "🔄 Em Andamento" : "❌ Cancelado"}
                                   </Badge>
                                 </div>
                                 <p className="text-sm text-muted-foreground">
                                   {appointment.tipoDaConsulta} • {appointment.modalidade}
                                 </p>
                                 {appointment.observacao && (
                                   <p className="text-sm text-muted-foreground mt-1">
                                     Obs: {appointment.observacao}
                                   </p>
                                 )}
                               </div>
                               {isEditMode && appointment.status === 1 && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     setNewEntryForm({
                                       type: 'evolucao',
                                       content: "",
                                       date: new Date(appointment.data).toISOString().split('T')[0]
                                     });
                                     setIsNewEntryModalOpen(true);
                                   }}
                                 >
                                   <Plus className="w-3 h-3 mr-1" />
                                   Adicionar Evolução
                      </Button>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     );
                  })()}
                </div>
              )}
              
              <Separator />
              
              {/* Entradas de Evolução */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h4 className="font-semibold text-lg">Entradas de Evolução</h4>
                </div>
                
                {(!prontuarioData.evolucao || prontuarioData.evolucao.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Nenhuma entrada de evolução registrada.</p>
                  </div>
        ) : (
          <div className="space-y-4">
                    {prontuarioData.evolucao.map((entry) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4 space-y-2 bg-card">
                        <div className="flex justify-between items-start">
                          <div>
                      <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{toLocalDate(entry.date)?.toLocaleDateString('pt-BR')}</span>
                              <Badge variant="secondary">{entry.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{entry.psychologist}</p>
                          </div>
                          {isEditMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Separator />
                        <div className="text-sm whitespace-pre-wrap">{entry.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Encaminhamento */}
        <TabsContent value="encaminhamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Encaminhamento e/ou Encerramento</CardTitle>
              <p className="text-sm text-muted-foreground">
                Descrever, se for o caso, os motivos do encaminhamento para outro profissional ou instituição, 
                ou o encerramento do processo terapêutico, incluindo data e justificativa.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prontuarioData.encaminhamento}
                onChange={(e) => setProntuarioData(prev => ({ ...prev, encaminhamento: e.target.value }))}
                disabled={!isEditMode}
                placeholder="Descreva o encaminhamento ou encerramento do processo terapêutico..."
                rows={8}
                className="min-h-[150px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anexos */}
        <TabsContent value="anexos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Anexos</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Anexar cópias de relatórios, pareceres, declarações, termos de consentimento 
                    ou quaisquer outros documentos emitidos durante o acompanhamento.
                  </p>
                </div>
                {isEditMode && (
                  <Button onClick={() => setIsAnexoModalOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Anexo
                  </Button>
                )}
                  </div>
                </CardHeader>
            <CardContent>
              {prontuarioData.anexos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Paperclip className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum anexo adicionado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {prontuarioData.anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{anexo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {anexo.size} • {anexo.uploadDate}
                    </p>
                  </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {isEditMode && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
            ))}
          </div>
        )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Nova Entrada */}
      <Dialog open={isNewEntryModalOpen} onOpenChange={setIsNewEntryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Entrada de Evolução</DialogTitle>
            <DialogDescription>
              Adicione uma nova entrada ao prontuário do paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data da Sessão</Label>
              <Input
                type="date"
                value={newEntryForm.date}
                onChange={(e) => setNewEntryForm(prev => ({ ...prev, date: e.target.value }))}
              />
      </div>
            <div>
              <Label>Tipo de Entrada</Label>
              <Select
                value={newEntryForm.type}
                onValueChange={(value: 'avaliacao' | 'evolucao' | 'encaminhamento') => 
                  setNewEntryForm(prev => ({ ...prev, type: value }))
                }
              >
              <SelectTrigger>
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="evolucao">Evolução</SelectItem>
                <SelectItem value="avaliacao">Avaliação</SelectItem>
                  <SelectItem value="encaminhamento">Encaminhamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div>
              <Label>Conteúdo</Label>
          <Textarea 
                value={newEntryForm.content}
                onChange={(e) => setNewEntryForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descreva as observações, intervenções e estratégias utilizadas..."
                rows={8}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNewEntryModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEntry}>
              Adicionar Entrada
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Anexo */}
      <Dialog open={isAnexoModalOpen} onOpenChange={setIsAnexoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Anexo</DialogTitle>
            <DialogDescription>
              Selecione um arquivo para anexar ao prontuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Arraste e solte um arquivo aqui, ou clique para selecionar
              </p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadAnexo(file);
                    setIsAnexoModalOpen(false);
                  }
                }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" className="mt-2">
                  Selecionar Arquivo
              </Button>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}