import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Loader2 } from 'lucide-react';

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
    genero: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setOpen(false);
      // Reset form
      setFormData({
        nome: '',
        telefone: '',
        nascimento: '',
        genero: ''
      });
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    }
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

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
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
