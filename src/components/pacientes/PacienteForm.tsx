import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Loader2 } from 'lucide-react';
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
    telefone: '',
    profissao: '',
    nascimento: '',
    cpf: '',
    genero: '',
    observacao_geral: '',
    contato_emergencia: '',
    medicacoes: [],
    status: 0
  });

  useEffect(() => {
    if (paciente && mode === 'edit') {
      setFormData({
        nome: paciente.nome || '',
        email: paciente.email || '',
        endereco: paciente.endereco || '',
        telefone: paciente.telefone || '',
        profissao: paciente.profissao || '',
        nascimento: paciente.nascimento || '',
        cpf: paciente.cpf || '',
        genero: paciente.genero || '',
        observacao_geral: paciente.observacao_geral || '',
        contato_emergencia: paciente.contato_emergencia || '',
        medicacoes: paciente.medicacoes || [],
        status: paciente.status
      });
    }
  }, [paciente, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'edit' && paciente) {
        // Para edição, incluir o ID do paciente
        await onSubmit({ ...formData, id: paciente.id });
      } else {
        // Para criação, enviar apenas os dados
        await onSubmit(formData);
      }
      setOpen(false);
      // Reset form
      setFormData({
        nome: '',
        email: '',
        endereco: '',
        telefone: '',
        profissao: '',
        nascimento: '',
        cpf: '',
        genero: '',
        observacao_geral: '',
        contato_emergencia: '',
        medicacoes: [],
        status: 0
      });
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
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
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
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
             // Formulário simplificado para criação
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
                 <Label htmlFor="email">Email *</Label>
                 <Input
                   id="email"
                   type="email"
                   value={formData.email}
                   onChange={(e) => handleInputChange('email', e.target.value)}
                   placeholder="email@exemplo.com"
                   required
                 />
               </div>

                               {/* Telefone */}
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    required
                  />
                </div>

                {/* CPF */}
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                               {/* Data de Nascimento */}
                <div>
                  <Label htmlFor="nascimento">Data de Nascimento *</Label>
                  <Input
                    id="nascimento"
                    type="date"
                    value={formData.nascimento}
                    onChange={(e) => handleInputChange('nascimento', e.target.value)}
                    required
                  />
                </div>

                {/* Gênero */}
                <div>
                  <Label htmlFor="genero">Gênero *</Label>
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
             </div>
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