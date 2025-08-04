import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Calendar, 
  FileText, 
  CreditCard, 
  Bell,
  User
} from "lucide-react";


export function QuickActions() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Modal states
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Form states
  const [sessionForm, setSessionForm] = useState({
    patient: "",
    date: "",
    time: "",
    type: "presencial",
    notes: ""
  });

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    notes: ""
  });

  const [recordForm, setRecordForm] = useState({
    patient: "",
    date: "",
    notes: "",
    diagnosis: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    patient: "",
    amount: "",
    method: "pix",
    description: ""
  });

  const [reminderForm, setReminderForm] = useState({
    patient: "",
    message: "",
    type: "whatsapp"
  });

  const handleCreateSession = () => {
    if (!sessionForm.patient || !sessionForm.date || !sessionForm.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sessão criada!",
      description: `Sessão agendada para ${sessionForm.patient} em ${sessionForm.date} às ${sessionForm.time}.`
    });
    setIsSessionModalOpen(false);
    setSessionForm({ patient: "", date: "", time: "", type: "presencial", notes: "" });
  };

  const handleCreatePatient = () => {
    if (!patientForm.name || !patientForm.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Paciente cadastrado!",
      description: `${patientForm.name} foi adicionado com sucesso.`
    });
    setIsPatientModalOpen(false);
    setPatientForm({ name: "", email: "", phone: "", birthDate: "", notes: "" });
  };

  const handleCreateRecord = () => {
    if (!recordForm.patient || !recordForm.notes) {
      toast({
        title: "Erro",
        description: "Paciente e anotações são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Prontuário criado!",
      description: `Registro adicionado para ${recordForm.patient}.`
    });
    setIsRecordModalOpen(false);
    setRecordForm({ patient: "", date: "", notes: "", diagnosis: "" });
  };

  const handleCreatePayment = () => {
    if (!paymentForm.patient || !paymentForm.amount) {
      toast({
        title: "Erro",
        description: "Paciente e valor são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Pagamento registrado!",
      description: `Recebimento de R$ ${paymentForm.amount} de ${paymentForm.patient}.`
    });
    setIsPaymentModalOpen(false);
    setPaymentForm({ patient: "", amount: "", method: "pix", description: "" });
  };

  const handleSendReminder = () => {
    if (!reminderForm.patient || !reminderForm.message) {
      toast({
        title: "Erro",
        description: "Paciente e mensagem são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Lembrete enviado!",
      description: `Mensagem enviada para ${reminderForm.patient} via ${reminderForm.type}.`
    });
    setIsReminderModalOpen(false);
    setReminderForm({ patient: "", message: "", type: "whatsapp" });
  };

  const quickActions = [
    {
      title: "Nova Sessão",
      description: "Agendar consulta",
      icon: Calendar,
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600",
      hoverColor: "hover:from-blue-500/30 hover:to-blue-600/30",
      modal: (
        <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
          <DialogTrigger asChild>
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-4 h-28 flex flex-col items-center justify-center text-center">
                <div className="rounded-full p-2.5 bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-foreground group-hover:text-blue-600 transition-colors">Nova Sessão</div>
                  <div className="text-xs text-muted-foreground">Agendar consulta</div>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Sessão</DialogTitle>
              <DialogDescription>Agende uma nova sessão para um paciente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                <Input
                  placeholder="Nome do paciente"
                  value={sessionForm.patient}
                  onChange={(e) => setSessionForm({...sessionForm, patient: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Input
                    type="time"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={sessionForm.type} onValueChange={(value) => setSessionForm({...sessionForm, type: value})}>
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
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSessionModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSession}>
                  Agendar Sessão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: "Novo Paciente",
      description: "Cadastrar pessoa",
      icon: User,
      color: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-600",
      hoverColor: "hover:from-green-500/30 hover:to-green-600/30",
      modal: (
        <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
          <DialogTrigger asChild>
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-4 h-28 flex flex-col items-center justify-center text-center">
                <div className="rounded-full p-2.5 bg-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300 mb-2">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-foreground group-hover:text-green-600 transition-colors">Novo Paciente</div>
                  <div className="text-xs text-muted-foreground">Cadastrar pessoa</div>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
              <DialogDescription>Cadastre um novo paciente no sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input
                  placeholder="Nome completo do paciente"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({...patientForm, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({...patientForm, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={patientForm.birthDate}
                  onChange={(e) => setPatientForm({...patientForm, birthDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Informações adicionais..."
                  value={patientForm.notes}
                  onChange={(e) => setPatientForm({...patientForm, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPatientModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePatient}>
                  Cadastrar Paciente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: "Novo Pagamento",
      description: "Lançar recebimento",
      icon: CreditCard,
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-600",
      hoverColor: "hover:from-purple-500/30 hover:to-purple-600/30",
      modal: (
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogTrigger asChild>
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-4 h-28 flex flex-col items-center justify-center text-center">
                <div className="rounded-full p-2.5 bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-300 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-foreground group-hover:text-purple-600 transition-colors">Novo Pagamento</div>
                  <div className="text-xs text-muted-foreground">Lançar recebimento</div>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogDescription>Lance um novo recebimento no sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                <Input
                  placeholder="Nome do paciente"
                  value={paymentForm.patient}
                  onChange={(e) => setPaymentForm({...paymentForm, patient: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input
                    placeholder="150.00"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Método de pagamento</Label>
                  <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({...paymentForm, method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Sessão do dia 10/01/2024..."
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePayment}>
                  Registrar Pagamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="rounded-full p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "grid-cols-3"
        )}>
          {quickActions.map((action, index) => (
            <div key={index}>
              {action.modal}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}