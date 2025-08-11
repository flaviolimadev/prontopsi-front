import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, Loader2, MapPin, Palette, UserCircle, User, Building2, FileText, Trash2, Phone, Heart, Plus } from 'lucide-react';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import { PacienteAvatarUploadModal } from './PacienteAvatarUploadModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditPacienteModalProps {
  paciente: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export const EditPacienteModal: React.FC<EditPacienteModalProps> = ({
  paciente,
  open,
  onOpenChange,
  onSubmit,
  loading = false
}) => {
  const { loading: addressLoading, searchByCEP, searchByStreet, clearAddress } = useAddressSearch();
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    address: "",
    profession: "",
    emergency_contact: "",
    notes: "",
    status: "ativo",
    cpf: "",
    gender: "",
  });

  const [addressSearchType, setAddressSearchType] = useState<'cep' | 'street'>('cep');
  const [addressSearchData, setAddressSearchData] = useState({
    cep: '',
    street: '',
    city: '',
    state: ''
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Contatos de emergência (igual ao perfil do paciente)
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{ id: string; nome: string; telefone: string }>>([]);
  const [newEmergencyContact, setNewEmergencyContact] = useState<{ nome: string; telefone: string }>({ nome: '', telefone: '' });

  // Medicações (igual ao perfil do paciente)
  const [medications, setMedications] = useState<Array<{ id: string; nome: string; prescricao: string }>>([]);
  const [newMedication, setNewMedication] = useState<{ nome: string; prescricao: string }>({ nome: '', prescricao: '' });

  // Carregar dados do paciente quando o modal abrir
  useEffect(() => {
    if (paciente && open) {
      setEditForm({
        name: paciente.nome || "",
        email: paciente.email || "",
        phone: paciente.telefone || "",
        birth_date: paciente.nascimento || "",
        address: paciente.endereco || "",
        profession: paciente.profissao || "",
        emergency_contact: paciente.contato_emergencia || "",
        notes: paciente.observacao_geral || "",
        status: paciente.status === 1 ? "ativo" : "inativo",
        cpf: paciente.cpf || "",
        gender: paciente.genero || "",
      });
      // Carregar contatos de emergência existentes
      if (Array.isArray(paciente.contatos_emergencia)) {
        setEmergencyContacts(paciente.contatos_emergencia);
      } else {
        setEmergencyContacts([]);
      }

      // Carregar medicações existentes
      if (Array.isArray(paciente.medicacoes)) {
        setMedications(paciente.medicacoes);
      } else {
        setMedications([]);
      }
    }
  }, [paciente, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pacienteData = {
        nome: editForm.name,
        email: editForm.email,
        telefone: editForm.phone,
        nascimento: editForm.birth_date,
        endereco: editForm.address,
        profissao: editForm.profession,
        contato_emergencia: editForm.emergency_contact,
        observacao_geral: editForm.notes,
        cpf: editForm.cpf,
        genero: editForm.gender,
        status: editForm.status === "ativo" ? 1 : 0,
        // Incluir listas estruturadas como na página de perfil
        contatos_emergencia: emergencyContacts,
        medicacoes: medications
      };

      await onSubmit(pacienteData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
    }
  };

  const handleAddEmergencyContact = () => {
    if (!newEmergencyContact.nome.trim() || !newEmergencyContact.telefone.trim()) {
      return;
    }
    const contact = {
      id: Date.now().toString(),
      nome: newEmergencyContact.nome.trim(),
      telefone: newEmergencyContact.telefone.trim(),
    };
    setEmergencyContacts(prev => [...prev, contact]);
    setNewEmergencyContact({ nome: '', telefone: '' });
  };

  const handleRemoveEmergencyContact = (contactId: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleAddMedication = () => {
    if (!newMedication.nome.trim()) return;
    const med = {
      id: Date.now().toString(),
      nome: newMedication.nome.trim(),
      prescricao: newMedication.prescricao.trim(),
    };
    setMedications(prev => [...prev, med]);
    setNewMedication({ nome: '', prescricao: '' });
  };

  const handleRemoveMedication = (medId: string) => {
    setMedications(prev => prev.filter(m => m.id !== medId));
  };

  const formatCEP = (cep: string) => {
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  const handleSearchAddress = async () => {
    if (addressSearchType === 'cep' && addressSearchData.cep) {
      const result = await searchByCEP(addressSearchData.cep.replace(/\D/g, ''));
      if (result) {
        const fullAddress = `${result.street}, ${result.neighborhood}, ${result.city} - ${result.state}, ${result.cep}`;
        setEditForm(prev => ({ ...prev, address: fullAddress }));
      }
    } else if (addressSearchType === 'street' && addressSearchData.street && addressSearchData.city && addressSearchData.state) {
      const result = await searchByStreet(addressSearchData.street, addressSearchData.city, addressSearchData.state);
      if (result) {
        const fullAddress = `${result.street}, ${result.neighborhood}, ${result.city} - ${result.state}, ${result.cep}`;
        setEditForm(prev => ({ ...prev, address: fullAddress }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Formatação do CPF
    if (field === 'cpf') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 11) {
        if (numbers.length <= 3) {
          formattedValue = numbers;
        } else if (numbers.length <= 6) {
          formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        } else if (numbers.length <= 9) {
          formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        } else {
          formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
        }
      }
    }

    // Formatação do telefone
    if (field === 'phone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 11) {
        if (numbers.length <= 2) {
          formattedValue = `(${numbers}`;
        } else if (numbers.length <= 6) {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 10) {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        } else {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }
      }
    }

    setEditForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const handleAvatarSuccess = (avatarUrl: string) => {
    // O paciente será atualizado automaticamente através do hook
    setShowAvatarModal(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        setAddressSearchData({ cep: '', street: '', city: '', state: '' });
        clearAddress();
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Informações do Paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações básicas do paciente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="avatar" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="avatar" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Foto
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Profissional
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Saúde
              </TabsTrigger>
            </TabsList>

            {/* Tab - Foto do Paciente */}
            <TabsContent value="avatar" className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage 
                      src={getAvatarUrl(paciente?.avatar)} 
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {paciente?.nome?.charAt(0)?.toUpperCase() || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    title="Redimensionar foto"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Foto do Paciente</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique no ícone da paleta para redimensionar a foto
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab - Dados Pessoais */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Nome completo"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={editForm.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={editForm.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Saúde (Contatos de Emergência e Medicações) movidos para aba dedicada */}
              </div>
            </TabsContent>

            {/* Tab - Saúde */}
            <TabsContent value="health" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Contatos de Emergência */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Contatos de Emergência</h3>
                  </div>
                  
                  {emergencyContacts.length > 0 ? (
                    <div className="space-y-2">
                      {emergencyContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div>
                            <div className="font-medium text-sm">{contact.nome}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{contact.telefone}</div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmergencyContact(contact.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                      Nenhum contato de emergência adicionado
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Nome do responsável"
                        value={newEmergencyContact.nome}
                        onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, nome: e.target.value })}
                        className="h-9 text-sm"
                      />
                      <Input
                        placeholder="Telefone"
                        value={newEmergencyContact.telefone}
                        onChange={(e) => setNewEmergencyContact({ ...newEmergencyContact, telefone: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddEmergencyContact} 
                      disabled={!newEmergencyContact.nome.trim() || !newEmergencyContact.telefone.trim()}
                      size="sm"
                      className="w-full"
                    >
                      Adicionar Contato
                    </Button>
                  </div>
                </div>

                {/* Medicações */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Medicações</h3>
                  </div>
                  
                  {medications.length > 0 ? (
                    <div className="space-y-2">
                      {medications.map((med) => (
                        <div key={med.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{med.nome}</div>
                              {med.prescricao && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{med.prescricao}</div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMedication(med.id)}
                              className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma medicação adicionada
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Nome do medicamento"
                      value={newMedication.nome}
                      onChange={(e) => setNewMedication({ ...newMedication, nome: e.target.value })}
                      className="h-9 text-sm"
                    />
                    <Textarea
                      placeholder="Prescrição do médico"
                      value={newMedication.prescricao}
                      onChange={(e) => setNewMedication({ ...newMedication, prescricao: e.target.value })}
                      rows={2}
                      className="text-sm"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddMedication} 
                      disabled={!newMedication.nome.trim()}
                      size="sm"
                      className="w-full"
                    >
                      Adicionar Medicação
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab - Endereço */}
            <TabsContent value="address" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Buscar Endereço</Label>
                  <div className="flex gap-2">
                    <Select value={addressSearchType} onValueChange={(value: 'cep' | 'street') => setAddressSearchType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cep">Por CEP</SelectItem>
                        <SelectItem value="street">Por Rua</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSearchAddress}
                      disabled={addressLoading}
                      className="flex-shrink-0"
                    >
                      {addressLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>

                {addressSearchType === 'cep' ? (
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      placeholder="00000-000"
                      value={addressSearchData.cep}
                      onChange={(e) => setAddressSearchData({ ...addressSearchData, cep: formatCEP(e.target.value) })}
                      maxLength={9}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>Rua</Label>
                      <Input
                        placeholder="Nome da rua"
                        value={addressSearchData.street}
                        onChange={(e) => setAddressSearchData({ ...addressSearchData, street: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        placeholder="Nome da cidade"
                        value={addressSearchData.city}
                        onChange={(e) => setAddressSearchData({ ...addressSearchData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={addressSearchData.state} onValueChange={(value) => setAddressSearchData({ ...addressSearchData, state: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Endereço Completo</Label>
                  <Textarea
                    placeholder="Endereço completo (será preenchido automaticamente ou pode ser editado manualmente)"
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab - Informações Profissionais */}
            <TabsContent value="professional" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input
                    placeholder="Profissão"
                    value={editForm.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                  />
                </div>

                {/* Contato de Emergência removido desta seção (mantido na aba de dados pessoais estruturado) */}

                <div className="space-y-2">
                  <Label>Observações Gerais</Label>
                  <Textarea
                    placeholder="Observações sobre o paciente"
                    value={editForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de Upload de Avatar */}
      <PacienteAvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSuccess={handleAvatarSuccess}
        pacienteId={paciente?.id}
        pacienteNome={paciente?.nome}
        currentAvatar={paciente?.avatar}
      />
    </Dialog>
  );
};
