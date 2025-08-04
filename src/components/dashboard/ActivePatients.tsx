import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calendar, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";

function ActivePatientCard({ patient }: { patient: any }) {
  const navigate = useNavigate();
  const { appointments = [] } = useAppointments();

  // Calcular próxima sessão
  const today = new Date().toISOString().split('T')[0];
  const nextAppointment = appointments
    .filter(apt => apt.patient_id === patient.id && apt.date >= today && apt.status === 'agendado')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Calcular dias desde última sessão
  const daysSinceLastSession = patient.last_session 
    ? Math.floor((new Date().getTime() - new Date(patient.last_session).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getActivityBadge = () => {
    if (nextAppointment) {
      return <Badge className="bg-success/20 text-success border-success/30">Próxima Sessão</Badge>;
    }
    if (daysSinceLastSession !== null) {
      if (daysSinceLastSession <= 7) {
        return <Badge className="bg-success/20 text-success border-success/30">Ativo</Badge>;
      } else if (daysSinceLastSession <= 14) {
        return <Badge className="bg-warning/20 text-warning border-warning/30">Atenção</Badge>;
      }
    }
    return <Badge variant="secondary">Sem Sessões</Badge>;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
         onClick={() => navigate(`/pacientes/${patient.id}`)}>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{patient.name}</p>
            {getActivityBadge()}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {patient.last_session && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Última: {new Date(patient.last_session).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {nextAppointment && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Próxima: {new Date(nextAppointment.date).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {patient.sessions_count > 0 && (
              <span>{patient.sessions_count} sessões</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivePatients() {
  const navigate = useNavigate();
  const { patients = [] } = usePatients();
  const { toast } = useToast();
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    birth_date: "",
    phone: "",
    email: "",
    emergency_contact: "",
    notes: ""
  });

  
  // Filtrar apenas pacientes ativos
  const activePatients = patients
    .filter(patient => patient.status === 'ativo')
    .sort((a, b) => {
      // Ordenar por última sessão (mais recente primeiro)
      if (!a.last_session && !b.last_session) return 0;
      if (!a.last_session) return 1;
      if (!b.last_session) return -1;
      return new Date(b.last_session).getTime() - new Date(a.last_session).getTime();
    })
    .slice(0, 5); // Mostrar apenas os 5 mais recentes

  const handleAddPatient = async () => {
    if (!newPatientForm.name || !newPatientForm.phone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    await createPatient({
      name: newPatientForm.name,
      birth_date: newPatientForm.birth_date || undefined,
      phone: newPatientForm.phone,
      email: newPatientForm.email || undefined,
      emergency_contact: newPatientForm.emergency_contact || undefined,
      notes: newPatientForm.notes || undefined,
    });
    
    setIsAddPatientModalOpen(false);
    setNewPatientForm({ name: "", birth_date: "", phone: "", email: "", emergency_contact: "", notes: "" });
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          Pacientes Ativos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        {activePatients.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Nenhum paciente ativo encontrado
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Comece cadastrando seus primeiros pacientes
            </p>
            <Dialog open={isAddPatientModalOpen} onOpenChange={setIsAddPatientModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground" 
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Novo Paciente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Paciente</DialogTitle>
                  <DialogDescription>Cadastre um novo paciente no sistema</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      placeholder="Nome do paciente"
                      value={newPatientForm.name}
                      onChange={(e) => setNewPatientForm({...newPatientForm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        placeholder="Data de nascimento"
                        value={newPatientForm.birth_date}
                        onChange={(e) => setNewPatientForm({...newPatientForm, birth_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone *</Label>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={newPatientForm.phone}
                        onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newPatientForm.email}
                      onChange={(e) => setNewPatientForm({...newPatientForm, email: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddPatientModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPatient}>
                      Cadastrar Paciente
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {activePatients.map((patient) => (
                <ActivePatientCard key={patient.id} patient={patient} />
              ))}
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/pacientes");
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Lista Completa
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}