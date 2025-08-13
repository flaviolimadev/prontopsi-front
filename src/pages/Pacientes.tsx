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
import { RegistroRapidoForm } from '@/components/pacientes/RegistroRapidoForm';
import { SimpleUpgradePrompt } from '@/components/subscription/SimpleUpgradePrompt';
import CadastroLinksManager from '@/components/cadastro-links/CadastroLinksManager';
import { SubmissionsManager } from '@/components/cadastro-links/SubmissionsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCadastroLinks } from '@/hooks/useCadastroLinks';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';

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
    updatePacienteColor,
    deletePaciente,
    deactivatePaciente,
    reactivatePaciente,
    applyFilters,
    changePage,
  } = usePacientes();
  const { subscription, canAddPatient } = useSubscription();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const { submissions, fetchSubmissions } = useCadastroLinks();
  React.useEffect(() => { 
    fetchSubmissions(); 
    const handler = () => fetchSubmissions();
    if (typeof window !== 'undefined') {
      window.addEventListener('cadastroSubmissionsUpdated', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cadastroSubmissionsUpdated', handler);
      }
    };
  }, [fetchSubmissions]);
  const pendingCount = (submissions || []).filter(s => s.status === 'pending').length;

  // Selecionar aba via hash (suporta #solicitacoes e #submissions)
  const [activeTab, setActiveTab] = React.useState<string>('pacientes');
  React.useEffect(() => {
    const resolveTabFromHash = (hash: string | undefined | null) => {
      const raw = (hash || '').toLowerCase();
      // Extrair o trecho após o último '#', se houver dois hashes (ex.: '#/pacientes#solicitacoes')
      const clean = raw.startsWith('#') ? raw.slice(1) : raw;
      const lastHashIndex = clean.lastIndexOf('#');
      const anchor = lastHashIndex >= 0 ? clean.slice(lastHashIndex + 1) : clean;

      if (anchor === 'solicitacoes' || anchor === 'submissions' || raw.includes('solicitacoes') || raw.includes('submissions')) {
        return 'submissions';
      }
      if (anchor === 'links' || raw.includes('links')) {
        return 'links';
      }
      if (anchor === 'pacientes' || clean === '/pacientes' || raw.includes('/pacientes')) {
        return 'pacientes';
      }
      return 'pacientes';
    };

    const syncFromHash = () => {
      if (typeof window !== 'undefined') {
        setActiveTab(resolveTabFromHash(window.location.hash));
      }
    };

    syncFromHash();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', syncFromHash);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', syncFromHash);
      }
    };
  }, []);

  const handleCreatePaciente = async (data: any) => {
    const limit = subscription?.patient_limit ?? null;
    const isFree = subscription?.plan_type === 'gratuito';
    // Bloquear inclusão acima do limite no plano gratuito
    if (isFree && limit !== null && total >= limit) {
      toast({
        title: 'Limite atingido',
        description: 'No plano Gratuito é possível cadastrar até 5 pacientes. Faça upgrade para adicionar mais.',
        variant: 'destructive',
      });
      return;
    }
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

  // Restringir acesso aos primeiros 5 no plano gratuito
  const limit = subscription?.patient_limit ?? null;
  const isFree = subscription?.plan_type === 'gratuito';
  const displayedPacientes = isFree && limit !== null ? pacientes.slice(0, limit) : pacientes;

  // Calcular estatísticas com base no que o usuário pode acessar
  const activePacientes = displayedPacientes.filter(p => p.status === 1).length;
  const inactivePacientes = displayedPacientes.filter(p => p.status === 0).length;

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="links">Links de Cadastro</TabsTrigger>
          <TabsTrigger value="submissions" className="relative">
            Solicitações
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes" className="space-y-6">
          {/* Header dos Pacientes */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Lista de Pacientes</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie todos os seus pacientes
              </p>
            </div>
            {!(isFree && limit !== null && total >= limit) ? (
              <div className="flex items-center space-x-2">
                <PacienteForm
                  onSubmit={handleCreatePaciente}
                  loading={loading}
                  mode="create"
                />
                <RegistroRapidoForm
                  onSubmit={handleCreatePaciente}
                  loading={loading}
                />
              </div>
            ) : (
              <Button variant="default" onClick={() => setShowUpgradeModal(true)}>
                Fazer upgrade para adicionar mais pacientes
              </Button>
            )}
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
        pacientes={displayedPacientes}
        loading={loading}
        total={displayedPacientes.length}
        page={page}
        totalPages={1}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onPageChange={handlePageChange}
        onEdit={handleUpdatePaciente}
        onUpdateColor={updatePacienteColor}
        onDelete={handleDeletePaciente}
        onDeactivate={handleDeactivatePaciente}
        onReactivate={handleReactivatePaciente}
      />

      {/* CTA para upgrade quando no limite */}
      {isFree && limit !== null && total >= limit && (
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm">
              Você atingiu o limite de {limit} pacientes do plano Gratuito. Faça upgrade para cadastrar ilimitado.
            </div>
            <Button variant="default" onClick={() => setShowUpgradeModal(true)}>Fazer upgrade</Button>
          </CardContent>
        </Card>
      )}

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
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <CadastroLinksManager />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <SubmissionsManager />
        </TabsContent>
      </Tabs>
      <SimpleUpgradePrompt
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Limite atingido"
        message={`Você atingiu o limite de ${limit ?? 5} pacientes do plano Gratuito. Faça upgrade para cadastrar mais.`}
      />
    </div>
  );
}