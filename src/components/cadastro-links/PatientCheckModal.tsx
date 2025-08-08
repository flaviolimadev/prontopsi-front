import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCheck, UserPlus, AlertCircle } from 'lucide-react';
import { usePacientes } from '@/hooks/usePacientes';

interface PatientCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onPatientSelected: (pacienteId: string) => void;
}

export function PatientCheckModal({ isOpen, onClose, submission, onPatientSelected }: PatientCheckModalProps) {
  const { pacientes, createPaciente } = usePacientes();
  
  const [loading, setLoading] = useState(false);
  const [existingPaciente, setExistingPaciente] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    telefone: '',
    endereco: '',
    profissao: '',
    nascimento: '',
    genero: '',
    contato_emergencia: '',
    observacao_geral: '',
  });

  // Verificar se o paciente já existe
  useEffect(() => {
    if (submission && pacientes) {
      const existing = pacientes.find(p => 
        p.cpf === submission.pacienteData.cpf || 
        p.email === submission.pacienteData.email
      );
      setExistingPaciente(existing);
    }
  }, [submission, pacientes]);

  // Inicializar formulário com dados da submissão
  useEffect(() => {
    if (submission) {
      setFormData({
        name: submission.pacienteData.nome || '',
        email: submission.pacienteData.email || '',
        cpf: submission.pacienteData.cpf || '',
        telefone: submission.pacienteData.telefone || '',
        endereco: submission.pacienteData.endereco || '',
        profissao: submission.pacienteData.profissao || '',
        nascimento: submission.pacienteData.nascimento || '',
        genero: submission.pacienteData.genero || '',
        contato_emergencia: submission.pacienteData.contato_emergencia || '',
        observacao_geral: submission.pacienteData.observacao_geral || '',
      });
    }
  }, [submission]);

  const handleCreatePatient = async () => {
    try {
      setLoading(true);
      const newPaciente = await createPaciente({
        ...formData,
        status: 1, // Ativo
      });
      onPatientSelected(newPaciente.id);
      onClose();
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExisting = (pacienteId: string) => {
    onPatientSelected(pacienteId);
    onClose();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verificar Paciente</DialogTitle>
          <DialogDescription>
            Verifique se o paciente já está cadastrado ou crie um novo cadastro
          </DialogDescription>
        </DialogHeader>

        {existingPaciente ? (
          <div className="space-y-4">
            <Alert>
              <UserCheck className="h-4 w-4" />
              <AlertDescription>
                Paciente encontrado no sistema: <strong>{existingPaciente.nome}</strong>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm">{existingPaciente.nome}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">CPF</Label>
                <p className="text-sm">{existingPaciente.cpf || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{existingPaciente.email || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Telefone</Label>
                <p className="text-sm">{existingPaciente.telefone || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => handleSelectExisting(existingPaciente.id)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Usar Paciente Existente
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!showCreateForm ? (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Paciente não encontrado no sistema. Deseja criar um novo cadastro?
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm">{submission?.pacienteData.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">CPF</Label>
                    <p className="text-sm">{submission?.pacienteData.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{submission?.pacienteData.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Telefone</Label>
                    <p className="text-sm">{submission?.pacienteData.telefone || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Novo Paciente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input
                      id="nascimento"
                      type="date"
                      value={formData.nascimento}
                      onChange={(e) => setFormData({ ...formData, nascimento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="genero">Gênero</Label>
                    <Select value={formData.genero} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input
                      id="profissao"
                      value={formData.profissao}
                      onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                      placeholder="Profissão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contato_emergencia">Contato de Emergência</Label>
                    <Input
                      id="contato_emergencia"
                      value={formData.contato_emergencia}
                      onChange={(e) => setFormData({ ...formData, contato_emergencia: e.target.value })}
                      placeholder="Nome e telefone"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Endereço completo"
                  />
                </div>

                <div>
                  <Label htmlFor="observacao_geral">Observações Gerais</Label>
                  <Textarea
                    id="observacao_geral"
                    value={formData.observacao_geral}
                    onChange={(e) => setFormData({ ...formData, observacao_geral: e.target.value })}
                    placeholder="Observações sobre o paciente..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleCreatePatient} 
                    disabled={loading || !formData.name || !formData.cpf || !formData.email || !formData.telefone}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Criar Paciente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
