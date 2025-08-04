
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, AlertTriangle, Gift, CreditCard, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useFinancials } from "@/hooks/useFinancials";

interface PriorityPatient {
  id: string;
  name: string;
  reason: "no_show" | "payment_overdue" | "no_session" | "birthday";
  priority: "high" | "medium" | "low";
  details: string;
  initials: string;
  lastSession?: string;
  nextSession?: string;
}

function PriorityPatientCard({ patient }: { patient: PriorityPatient }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "presencial",
    notes: ""
  });

  const handleCreateSchedule = () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      toast({
        title: "Erro",
        description: "Data e horário são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sessão agendada!",
      description: `Sessão marcada para ${patient.name} em ${scheduleForm.date} às ${scheduleForm.time}.`
    });
    setIsScheduleModalOpen(false);
    setScheduleForm({ date: "", time: "", type: "presencial", notes: "" });
  };

  const getPriorityIcon = (reason: string) => {
    switch (reason) {
      case "no_show":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "payment_overdue":
        return <CreditCard className="w-4 h-4 text-orange-500" />;
      case "no_session":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "birthday":
        return <Gift className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string, reason: string) => {
    if (reason === "birthday") {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Aniversário</Badge>;
    }
    
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta Prioridade</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Média Prioridade</Badge>;
      default:
        return <Badge variant="secondary">Baixa Prioridade</Badge>;
    }
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
            {getPriorityBadge(patient.priority, patient.reason)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {getPriorityIcon(patient.reason)}
            <span className="text-xs text-muted-foreground">{patient.details}</span>
          </div>
          {patient.lastSession && (
            <span className="text-xs text-muted-foreground">
              Última sessão: {new Date(patient.lastSession).toLocaleDateString("pt-BR")}
            </span>
          )}
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

        <Button size="sm" variant="ghost" onClick={() => {
          console.log("Ver perfil clicked for patient:", patient.id);
          navigate(`/pacientes/${patient.id}`);
        }}>
          Ver Perfil
        </Button>
      </div>
    </div>
  );
}

export function PriorityPatients() {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const { financials } = useFinancials();

  // Calcular pacientes prioritários
  const priorityPatients: PriorityPatient[] = [];

  const today = new Date();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(today.getDate() - 14);
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(today.getDate() + 7);

  patients.forEach(patient => {
    const patientAppointments = appointments.filter(apt => apt.patient_id === patient.id);
    const patientPayments = financials.filter(rec => rec.patient_id === patient.id);
    
    // Verificar faltas consecutivas
    const recentAppointments = patientAppointments
      .filter(apt => new Date(apt.date) >= twoWeeksAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const consecutiveNoShows = recentAppointments.slice(0, 3).filter(apt => apt.status === 'falta').length;
    
    if (consecutiveNoShows >= 2) {
      priorityPatients.push({
        id: patient.id,
        name: patient.name,
        reason: "no_show",
        priority: consecutiveNoShows >= 3 ? "high" : "medium",
        details: `${consecutiveNoShows} faltas consecutivas`,
        initials: patient.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        lastSession: patient.last_session || undefined,
      });
    }

    // Verificar pagamentos atrasados
    const overduePayments = patientPayments.filter(payment => {
      if (payment.status !== 'pendente') return false;
      const paymentDate = new Date(payment.date);
      const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7;
    });

    if (overduePayments.length > 0) {
      const totalOverdue = overduePayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      priorityPatients.push({
        id: patient.id,
        name: patient.name,
        reason: "payment_overdue",
        priority: totalOverdue > 500 ? "high" : "medium",
        details: `R$ ${totalOverdue.toFixed(2)} em atraso`,
        initials: patient.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        lastSession: patient.last_session || undefined,
      });
    }

    // Verificar sem sessão há muito tempo
    if (patient.last_session) {
      const lastSessionDate = new Date(patient.last_session);
      const daysSinceLastSession = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastSession > 14 && patient.status === 'ativo') {
        priorityPatients.push({
          id: patient.id,
          name: patient.name,
          reason: "no_session",
          priority: daysSinceLastSession > 30 ? "high" : "medium",
          details: `${daysSinceLastSession} dias sem sessão`,
          initials: patient.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          lastSession: patient.last_session,
        });
      }
    }

    // Verificar aniversários da semana
    if (patient.birth_date) {
      const birthDate = new Date(patient.birth_date);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (thisYearBirthday >= today && thisYearBirthday <= oneWeekFromNow) {
        priorityPatients.push({
          id: patient.id,
          name: patient.name,
          reason: "birthday",
          priority: "low",
          details: `Aniversário em ${thisYearBirthday.toLocaleDateString("pt-BR")}`,
          initials: patient.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          lastSession: patient.last_session || undefined,
        });
      }
    }
  });

  // Remover duplicatas e ordenar por prioridade
  const uniquePriorityPatients = priorityPatients
    .filter((patient, index, self) => self.findIndex(p => p.id === patient.id) === index)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5); // Mostrar apenas os 5 mais prioritários

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          Pacientes Prioritários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        {uniquePriorityPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground relative z-20">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="mb-2">Nenhum paciente prioritário no momento</p>
            <p className="text-sm mb-4">Tudo sob controle! 🎯</p>
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground relative z-30" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Ver Todos os Pacientes clicked");
                navigate("/pacientes");
              }}
            >
              Ver Todos os Pacientes
            </Button>
          </div>
        ) : (
          <>
            {uniquePriorityPatients.map((patient) => (
              <PriorityPatientCard key={`${patient.id}-${patient.reason}`} patient={patient} />
            ))}
            
            <div className="pt-3 border-t border-border relative z-20">
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors relative z-30" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Ver todos os pacientes clicked");
                  navigate("/pacientes");
                }}
              >
                Ver Todos os Pacientes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
