
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
import { useAppointments } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";

function AppointmentCard({ appointment, patientName }: { appointment: any; patientName: string }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-success text-success-foreground">Confirmado</Badge>;
      case "pendente":
        return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      case "realizado":
        return <Badge variant="outline" className="border-success text-success">Realizado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "pendente":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "realizado":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
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
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
          <User className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{appointment.time}</span>
            {getStatusIcon(appointment.status)}
          </div>
          <p className="font-semibold text-foreground mb-1">{patientName}</p>
          <div className="flex items-center gap-2">
            {getStatusBadge(appointment.status)}
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
  const { appointments = [] } = useAppointments();
  const { patients = [] } = usePatients();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    patient: "",
    date: "",
    time: "",
    type: "presencial",
    notes: ""
  });

  // Filtrar appointments de hoje e combinar com dados dos pacientes
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments
    .filter(apt => apt.date === today)
    .map(apt => {
      const patient = patients.find(p => p.id === apt.patient_id);
      return {
        ...apt,
        patientName: patient?.name || 'Paciente não encontrado'
      };
    });
  
  const upcomingAppointments = todayAppointments.filter(
    apt => apt.status === "agendado"
  );
  const completedAppointments = todayAppointments.filter(
    apt => apt.status === "realizado"
  );

  const handleCreateSchedule = () => {
    if (!scheduleForm.patient || !scheduleForm.date || !scheduleForm.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    createAppointment("temp-patient", {
      date: scheduleForm.date,
      time: scheduleForm.time,
      duration: 50,
      type: "consulta",
      modality: "presencial",
      status: "agendado",
      notes: scheduleForm.notes
    });

    toast({
      title: "Sessão agendada!",
      description: `Sessão marcada para ${scheduleForm.patient} em ${scheduleForm.date} às ${scheduleForm.time}.`
    });
    setIsScheduleModalOpen(false);
    setScheduleForm({ patient: "", date: "", time: "", type: "presencial", notes: "" });
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          Agenda de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {upcomingAppointments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Próximas Sessões</h4>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  patientName={appointment.patientName}
                />
              ))}
            </div>
          </div>
        )}
        
        {completedAppointments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Sessões Realizadas</h4>
            <div className="space-y-3">
              {completedAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  patientName={appointment.patientName}
                />
              ))}
            </div>
          </div>
        )}

        {todayAppointments.length === 0 && (
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

        {todayAppointments.length > 0 && (
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
                <Input
                  placeholder="Nome do paciente"
                  value={scheduleForm.patient}
                  onChange={(e) => setScheduleForm({...scheduleForm, patient: e.target.value})}
                />
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
