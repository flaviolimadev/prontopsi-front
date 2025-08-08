import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  CalendarDays,
  Clock as ClockIcon
} from 'lucide-react';
import { useCadastroLinks, CadastroSubmission } from '@/hooks/useCadastroLinks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientCheckModal } from './PatientCheckModal';
import { AppointmentEditModal } from './AppointmentEditModal';

export function SubmissionsManager() {
  const { submissions, loading, fetchSubmissions, approveSubmission, rejectSubmission } = useCadastroLinks();
  const [selectedSubmission, setSelectedSubmission] = useState<CadastroSubmission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPatientCheckModalOpen, setIsPatientCheckModalOpen] = useState(false);
  const [isAppointmentEditModalOpen, setIsAppointmentEditModalOpen] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    
    try {
      await approveSubmission(selectedSubmission.id, { observacoes });
      setIsApproveModalOpen(false);
      setSelectedSubmission(null);
      setObservacoes('');
      setSelectedPacienteId('');
    } catch (error) {
      console.error('Erro ao aprovar submissão:', error);
    }
  };

  const handlePatientSelected = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    setIsPatientCheckModalOpen(false);
    setIsAppointmentEditModalOpen(true);
  };

  const handleAppointmentSave = async (appointmentData: any) => {
    if (!selectedSubmission) return;
    
    try {
      // Aprovar a submissão com o paciente selecionado
      await approveSubmission(selectedSubmission.id, { 
        observacoes,
        pacienteId: selectedPacienteId
      });
      setIsAppointmentEditModalOpen(false);
      setSelectedSubmission(null);
      setObservacoes('');
      setSelectedPacienteId('');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;
    
    try {
      await rejectSubmission(selectedSubmission.id, { observacoes });
      setIsRejectModalOpen(false);
      setSelectedSubmission(null);
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao rejeitar submissão:', error);
    }
  };

  const openViewModal = (submission: CadastroSubmission) => {
    setSelectedSubmission(submission);
    setIsViewModalOpen(true);
  };

  const openApproveModal = (submission: CadastroSubmission) => {
    setSelectedSubmission(submission);
    setIsPatientCheckModalOpen(true);
  };

  const openRejectModal = (submission: CadastroSubmission) => {
    setSelectedSubmission(submission);
    setIsRejectModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || [];
  const processedSubmissions = submissions?.filter(s => s.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Submissões de Cadastro</h2>
          <p className="text-muted-foreground">
            Gerencie as solicitações de cadastro dos pacientes
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                         <div className="text-2xl font-bold">{submissions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Submissões recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processadas</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processedSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Aprovadas ou rejeitadas
            </p>
          </CardContent>
        </Card>
      </div>

                    {/* Submissões Pendentes */}
      {pendingSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Pendentes ({pendingSubmissions.length})
            </CardTitle>
            <CardDescription>
              Submissões aguardando sua aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.pacienteData.nome}</div>
                        {submission.pacienteData.cpf && (
                          <div className="text-sm text-muted-foreground">CPF: {submission.pacienteData.cpf}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {submission.pacienteData.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {submission.pacienteData.email}
                          </div>
                        )}
                        {submission.pacienteData.telefone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {submission.pacienteData.telefone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {submission.cadastroLink?.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.pacienteData.dataConsulta && submission.pacienteData.horaConsulta ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarDays className="h-3 w-3 text-blue-600" />
                            <span>{format(new Date(submission.pacienteData.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <ClockIcon className="h-3 w-3 text-green-600" />
                            <span>{submission.pacienteData.horaConsulta}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Não agendado
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(submission.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openViewModal(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openApproveModal(submission)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectModal(submission)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Todas as Submissões */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Submissões</CardTitle>
          <CardDescription>
            Histórico completo de solicitações de cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando submissões...</p>
            </div>
                     ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma submissão de cadastro recebida ainda
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                                 {submissions?.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.pacienteData.nome}</div>
                        {submission.pacienteData.email && (
                          <div className="text-sm text-muted-foreground">{submission.pacienteData.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(submission.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {submission.cadastroLink?.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(submission.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openViewModal(submission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Submissão</DialogTitle>
            <DialogDescription>
              Informações completas do paciente
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CPF</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.cpf || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.email || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Nascimento</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.nascimento || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gênero</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.genero || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Profissão</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.profissao || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contato de Emergência</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.contato_emergencia || 'Não informado'}</p>
                </div>
              </div>

              {/* Seção de Agendamento */}
              {(selectedSubmission.pacienteData.dataConsulta || selectedSubmission.pacienteData.horaConsulta) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Agendamento Solicitado</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSubmission.pacienteData.dataConsulta && (
                      <div>
                        <Label className="text-sm font-medium">Data da Consulta</Label>
                        <p className="text-sm">{format(new Date(selectedSubmission.pacienteData.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    )}
                    {selectedSubmission.pacienteData.horaConsulta && (
                      <div>
                        <Label className="text-sm font-medium">Horário da Consulta</Label>
                        <p className="text-sm">{selectedSubmission.pacienteData.horaConsulta}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedSubmission.pacienteData.endereco && (
                <div>
                  <Label className="text-sm font-medium">Endereço</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.endereco}</p>
                </div>
              )}
              
              {selectedSubmission.pacienteData.observacao_geral && (
                <div>
                  <Label className="text-sm font-medium">Observações</Label>
                  <p className="text-sm">{selectedSubmission.pacienteData.observacao_geral}</p>
                </div>
              )}

              {selectedSubmission.observacoes && (
                <div>
                  <Label className="text-sm font-medium">Observações do Psicólogo</Label>
                  <p className="text-sm">{selectedSubmission.observacoes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Submetido em: {format(new Date(selectedSubmission.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
                {getStatusBadge(selectedSubmission.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Aprovação */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Cadastro</DialogTitle>
            <DialogDescription>
              Confirme a aprovação do cadastro do paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre a aprovação..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Cadastro</DialogTitle>
            <DialogDescription>
              Confirme a rejeição do cadastro do paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informe o motivo da rejeição..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReject} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Verificação de Paciente */}
      <PatientCheckModal
        isOpen={isPatientCheckModalOpen}
        onClose={() => setIsPatientCheckModalOpen(false)}
        submission={selectedSubmission}
        onPatientSelected={handlePatientSelected}
      />

      {/* Modal de Edição de Agendamento */}
      <AppointmentEditModal
        isOpen={isAppointmentEditModalOpen}
        onClose={() => setIsAppointmentEditModalOpen(false)}
        submission={selectedSubmission}
        selectedPacienteId={selectedPacienteId}
        onSave={handleAppointmentSave}
      />
    </div>
  );
}
