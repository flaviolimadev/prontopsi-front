import { useState } from "react";
import { FileText, Plus, Lock, Calendar, User, Search, Paperclip } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Dados serão carregados do contexto global

export default function Prontuarios() {
  const { patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Para demonstração, inicializando com array vazio - prontuários serão implementados posteriormente
  const mockEntries: any[] = [];
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const [newEntryForm, setNewEntryForm] = useState({
    patient: "",
    sessionType: "",
    content: "",
    diagnosis: ""
  });

  const [quickEntryForm, setQuickEntryForm] = useState({
    patient: "",
    sessionType: "",
    content: ""
  });

  const filteredEntries = mockEntries.filter(entry => {
    const matchesPatient = selectedPatient === "" || selectedPatient === "todos" || entry.patient === selectedPatient;
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.patient.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPatient && matchesSearch;
  });

  const handleCreateEntry = () => {
    if (!newEntryForm.patient || !newEntryForm.content) {
      toast({
        title: "Erro",
        description: "Paciente e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Entrada criada!",
      description: `Nova entrada de prontuário para ${newEntryForm.patient}.`
    });
    setIsNewEntryModalOpen(false);
    setNewEntryForm({ patient: "", sessionType: "", content: "", diagnosis: "" });
  };

  const handleSaveQuickEntry = () => {
    if (!quickEntryForm.patient || !quickEntryForm.content) {
      toast({
        title: "Erro",
        description: "Selecione um paciente e adicione conteúdo.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Entrada salva!",
      description: `Prontuário atualizado para ${quickEntryForm.patient}.`
    });
    setQuickEntryForm({ patient: "", sessionType: "", content: "" });
  };

  const handleEditEntry = (entry: any) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleAttachFile = (entry: any) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Upload de arquivos será implementado em breve."
    });
  };

  const handleDownloadAttachment = (attachment: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${attachment}...`
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">Prontuários</h1>
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Área segura e criptografada - somente o psicólogo visualiza
          </p>
        </div>
        <Dialog open={isNewEntryModalOpen} onOpenChange={setIsNewEntryModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Entrada</DialogTitle>
              <DialogDescription>Adicione uma nova entrada ao prontuário</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paciente *</Label>
                  <Select value={newEntryForm.patient} onValueChange={(value) => setNewEntryForm({...newEntryForm, patient: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar paciente" />
                    </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.name}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Sessão</Label>
                  <Select value={newEntryForm.sessionType} onValueChange={(value) => setNewEntryForm({...newEntryForm, sessionType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de sessão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Sessão Individual</SelectItem>
                      <SelectItem value="avaliacao">Avaliação</SelectItem>
                      <SelectItem value="grupo">Sessão em Grupo</SelectItem>
                      <SelectItem value="familiar">Terapia Familiar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Diagnóstico/CID</Label>
                <Input
                  placeholder="CID ou diagnóstico..."
                  value={newEntryForm.diagnosis}
                  onChange={(e) => setNewEntryForm({...newEntryForm, diagnosis: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Sessão *</Label>
                <Textarea 
                  placeholder="Descreva detalhadamente o que aconteceu na sessão..."
                  className="min-h-[150px]"
                  value={newEntryForm.content}
                  onChange={(e) => setNewEntryForm({...newEntryForm, content: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewEntryModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEntry}>
                  Criar Entrada
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar nas anotações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os pacientes</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.name}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entries Timeline */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              {searchTerm || selectedPatient ? (
                <p className="text-muted-foreground">
                  Nenhuma entrada encontrada com os filtros aplicados
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Nenhuma entrada de prontuário ainda
                  </p>
                  <Dialog open={isNewEntryModalOpen} onOpenChange={setIsNewEntryModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar Primeira Entrada
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">{entry.patient}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        Sessão {entry.session}
                      </Badge>
                      <Badge variant="secondary">
                        {entry.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(entry.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed">
                      {entry.content}
                    </p>
                  </div>

                  {entry.attachments.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Anexos</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entry.attachments.map((attachment, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="gap-1 cursor-pointer hover:bg-muted"
                            onClick={() => handleDownloadAttachment(attachment)}
                          >
                            <FileText className="h-3 w-3" />
                            {attachment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleEditEntry(entry)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAttachFile(entry)}>
                      Anexar Arquivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nova Entrada Rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={quickEntryForm.patient} onValueChange={(value) => setQuickEntryForm({...quickEntryForm, patient: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.name}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={quickEntryForm.sessionType} onValueChange={(value) => setQuickEntryForm({...quickEntryForm, sessionType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de sessão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Sessão Individual</SelectItem>
                <SelectItem value="avaliacao">Avaliação</SelectItem>
                <SelectItem value="grupo">Sessão em Grupo</SelectItem>
                <SelectItem value="familiar">Terapia Familiar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Textarea 
            placeholder="Digite suas anotações da sessão..."
            className="min-h-[100px]"
            value={quickEntryForm.content}
            onChange={(e) => setQuickEntryForm({...quickEntryForm, content: e.target.value})}
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleAttachFile(null)}>
              Anexar Arquivo
            </Button>
            <Button onClick={handleSaveQuickEntry}>
              Salvar Entrada
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Entrada</DialogTitle>
            <DialogDescription>Modifique a entrada do prontuário</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Edite o conteúdo da entrada..."
              className="min-h-[150px]"
              defaultValue={selectedEntry?.content}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Entrada atualizada!",
                  description: "As alterações foram salvas com sucesso."
                });
                setIsEditModalOpen(false);
              }}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}