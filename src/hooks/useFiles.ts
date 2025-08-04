import { useState, useEffect } from "react";
import { useToast } from '@/hooks/use-toast';

export interface FileRecord {
  id: string;
  user_id: string;
  patient_id?: string;
  name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  category: "documento" | "exame" | "relatorio" | "outros";
  created_at: string;
}

// Dados mockados
const mockFiles: FileRecord[] = [
  {
    id: '1',
    user_id: 'user-1',
    patient_id: '1',
    name: 'Avaliação Psicológica - Maria Silva.pdf',
    file_type: 'application/pdf',
    file_size: 245760,
    file_path: '/files/avaliacao_maria.pdf',
    category: 'relatorio',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    patient_id: '2',
    name: 'Exame de Sangue - João Santos.pdf',
    file_type: 'application/pdf',
    file_size: 512000,
    file_path: '/files/exame_joao.pdf',
    category: 'exame',
    created_at: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    user_id: 'user-1',
    patient_id: '3',
    name: 'Termo de Consentimento - Ana Costa.pdf',
    file_type: 'application/pdf',
    file_size: 128000,
    file_path: '/files/termo_ana.pdf',
    category: 'documento',
    created_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    user_id: 'user-1',
    patient_id: '5',
    name: 'Relatório de Sessão - Lucia Ferreira.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 89000,
    file_path: '/files/relatorio_lucia.docx',
    category: 'relatorio',
    created_at: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    user_id: 'user-1',
    name: 'Material Terapêutico - Exercícios.pdf',
    file_type: 'application/pdf',
    file_size: 1024000,
    file_path: '/files/material_terapeutico.pdf',
    category: 'outros',
    created_at: '2024-01-11T11:20:00Z'
  }
];

export function useFiles() {
  const [files, setFiles] = useState<FileRecord[]>(mockFiles);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles(mockFiles);
    } catch (error: any) {
      console.error('Erro ao buscar arquivos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os arquivos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, patientId?: string, category: FileRecord['category'] = 'documento') => {
    try {
      const newFile: FileRecord = {
        id: Date.now().toString(),
        user_id: 'user-1',
        patient_id: patientId,
        name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: `/files/${file.name}`,
        category: category,
        created_at: new Date().toISOString()
      };

      setFiles(prev => [newFile, ...prev]);
      
      toast({
        title: 'Arquivo enviado!',
        description: 'O arquivo foi carregado com sucesso.',
      });

      return newFile;
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: 'Arquivo removido!',
        description: 'O arquivo foi excluído com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o arquivo.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getFilesByPatientId = (patientId: string) => {
    return files.filter(file => file.patient_id === patientId);
  };

  const getFileUrl = async (filePath: string) => {
    // Simular URL de arquivo
    return `https://exemplo.com${filePath}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilesByCategory = (category: FileRecord['category']) => {
    return files.filter(file => file.category === category);
  };

  const searchFiles = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(lowerQuery) ||
      file.category.toLowerCase().includes(lowerQuery)
    );
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    loading,
    uploadFile,
    deleteFile,
    getFilesByPatientId,
    getFileUrl,
    formatFileSize,
    getFilesByCategory,
    searchFiles,
    refetch: fetchFiles
  };
}