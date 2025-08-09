import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Palette
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { Paciente } from '@/hooks/usePacientes';
import { EditPacienteModal } from './EditPacienteModal';

interface PacientesTableProps {
  pacientes: Paciente[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onSearch: (search: string) => void;
  onStatusFilter: (status: number | undefined) => void;
  onPageChange: (page: number) => void;
  onEdit: (paciente: Paciente) => void;
  onUpdateColor: (id: string, cor: string) => void;
  onDelete: (id: string) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}

export const PacientesTable: React.FC<PacientesTableProps> = ({
  pacientes,
  loading,
  total,
  page,
  totalPages,
  onSearch,
  onStatusFilter,
  onPageChange,
  onEdit,
  onUpdateColor,
  onDelete,
  onDeactivate,
  onReactivate
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [selectedPacienteForColor, setSelectedPacienteForColor] = useState<Paciente | null>(null);
  const [newColor, setNewColor] = useState('#3B82F6');
  const [updatingColor, setUpdatingColor] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusFilter = (value: string) => {
    const status = value === 'all' ? undefined : parseInt(value);
    onStatusFilter(status);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Não informado';
    return phone;
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge variant="default" className="bg-green-500">Ativo</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500">Inativo</Badge>
    );
  };

  const handleViewPaciente = (paciente: Paciente) => {
    navigate(`/pacientes/${paciente.id}`);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    try {
      await onEdit(data);
      setEditModalOpen(false);
      setSelectedPaciente(null);
    } catch (error) {
      console.error('Erro ao editar paciente:', error);
    }
  };

  const handleDeletePaciente = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      await onDelete(id);
    }
  };

  const handleStatusChange = async (paciente: Paciente) => {
    if (paciente.status === 1) {
      await onDeactivate(paciente.id);
    } else {
      await onReactivate(paciente.id);
    }
  };

  const handleColorChange = (paciente: Paciente) => {
    setSelectedPacienteForColor(paciente);
    setNewColor(paciente.cor || '#3B82F6');
    setColorModalOpen(true);
  };

  const handleColorSubmit = async () => {
    if (!selectedPacienteForColor) return;
    
    setUpdatingColor(true);
    try {
      await onUpdateColor(selectedPacienteForColor.id, newColor);
      setColorModalOpen(false);
      setSelectedPacienteForColor(null);
      setNewColor('#3B82F6');
    } catch (error) {
      console.error('Erro ao atualizar cor do paciente:', error);
    } finally {
      setUpdatingColor(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gerenciar Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select onValueChange={handleStatusFilter} defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Ativos</SelectItem>
                  <SelectItem value="0">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Carregando pacientes...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Gênero</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum paciente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={getAvatarUrl(paciente.avatar)} 
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {paciente.nome?.charAt(0)?.toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleColorChange(paciente)}
                              className="p-1 h-6 w-6 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                              style={{ backgroundColor: paciente.cor || '#3B82F6' }}
                              title={`Alterar cor do paciente ${paciente.nome}`}
                            >
                              <Palette className="w-2 h-2 text-white" />
                            </Button>
                            <div>
                              <div className="font-medium">{paciente.nome}</div>
                              {paciente.profissao && (
                                <div className="text-sm text-gray-500">{paciente.profissao}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {paciente.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {paciente.email}
                            </div>
                          )}
                          {paciente.telefone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {formatPhone(paciente.telefone)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {paciente.genero || 'Não informado'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(paciente.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(paciente.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPaciente(paciente)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-medium">Ver perfil</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPaciente(paciente)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(paciente)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            {paciente.status === 1 ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePaciente(paciente.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, total)} de {total} pacientes
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={page === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      {selectedPaciente && (
        <EditPacienteModal
          paciente={selectedPaciente}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSubmit={handleEditSubmit}
          loading={loading}
        />
      )}

      {/* Modal de Cor */}
      {selectedPacienteForColor && (
        <Dialog open={colorModalOpen} onOpenChange={setColorModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Cor do Paciente</DialogTitle>
              <DialogDescription>
                Selecione uma nova cor para o paciente {selectedPacienteForColor.nome}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 py-4">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer"
              />
              <span className="text-lg font-semibold">{newColor}</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setColorModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleColorSubmit} disabled={updatingColor}>
                {updatingColor ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Palette className="mr-2 h-4 w-4" />
                )}
                {updatingColor ? 'Atualizando...' : 'Atualizar Cor'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}; 