import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, MoreHorizontal, Calendar, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";

interface PatientData {
  id: string;
  name: string;
  lastSession?: string;
  nextSession?: string;
  status: "ativo" | "inativo";
  sessionsCount: number;
  initials: string;
}

function PatientCard({ patient }: { patient: PatientData }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createAppointment } = useAppointments();
  const { createRecord } = useMedicalRecords();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "presencial",
    notes: ""
  });

  const [recordForm, setRecordForm] = useState({
    title: "",
    content: "",
    category: "evolucao" as const
  });

  const handleCreateSchedule = async () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      toast({
        title: "Erro",
        description: "Data e horário são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const success = await createAppointment({
      patient_id: patient.id,
      date: scheduleForm.date,
      time: scheduleForm.time,
      duration: 50,
      type: "consulta",
      modality: scheduleForm.type === "presencial" ? "presencial" : "online",
      status: "agendado",
      notes: scheduleForm.notes
    });

    if (success) {
      setIsScheduleModalOpen(false);
      setScheduleForm({ date: "", time: "", type: "presencial", notes: "" });
    }
  };

  const handleCreateRecord = async () => {
    if (!recordForm.title || !recordForm.content) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const success = await createRecord({
      patient_id: patient.id,
      title: recordForm.title,
      content: recordForm.content,
      category: recordForm.category
    });

    if (success) {
      setIsRecordModalOpen(false);
      setRecordForm({ title: "", content: "", category: "evolucao" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case "inativo":
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {patient.initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{patient.name}</p>
            {getStatusBadge(patient.status)}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-muted-foreground">
              {patient.sessionsCount} sessões
            </span>
            {patient.lastSession && (
              <span className="text-xs text-muted-foreground">
                Último: {formatDate(patient.lastSession)}
              </span>
            )}
            {patient.nextSession && (
              <span className="text-xs text-primary">
                Próximo: {formatDate(patient.nextSession)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Calendar className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Sessão</DialogTitle>
              <DialogDescription>Nova sessão para {patient.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={scheduleForm.type} onValueChange={(value) => setScheduleForm({...scheduleForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Anotações sobre a sessão..."
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSchedule}>
                  Agendar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <FileText className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Registro</DialogTitle>
              <DialogDescription>Adicionar ao prontuário de {patient.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Título do registro..."
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({...recordForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={recordForm.category} onValueChange={(value: any) => setRecordForm({...recordForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anamnese">Anamnese</SelectItem>
                    <SelectItem value="evolucao">Evolução</SelectItem>
                    <SelectItem value="plano_terapeutico">Plano Terapêutico</SelectItem>
                    <SelectItem value="avaliacao">Avaliação</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo *</Label>
                <Textarea
                  placeholder="Conteúdo do registro..."
                  rows={4}
                  value={recordForm.content}
                  onChange={(e) => setRecordForm({...recordForm, content: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRecordModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateRecord}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/pacientes")}>
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/arquivos")}>
              Ver arquivos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/financeiro")}>
              Histórico financeiro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function RecentPatients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patients } = usePatients();
  const { appointments } = useAppointments();

  // Processar dados dos pacientes para o dashboard
  const recentPatients = useMemo(() => {
    // Pegar pacientes ativos, ordenados por última sessão
    const activePatients = patients
      .filter(p => p.status === "ativo")
      .slice(0, 5); // Mostrar apenas os 5 mais recentes

    return activePatients.map(patient => {
      // Buscar sessões do paciente
      const patientAppointments = appointments.filter(apt => apt.patient_id === patient.id);
      
      // Encontrar última sessão realizada
      const lastSession = patientAppointments
        .filter(apt => apt.status === "realizado")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      // Encontrar próxima sessão agendada
      const nextSession = patientAppointments
        .filter(apt => apt.status === "agendado" && new Date(apt.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      const sessionsCount = patientAppointments.filter(apt => apt.status === "realizado").length;

      return {
        id: patient.id,
        name: patient.name,
        lastSession: lastSession?.date,
        nextSession: nextSession?.date,
        status: patient.status as "ativo" | "inativo",
        sessionsCount,
        initials: patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
    });
  }, [patients, appointments]);

  const handleViewAllPatients = () => {
    navigate("/pacientes");
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          Pacientes Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        {recentPatients.length === 0 ? (
          <div className="text-center py-12 relative z-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Nenhum paciente ativo
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Cadastre seus primeiros pacientes para começar
            </p>
            <Button 
              variant="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground relative z-30" 
              onClick={handleViewAllPatients}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Paciente
            </Button>
          </div>
        ) : (
          recentPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        )}
        
        {recentPatients.length > 0 && (
          <div className="pt-4 border-t border-border relative z-20">
            <Button 
              variant="outline" 
              className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors relative z-30" 
              onClick={handleViewAllPatients}
            >
              <Users className="w-4 h-4 mr-2" />
              Ver Todos os Pacientes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}