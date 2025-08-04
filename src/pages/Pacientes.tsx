import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Users,
  UserCheck,
  UserX,
  Plus,
  Loader2
} from 'lucide-react';
import { usePacientes } from '@/hooks/usePacientes';
import { PacientesTable } from '@/components/pacientes/PacientesTable';
import { PacienteForm } from '@/components/pacientes/PacienteForm';

export default function Pacientes() {
  const {
    pacientes,
    loading,
    error,
    total,
    page,
    totalPages,
    createPaciente,
    updatePaciente,
    deletePaciente,
    deactivatePaciente,
    reactivatePaciente,
    applyFilters,
    changePage,
  } = usePacientes();

  const handleCreatePaciente = async (data: any) => {
    await createPaciente(data);
  };

  const handleUpdatePaciente = async (paciente: any) => {
    console.log('Dados recebidos para atualização:', paciente);
    const { id, ...pacienteData } = paciente;
    await updatePaciente(id, pacienteData);
  };

  const handleDeletePaciente = async (id: string) => {
    await deletePaciente(id);
  };

  const handleDeactivatePaciente = async (id: string) => {
    await deactivatePaciente(id);
  };

  const handleReactivatePaciente = async (id: string) => {
    await reactivatePaciente(id);
  };

  const handleSearch = (search: string) => {
    applyFilters({ search });
  };

  const handleStatusFilter = (status: number | undefined) => {
    applyFilters({ status });
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
  };

  // Calcular estatísticas
  const activePacientes = pacientes.filter(p => p.status === 1).length;
  const inactivePacientes = pacientes.filter(p => p.status === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e suas informações
          </p>
        </div>
        <PacienteForm
          onSubmit={handleCreatePaciente}
          loading={loading}
          mode="create"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Todos os pacientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePacientes}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes em tratamento ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Inativos</CardTitle>
            <UserX className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{inactivePacientes}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {total > 0 ? Math.round((activePacientes / total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Percentual de pacientes ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pacientes */}
      <PacientesTable
        pacientes={pacientes}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onPageChange={handlePageChange}
        onEdit={handleUpdatePaciente}
        onDelete={handleDeletePaciente}
        onDeactivate={handleDeactivatePaciente}
        onReactivate={handleReactivatePaciente}
      />

      {/* Mensagem de erro */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}