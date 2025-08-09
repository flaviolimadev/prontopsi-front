
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, User, Calendar, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAgendaSessoesReal } from "@/hooks/useAgendaSessoesReal";
import { usePacientes } from "@/hooks/usePacientes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/utils/avatarUtils";

function AppointmentCard({ appointment, patientName, patientAvatar }: { appointment: any; patientName: string; patientAvatar?: string | null }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="secondary">Agendado</Badge>;
      case "em_andamento":
        return <Badge className="bg-blue-500 text-white">Em Andamento</Badge>;
      case "realizado":
        return <Badge variant="outline" className="border-green-500 text-green-700">Realizado</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Agendado</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "agendado":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "em_andamento":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "realizado":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "cancelado":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const isPast = appointment.status === "realizado";

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md",
      isPast ? "bg-muted/30 border-muted" : "bg-card border-border hover:bg-muted/20 hover:border-primary/20"
    )}>
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border border-primary/20">
          <AvatarImage 
            src={getAvatarUrl(patientAvatar)} 
            className="object-cover"
            alt={`Avatar de ${patientName}`}
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{appointment.time}</span>
            <span className="text-sm text-muted-foreground">({appointment.duration}min)</span>
            {getStatusIcon(appointment.status)}
          </div>
          <p className="font-semibold text-foreground mb-1">{patientName}</p>
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge(appointment.status)}
            <Badge variant="outline" className="text-xs">
              {appointment.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {appointment.modality}
            </Badge>
          </div>
          {appointment.notes && (
            <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TodaySchedule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { agendaSessoes = [], createAgendaSessao, loading, error } = useAgendaSessoesReal();
  const { pacientes = [] } = usePacientes();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    patient: "",
    date: "",
    time: "",
    type: "presencial",
    notes: ""
  });

  // Função para formatar data no formato YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filtrar agendamentos de hoje e combinar com dados dos pacientes
  const today = formatDateToYYYYMMDD(new Date());
  

  
  const todayAppointments = agendaSessoes
    .filter(sessao => {
      console.log(`📅 Comparando: sessao.data="${sessao.data}" com today="${today}"`);
      return sessao.data === today;
    })
    .map(sessao => {
      const paciente = pacientes.find(p => p.id === sessao.pacienteId);
      return {
        ...sessao,
        patientName: paciente?.nome || 'Paciente não encontrado',
        patientAvatar: paciente?.avatar || null,
        // Mapear status numérico para string para compatibilidade
        status: sessao.status === 0 ? "agendado" : 
                sessao.status === 1 ? "em_andamento" :
                sessao.status === 2 ? "realizado" : "cancelado",
        // Mapear campos para compatibilidade
        date: sessao.data,
        time: sessao.horario,
        duration: sessao.duracao,
        type: sessao.tipoDaConsulta,
        modality: sessao.modalidade,
        notes: sessao.observacao
      };
    });
  
  const upcomingAppointments = todayAppointments.filter(
    apt => apt.status === "agendado"
  );
  const completedAppointments = todayAppointments.filter(
    apt => apt.status === "realizado"
  );

  const handleCreateSchedule = async () => {
    if (!scheduleForm.patient || !scheduleForm.date || !scheduleForm.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAgendaSessao({
        pacienteId: scheduleForm.patient,
        data: scheduleForm.date,
        horario: scheduleForm.time,
        duracao: 50,
        tipoDaConsulta: "consulta",
        modalidade: scheduleForm.type,
        tipoAtendimento: "individual",
        status: 0, // agendado
        observacao: scheduleForm.notes,
        value: 0
      });

      toast({
        title: "Sessão agendada!",
        description: `Sessão marcada para ${scheduleForm.date} às ${scheduleForm.time}.`
      });
      
      setIsScheduleModalOpen(false);
      setScheduleForm({ patient: "", date: "", time: "", type: "presencial", notes: "" });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível agendar a sessão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Agenda de Hoje
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            {new Date(today).toLocaleDateString('pt-BR')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Carregando agendamentos...</p>
          </div>
        )}
        
        {!loading && upcomingAppointments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Próximas Sessões</h4>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  patientName={appointment.patientName}
                  patientAvatar={appointment.patientAvatar}
                />
              ))}
            </div>
          </div>
        )}
        
        {!loading && completedAppointments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Sessões Realizadas</h4>
            <div className="space-y-3">
              {completedAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  patientName={appointment.patientName}
                  patientAvatar={appointment.patientAvatar}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && todayAppointments.length === 0 && (
          <div className="text-center py-12 relative z-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Nenhuma sessão programada para hoje
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Que tal planejar sua agenda e agendar novas sessões?
            </p>
            <Button 
              variant="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground relative z-30" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Agendar Nova Sessão clicked - navigating to agenda");
                navigate("/agenda");
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar Nova Sessão
            </Button>
          </div>
        )}

        {!loading && todayAppointments.length > 0 && (
          <div className="pt-4 border-t border-border relative z-20">
            <Button 
              variant="outline" 
              className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors relative z-30" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Ver Agenda Completa clicked");
                navigate("/agenda");
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Ver Agenda Completa
            </Button>
          </div>
        )}

        {/* Modal de agendamento rápido */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nova Sessão</DialogTitle>
              <DialogDescription>Agende rapidamente uma nova sessão</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                <Select 
                  value={scheduleForm.patient} 
                  onValueChange={(value) => setScheduleForm({...scheduleForm, patient: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.filter(p => p.status === 1).map((paciente) => (
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
                  placeholder="Anotações..."
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
      </CardContent>
    </Card>
  );
}
