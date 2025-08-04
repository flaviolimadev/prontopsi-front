
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, User, Calendar, AlertCircle, CheckCircle2, CalendarDays, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";

function AppointmentCard({ appointment, isToday }: { appointment: any, isToday: boolean }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return <Badge variant="secondary">Agendado</Badge>;
      case "confirmado":
        return <Badge className="bg-success text-success-foreground">Confirmado</Badge>;
      case "realizado":
        return <Badge variant="outline" className="border-success text-success">Realizado</Badge>;
      case "falta":
        return <Badge variant="destructive">Falta</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "agendado":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "realizado":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const needsConfirmation = appointment.status === "agendado" && isToday;
  const isPast = appointment.status === "realizado" || appointment.status === "falta";

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
      isPast ? "bg-muted/30 border-muted" : "bg-card border-border hover:bg-muted/20 hover:border-primary/20",
      needsConfirmation && "border-warning/30 bg-warning/5",
      isToday && "border-l-4 border-l-primary"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center border",
          isToday ? "bg-primary/10 border-primary/20" : "bg-accent/50 border-accent"
        )}>
          <User className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{appointment.time}</span>
            {getStatusIcon(appointment.status)}
            {needsConfirmation && <AlertCircle className="w-4 h-4 text-warning" />}
          </div>
          <p className="font-semibold text-foreground mb-1">{appointment.patient}</p>
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge(appointment.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(appointment.date).toLocaleDateString("pt-BR", { 
              weekday: 'short', 
              day: '2-digit', 
              month: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WeeklySchedule() {
  const { toast } = useToast();
  const { appointments, createAppointment } = useAppointments();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    patient: "",
    date: "",
    time: "",
    type: "presencial",
    notes: ""
  });

  // Filtrar próximas 3 sessões da semana (incluindo hoje)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const weeklyAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(apt.date);
      return appointmentDate >= today && appointmentDate <= nextWeek;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  const todayString = today.toISOString().split('T')[0];
  
  const upcomingAppointments = weeklyAppointments.filter(
    apt => apt.status === "agendado"
  );
  
  const needingConfirmation = upcomingAppointments.filter(
    apt => apt.status === "agendado" && apt.date === todayString
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
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            Próximas Sessões
          </div>
          {needingConfirmation.length > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {needingConfirmation.length} precisam confirmação
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                isToday={appointment.date === todayString}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Nenhuma sessão programada
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Que tal planejar sua semana e organizar sua agenda?
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Nova Sessão
              </Button>
            </DialogTrigger>
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
        </div>
      </CardContent>
    </Card>
  );
}
