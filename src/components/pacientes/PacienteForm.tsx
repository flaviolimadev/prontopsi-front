import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { Paciente } from '@/hooks/usePacientes';

interface PacienteFormProps {
  paciente?: Paciente | null;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export const PacienteForm: React.FC<PacienteFormProps> = ({
  paciente,
  onSubmit,
  loading = false,
  mode
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    endereco: '',
    cep: '',
    telefone: '',
    profissao: '',
    nascimento: '',
    cpf: '',
    genero: '',
    observacao_geral: '',
    contato_emergencia: '',
    medicacoes: [],
    status: 1,
    cor: '#3B82F6',
    is_menor: false,
    responsavel1_nome: '',
    responsavel1_telefone: '',
    responsavel1_parentesco: '',
    responsavel2_nome: '',
    responsavel2_telefone: '',
    responsavel2_parentesco: ''
  });

  useEffect(() => {
    if (paciente && mode === 'edit') {
      setFormData({
        nome: paciente.nome || '',
        email: paciente.email || '',
        endereco: paciente.endereco || '',
        cep: paciente.cep || '',
        telefone: paciente.telefone || '',
        profissao: paciente.profissao || '',
        nascimento: paciente.nascimento || '',
        cpf: paciente.cpf || '',
        genero: paciente.genero || '',
        observacao_geral: paciente.observacao_geral || '',
        contato_emergencia: paciente.contato_emergencia || '',
        medicacoes: paciente.medicacoes || [],
        status: paciente.status,
        cor: paciente.cor || '#3B82F6',
        is_menor: paciente.is_menor || false,
        responsavel1_nome: paciente.responsavel1_nome || '',
        responsavel1_telefone: paciente.responsavel1_telefone || '',
        responsavel1_parentesco: paciente.responsavel1_parentesco || '',
        responsavel2_nome: paciente.responsavel2_nome || '',
        responsavel2_telefone: paciente.responsavel2_telefone || '',
        responsavel2_parentesco: paciente.responsavel2_parentesco || ''
      });
    }
  }, [paciente, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação para pacientes menores de idade
    if (formData.is_menor) {
      if (!formData.responsavel1_nome || !formData.responsavel1_telefone || !formData.responsavel1_parentesco) {
        alert('Para pacientes menores de idade, é obrigatório informar os dados do responsável 1 (nome, telefone e parentesco).');
        return;
      }
    }
    
    try {
      // Se for menor de idade, salvar responsáveis como contatos de emergência
      let dataToSubmit = { ...formData };
      
      if (formData.is_menor) {
        let emergencyContacts = [];
        
        if (formData.responsavel1_nome && formData.responsavel1_telefone) {
          emergencyContacts.push(`${formData.responsavel1_nome} (${formData.responsavel1_parentesco}): ${formData.responsavel1_telefone}`);
        }
        
        if (formData.responsavel2_nome && formData.responsavel2_telefone) {
          emergencyContacts.push(`${formData.responsavel2_nome} (${formData.responsavel2_parentesco}): ${formData.responsavel2_telefone}`);
        }
        
        // Se não há contato de emergência preenchido, usar os responsáveis
        if (!formData.contato_emergencia && emergencyContacts.length > 0) {
          dataToSubmit.contato_emergencia = emergencyContacts.join(' | ');
        }
      }
      
      if (mode === 'edit' && paciente) {
        // Para edição, incluir o ID do paciente
        await onSubmit({ ...dataToSubmit, id: paciente.id });
      } else {
        // Para criação, enviar apenas os dados
        await onSubmit(dataToSubmit);
      }
      setOpen(false);
      // Reset form
      setFormData({
        nome: '',
        email: '',
        endereco: '',
        cep: '',
        telefone: '',
        profissao: '',
        nascimento: '',
        cpf: '',
        genero: '',
        observacao_geral: '',
        contato_emergencia: '',
        medicacoes: [],
        status: 1,
        cor: '#3B82F6',
        is_menor: false,
        responsavel1_nome: '',
        responsavel1_telefone: '',
        responsavel1_parentesco: '',
        responsavel2_nome: '',
        responsavel2_telefone: '',
        responsavel2_parentesco: ''
      });
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    }
  };

  // Função para calcular se é menor de idade
  const calculateIsMinor = (birthDate: string) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 < 18;
    }
    return age < 18;
  };

  // Função para buscar CEP
  const handleCepSearch = async () => {
    if (!formData.cep || formData.cep.length < 8) return;
    
    try {
      const cleanCep = formData.cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`;
        setFormData(prev => ({
          ...prev,
          endereco: endereco
        }));
      } else {
        alert('CEP não encontrado. Verifique e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Tente novamente.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Formatação do CPF
    if (field === 'cpf') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara do CPF
      if (numbers.length <= 3) {
        formattedValue = numbers;
      } else if (numbers.length <= 6) {
        formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      } else if (numbers.length <= 9) {
        formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      } else {
        formattedValue = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
      }
    }
    
    // Formatação do telefone
    if (field === 'telefone') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara do telefone
      if (numbers.length <= 2) {
        formattedValue = `(${numbers}`;
      } else if (numbers.length <= 6) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 10) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    
    // Formatação do contato de emergência (mesma lógica do telefone)
    if (field === 'contato_emergencia') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara do telefone
      if (numbers.length <= 2) {
        formattedValue = `(${numbers}`;
      } else if (numbers.length <= 6) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 10) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    
    // Formatação dos telefones dos responsáveis (mesma lógica do telefone)
    if (field === 'responsavel1_telefone' || field === 'responsavel2_telefone') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara do telefone
      if (numbers.length <= 2) {
        formattedValue = `(${numbers}`;
      } else if (numbers.length <= 6) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length <= 10) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    
    // Formatação do CEP
    if (field === 'cep') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara do CEP
      if (numbers.length <= 5) {
        formattedValue = numbers;
      } else {
        formattedValue = `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
      }
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: formattedValue
      };
      
      // Se a data de nascimento foi alterada, recalcular se é menor
      if (field === 'nascimento') {
        newData.is_menor = calculateIsMinor(formattedValue);
      }
      
      return newData;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm">
          {mode === 'create' ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Novo Paciente
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Novo Paciente' : 'Editar Paciente'}
          </DialogTitle>
                     <DialogDescription>
             {mode === 'create' 
               ? 'Preencha os dados obrigatórios do novo paciente. Os demais campos podem ser adicionados posteriormente.' 
               : 'Atualize os dados do paciente.'
             }
           </DialogDescription>
        </DialogHeader>

                 <form onSubmit={handleSubmit} className="space-y-4">
           {mode === 'create' ? (
             <Tabs defaultValue="personal" className="w-full">
               <TabsList className="grid w-full grid-cols-3">
                 <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                 <TabsTrigger value="address">Endereço</TabsTrigger>
                 <TabsTrigger value="professional">Profissional</TabsTrigger>
               </TabsList>
               <TabsContent value="personal" className="mt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                     <Label htmlFor="nome">Nome Completo *</Label>
                     <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} placeholder="Nome completo do paciente" required />
                   </div>
                   <div>
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@exemplo.com" />
                   </div>
                   <div>
                     <Label htmlFor="telefone">Telefone</Label>
                     <Input id="telefone" value={formData.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} placeholder="(11) 99999-9999" maxLength={15} />
                   </div>
                   <div>
                     <Label htmlFor="cpf">CPF</Label>
                     <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} placeholder="000.000.000-00" maxLength={14} />
                   </div>
                   <div>
                     <Label htmlFor="nascimento">Data de Nascimento</Label>
                     <Input id="nascimento" type="date" value={formData.nascimento} onChange={(e) => handleInputChange('nascimento', e.target.value)} />
                   </div>
                   <div>
                     <Label htmlFor="genero">Gênero</Label>
                     <Select value={formData.genero} onValueChange={(value) => handleInputChange('genero', value)}>
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
                   {formData.nascimento && (
                     <div className="md:col-span-2">
                       <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                         {formData.is_menor ? (
                           <>
                             <UserMinus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                             <span className="text-blue-800 dark:text-blue-200 font-medium">Paciente menor de idade</span>
                           </>
                         ) : (
                           <>
                             <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                             <span className="text-green-800 dark:text-green-200 font-medium">Paciente maior de idade</span>
                           </>
                         )}
                       </div>
                     </div>
                   )}

                   {formData.is_menor && (
                     <>
                       <div className="md:col-span-2">
                         <div className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                           <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                             <UserPlus className="w-4 h-4" />
                             Responsável 1 *
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div>
                               <Label htmlFor="responsavel1_nome">Nome Completo *</Label>
                               <Input id="responsavel1_nome" value={formData.responsavel1_nome} onChange={(e) => handleInputChange('responsavel1_nome', e.target.value)} placeholder="Nome do responsável" required />
                             </div>
                             <div>
                               <Label htmlFor="responsavel1_telefone">Telefone *</Label>
                               <Input id="responsavel1_telefone" value={formData.responsavel1_telefone} onChange={(e) => handleInputChange('responsavel1_telefone', e.target.value)} placeholder="(11) 99999-9999" maxLength={15} required />
                             </div>
                             <div>
                               <Label htmlFor="responsavel1_parentesco">Parentesco *</Label>
                               <Select value={formData.responsavel1_parentesco} onValueChange={(value) => handleInputChange('responsavel1_parentesco', value)}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Selecione" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="Pai">Pai</SelectItem>
                                   <SelectItem value="Mãe">Mãe</SelectItem>
                                   <SelectItem value="Avô">Avô</SelectItem>
                                   <SelectItem value="Avó">Avó</SelectItem>
                                   <SelectItem value="Tio">Tio</SelectItem>
                                   <SelectItem value="Tia">Tia</SelectItem>
                                   <SelectItem value="Irmão">Irmão</SelectItem>
                                   <SelectItem value="Irmã">Irmã</SelectItem>
                                   <SelectItem value="Tutor">Tutor</SelectItem>
                                   <SelectItem value="Outro">Outro</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                           </div>
                         </div>
                       </div>
                       <div className="md:col-span-2">
                         <div className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                           <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                             <UserPlus className="w-4 h-4" />
                             Responsável 2 (Opcional)
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div>
                               <Label htmlFor="responsavel2_nome">Nome Completo</Label>
                               <Input id="responsavel2_nome" value={formData.responsavel2_nome} onChange={(e) => handleInputChange('responsavel2_nome', e.target.value)} placeholder="Nome do segundo responsável" />
                             </div>
                             <div>
                               <Label htmlFor="responsavel2_telefone">Telefone</Label>
                               <Input id="responsavel2_telefone" value={formData.responsavel2_telefone} onChange={(e) => handleInputChange('responsavel2_telefone', e.target.value)} placeholder="(11) 99999-9999" maxLength={15} />
                             </div>
                             <div>
                               <Label htmlFor="responsavel2_parentesco">Parentesco</Label>
                               <Select value={formData.responsavel2_parentesco} onValueChange={(value) => handleInputChange('responsavel2_parentesco', value)}>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Selecione" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="Pai">Pai</SelectItem>
                                   <SelectItem value="Mãe">Mãe</SelectItem>
                                   <SelectItem value="Avô">Avô</SelectItem>
                                   <SelectItem value="Avó">Avó</SelectItem>
                                   <SelectItem value="Tio">Tio</SelectItem>
                                   <SelectItem value="Tia">Tia</SelectItem>
                                   <SelectItem value="Irmão">Irmão</SelectItem>
                                   <SelectItem value="Irmã">Irmã</SelectItem>
                                   <SelectItem value="Tutor">Tutor</SelectItem>
                                   <SelectItem value="Outro">Outro</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                           </div>
                         </div>
                       </div>
                     </>
                   )}
                 </div>
               </TabsContent>
               <TabsContent value="address" className="mt-4">
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="cep">CEP</Label>
                       <Input 
                         id="cep" 
                         value={formData.cep || ''} 
                         onChange={(e) => handleInputChange('cep', e.target.value)} 
                         placeholder="00000-000" 
                         maxLength={9}
                       />
                       <Button 
                         type="button" 
                         variant="outline" 
                         size="sm" 
                         className="mt-2 w-full"
                         onClick={handleCepSearch}
                         disabled={!formData.cep || formData.cep.length < 8}
                       >
                         Buscar CEP
                       </Button>
                     </div>
                     <div>
                       <Label htmlFor="endereco">Endereço</Label>
                       <Textarea 
                         id="endereco" 
                         value={formData.endereco} 
                         onChange={(e) => handleInputChange('endereco', e.target.value)} 
                         placeholder="Endereço completo" 
                         rows={2} 
                       />
                     </div>
                   </div>
                 </div>
               </TabsContent>
               <TabsContent value="professional" className="mt-4">
                 <div className="space-y-4">
                   <div>
                     <Label htmlFor="profissao">Profissão</Label>
                     <Input id="profissao" value={formData.profissao} onChange={(e) => handleInputChange('profissao', e.target.value)} placeholder="Profissão do paciente" />
                   </div>
                   <div>
                     <Label htmlFor="status">Status</Label>
                     <Select value={formData.status.toString()} onValueChange={(value) => handleInputChange('status', value)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione o status" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="0">Inativo</SelectItem>
                         <SelectItem value="1">Ativo</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label htmlFor="cor">Cor de Identificação</Label>
                     <div className="flex items-center space-x-2">
                       <Input id="cor" type="color" value={formData.cor} onChange={(e) => handleInputChange('cor', e.target.value)} className="w-16 h-10 p-1 border rounded" />
                       <Input value={formData.cor} onChange={(e) => handleInputChange('cor', e.target.value)} placeholder="#3B82F6" className="flex-1" />
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">Escolha uma cor para identificar o paciente na agenda</p>
                   </div>
                   <div>
                     <Label htmlFor="observacao_geral">Observações Gerais</Label>
                     <Textarea id="observacao_geral" value={formData.observacao_geral} onChange={(e) => handleInputChange('observacao_geral', e.target.value)} placeholder="Observações importantes sobre o paciente" rows={3} />
                   </div>
                 </div>
               </TabsContent>
             </Tabs>
           ) : (
             // Formulário completo para edição
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Nome */}
                 <div className="md:col-span-2">
                   <Label htmlFor="nome">Nome Completo *</Label>
                   <Input
                     id="nome"
                     value={formData.nome}
                     onChange={(e) => handleInputChange('nome', e.target.value)}
                     placeholder="Nome completo do paciente"
                     required
                   />
                 </div>

                 {/* Email */}
                 <div>
                   <Label htmlFor="email">Email</Label>
                   <Input
                     id="email"
                     type="email"
                     value={formData.email}
                     onChange={(e) => handleInputChange('email', e.target.value)}
                     placeholder="email@exemplo.com"
                   />
                 </div>

                                   {/* Telefone */}
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>

                  {/* CPF */}
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>

                 {/* Data de Nascimento */}
                 <div>
                   <Label htmlFor="nascimento">Data de Nascimento</Label>
                   <Input
                     id="nascimento"
                     type="date"
                     value={formData.nascimento}
                     onChange={(e) => handleInputChange('nascimento', e.target.value)}
                   />
                 </div>

                 {/* Gênero */}
                 <div>
                   <Label htmlFor="genero">Gênero</Label>
                   <Select value={formData.genero} onValueChange={(value) => handleInputChange('genero', value)}>
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

                 {/* Indicador de Menor de Idade */}
                 {formData.nascimento && (
                   <div className="md:col-span-2">
                     <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                       {formData.is_menor ? (
                         <>
                           <UserMinus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                           <span className="text-blue-800 dark:text-blue-200 font-medium">Paciente menor de idade</span>
                         </>
                       ) : (
                         <>
                           <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                           <span className="text-green-800 dark:text-green-200 font-medium">Paciente maior de idade</span>
                         </>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Responsáveis (apenas se for menor de idade) */}
                 {formData.is_menor && (
                   <>
                     {/* Responsável 1 */}
                     <div className="md:col-span-2">
                       <div className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                         <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
                           <UserPlus className="w-4 h-4" />
                           Responsável 1 *
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <div>
                             <Label htmlFor="responsavel1_nome">Nome Completo *</Label>
                             <Input
                               id="responsavel1_nome"
                               value={formData.responsavel1_nome}
                               onChange={(e) => handleInputChange('responsavel1_nome', e.target.value)}
                               placeholder="Nome do responsável"
                               required
                             />
                           </div>
                           <div>
                             <Label htmlFor="responsavel1_telefone">Telefone *</Label>
                             <Input
                               id="responsavel1_telefone"
                               value={formData.responsavel1_telefone}
                               onChange={(e) => handleInputChange('responsavel1_telefone', e.target.value)}
                               placeholder="(11) 99999-9999"
                               maxLength={15}
                               required
                             />
                           </div>
                           <div>
                             <Label htmlFor="responsavel1_parentesco">Parentesco *</Label>
                             <Select value={formData.responsavel1_parentesco} onValueChange={(value) => handleInputChange('responsavel1_parentesco', value)}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecione" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Pai">Pai</SelectItem>
                                 <SelectItem value="Mãe">Mãe</SelectItem>
                                 <SelectItem value="Avô">Avô</SelectItem>
                                 <SelectItem value="Avó">Avó</SelectItem>
                                 <SelectItem value="Tio">Tio</SelectItem>
                                 <SelectItem value="Tia">Tia</SelectItem>
                                 <SelectItem value="Irmão">Irmão</SelectItem>
                                 <SelectItem value="Irmã">Irmã</SelectItem>
                                 <SelectItem value="Tutor">Tutor</SelectItem>
                                 <SelectItem value="Outro">Outro</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Responsável 2 (opcional) */}
                     <div className="md:col-span-2">
                       <div className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                         <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                           <UserPlus className="w-4 h-4" />
                           Responsável 2 (Opcional)
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                           <div>
                             <Label htmlFor="responsavel2_nome">Nome Completo</Label>
                             <Input
                               id="responsavel2_nome"
                               value={formData.responsavel2_nome}
                               onChange={(e) => handleInputChange('responsavel2_nome', e.target.value)}
                               placeholder="Nome do segundo responsável"
                             />
                           </div>
                           <div>
                             <Label htmlFor="responsavel2_telefone">Telefone</Label>
                             <Input
                               id="responsavel2_telefone"
                               value={formData.responsavel2_telefone}
                               onChange={(e) => handleInputChange('responsavel2_telefone', e.target.value)}
                               placeholder="(11) 99999-9999"
                               maxLength={15}
                             />
                           </div>
                           <div>
                             <Label htmlFor="responsavel2_parentesco">Parentesco</Label>
                             <Select value={formData.responsavel2_parentesco} onValueChange={(value) => handleInputChange('responsavel2_parentesco', value)}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Selecione" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Pai">Pai</SelectItem>
                                 <SelectItem value="Mãe">Mãe</SelectItem>
                                 <SelectItem value="Avô">Avô</SelectItem>
                                 <SelectItem value="Avó">Avó</SelectItem>
                                 <SelectItem value="Tio">Tio</SelectItem>
                                 <SelectItem value="Tia">Tia</SelectItem>
                                 <SelectItem value="Irmão">Irmão</SelectItem>
                                 <SelectItem value="Irmã">Irmã</SelectItem>
                                 <SelectItem value="Tutor">Tutor</SelectItem>
                                 <SelectItem value="Outro">Outro</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                         </div>
                       </div>
                     </div>
                   </>
                 )}

                 {/* Profissão */}
                 <div>
                   <Label htmlFor="profissao">Profissão</Label>
                   <Input
                     id="profissao"
                     value={formData.profissao}
                     onChange={(e) => handleInputChange('profissao', e.target.value)}
                     placeholder="Profissão do paciente"
                   />
                 </div>

                 {/* Status */}
                 <div>
                   <Label htmlFor="status">Status</Label>
                   <Select value={formData.status.toString()} onValueChange={(value) => handleInputChange('status', value)}>
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione o status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="0">Inativo</SelectItem>
                       <SelectItem value="1">Ativo</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Cor */}
                 <div>
                   <Label htmlFor="cor">Cor de Identificação</Label>
                   <div className="flex items-center space-x-2">
                     <Input
                       id="cor"
                       type="color"
                       value={formData.cor}
                       onChange={(e) => handleInputChange('cor', e.target.value)}
                       className="w-16 h-10 p-1 border rounded"
                     />
                     <Input
                       value={formData.cor}
                       onChange={(e) => handleInputChange('cor', e.target.value)}
                       placeholder="#3B82F6"
                       className="flex-1"
                     />
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     Escolha uma cor para identificar o paciente na agenda
                   </p>
                 </div>
               </div>

               {/* Endereço */}
               <div>
                 <Label htmlFor="endereco">Endereço</Label>
                 <Textarea
                   id="endereco"
                   value={formData.endereco}
                   onChange={(e) => handleInputChange('endereco', e.target.value)}
                   placeholder="Endereço completo"
                   rows={2}
                 />
               </div>

                               {/* Contato de Emergência */}
                <div>
                  <Label htmlFor="contato_emergencia">Contato de Emergência</Label>
                  <Input
                    id="contato_emergencia"
                    value={formData.contato_emergencia}
                    onChange={(e) => handleInputChange('contato_emergencia', e.target.value)}
                    placeholder="Nome e telefone do contato de emergência"
                    maxLength={50}
                  />
                </div>

               {/* Observações Gerais */}
               <div>
                 <Label htmlFor="observacao_geral">Observações Gerais</Label>
                 <Textarea
                   id="observacao_geral"
                   value={formData.observacao_geral}
                   onChange={(e) => handleInputChange('observacao_geral', e.target.value)}
                   placeholder="Observações importantes sobre o paciente"
                   rows={3}
                 />
               </div>
             </>
           )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Criar Paciente' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 