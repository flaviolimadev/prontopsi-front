import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Loader2, UserPlus, UserMinus } from 'lucide-react';

interface RegistroRapidoFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export const RegistroRapidoForm: React.FC<RegistroRapidoFormProps> = ({
  onSubmit,
  loading = false
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    nascimento: '',
    genero: '',
    is_menor: false,
    responsavel1_nome: '',
    responsavel1_telefone: '',
    responsavel1_parentesco: '',
    responsavel2_nome: '',
    responsavel2_telefone: '',
    responsavel2_parentesco: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validação para pacientes menores de idade
      if (formData.is_menor) {
        if (!formData.responsavel1_nome || !formData.responsavel1_telefone || !formData.responsavel1_parentesco) {
          alert('Para pacientes menores de idade, é obrigatório informar os dados do responsável 1 (nome, telefone e parentesco).');
          return;
        }
      }

      // Montar payload
      const payload: any = { ...formData, status: 1 };
      if (formData.is_menor) {
        const emergencyContacts: string[] = [];
        if (formData.responsavel1_nome && formData.responsavel1_telefone) {
          emergencyContacts.push(`${formData.responsavel1_nome} (${formData.responsavel1_parentesco}): ${formData.responsavel1_telefone}`);
        }
        if (formData.responsavel2_nome && formData.responsavel2_telefone) {
          emergencyContacts.push(`${formData.responsavel2_nome} (${formData.responsavel2_parentesco}): ${formData.responsavel2_telefone}`);
        }
        if (emergencyContacts.length > 0) {
          payload.contato_emergencia = emergencyContacts.join(' | ');
        }
      }

      await onSubmit(payload);
      setOpen(false);
      // Reset form
      setFormData({
        nome: '',
        telefone: '',
        nascimento: '',
        genero: '',
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

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Formatação do telefone - apenas números válidos
    if (field === 'telefone') {
      const numbers = value.replace(/\D/g, '');
      
      // Validar se é um número válido (10 ou 11 dígitos)
      if (numbers.length >= 10 && numbers.length <= 11) {
        if (numbers.length === 10) {
          // Telefone fixo: (11) 3333-3333
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        } else {
          // Celular: (11) 99999-9999
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }
      } else if (numbers.length < 10) {
        // Formatação parcial enquanto digita
        if (numbers.length <= 2) {
          formattedValue = `(${numbers}`;
        } else if (numbers.length <= 6) {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 10) {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        }
      } else {
        // Se exceder 11 dígitos, não formata
        return;
      }
    }

    // Formatação dos telefones dos responsáveis
    if (field === 'responsavel1_telefone' || field === 'responsavel2_telefone') {
      const numbers = value.replace(/\D/g, '');
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

    setFormData(prev => {
      const updated: any = { ...prev, [field]: formattedValue };
      if (field === 'nascimento') {
        updated.is_menor = calculateIsMinor(formattedValue);
      }
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="ml-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          <Zap className="h-4 w-4 mr-2 animate-pulse" />
          Registro Rápido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registro Rápido de Paciente</DialogTitle>
          <DialogDescription>
            Cadastre um paciente com informações básicas. Você pode completar os dados posteriormente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(11) 99999-9999"
              required
              maxLength={15}
              pattern="^\(\d{2}\) \d{4,5}-\d{4}$"
              title="Formato: (11) 99999-9999 ou (11) 3333-3333"
            />
            <p className="text-xs text-muted-foreground">
              Digite apenas números. O formato será aplicado automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nascimento">Data de Nascimento *</Label>
            <Input
              id="nascimento"
              type="date"
              value={formData.nascimento}
              onChange={(e) => handleInputChange('nascimento', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Gênero *</Label>
            <Select
              value={formData.genero}
              onValueChange={(value) => handleInputChange('genero', value)}
              required
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
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
