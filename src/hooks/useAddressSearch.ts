import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export function useAddressSearch() {
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const { toast } = useToast();

  const searchByCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) {
      return null;
    }

    setLoading(true);
    try {
      // Limpar CEP (remover caracteres especiais)
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        toast({
          title: "CEP Inválido",
          description: "O CEP deve ter 8 dígitos.",
          variant: "destructive",
        });
        return null;
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Não foi possível encontrar o endereço para este CEP.",
          variant: "destructive",
        });
        return null;
      }

      setAddressData(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchByStreet = useCallback(async (street: string, city: string, state: string) => {
    if (!street || !city || !state) {
      toast({
        title: "Dados incompletos",
        description: "Preencha rua, cidade e estado para buscar.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${state}/${city}/${street}/json/`
      );
      const data = await response.json();

      if (data.length === 0) {
        toast({
          title: "Endereço não encontrado",
          description: "Não foi possível encontrar endereços com esses dados.",
          variant: "destructive",
        });
        return null;
      }

      // Retorna o primeiro resultado encontrado
      setAddressData(data[0]);
      return data[0];
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const clearAddress = useCallback(() => {
    setAddressData(null);
  }, []);

  return {
    loading,
    addressData,
    searchByCEP,
    searchByStreet,
    clearAddress,
  };
} 