import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  TrendingUp,
  UserCheck,
  UserX,
  Crown,
  Zap,
  Shield
} from 'lucide-react';

export function UserSummaryStats() {
  const { userDetailedStats, loading, loadUserDetailedStats } = useAdmin();

  useEffect(() => {
    console.log('🔍 UserSummaryStats: useEffect executado');
    console.log('🔍 UserSummaryStats: userDetailedStats atual:', userDetailedStats);
    console.log('🔍 UserSummaryStats: loading atual:', loading);
    loadUserDetailedStats();
  }, [loadUserDetailedStats]);

  // Log adicional para debug
  console.log('🔍 UserSummaryStats: Render - userDetailedStats:', userDetailedStats);
  console.log('🔍 UserSummaryStats: Render - loading:', loading);

  // Dados simulados para quando o backend não estiver disponível
  const mockStats = {
    totalUsers: 156,
    usersToday: 3,
    usersThisWeek: 12,
    peakHour: '14:00',
    activeUsers: 142,
    inactiveUsers: 14,
    planDistribution: {
      free: 109,
      pro: 39,
      advanced: 8
    }
  };

  if (loading && !userDetailedStats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const stats = userDetailedStats || mockStats;

  return (
    <div className="space-y-6">
      {/* Indicador de dados */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resumo de Usuários</h2>
        <div className="text-sm text-muted-foreground">
          {userDetailedStats ? (
            <span className="font-medium text-green-600">Dados Reais</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium text-orange-600">Dados Simulados</span>
              {loading && <span className="text-blue-600">(Tentando carregar dados reais...)</span>}
            </div>
          )}
        </div>
      </div>
      
      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} ativos • {stats.inactiveUsers} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastros Hoje</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.usersToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usersToday > 0 ? '+' : ''}{stats.usersToday} novos usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.usersThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário de Pico</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.peakHour}</div>
            <p className="text-xs text-muted-foreground">
              Mais cadastros neste horário
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição por Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Gratuito</p>
                  <p className="text-sm text-muted-foreground">Até 5 pacientes</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                {stats.planDistribution.free}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Pro</p>
                  <p className="text-sm text-muted-foreground">Pacientes ilimitados</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.planDistribution.pro}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Advanced</p>
                  <p className="text-sm text-muted-foreground">Recursos premium</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {stats.planDistribution.advanced}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Usuários */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-sm text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              Usuários Inativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.inactiveUsers}</div>
            <p className="text-sm text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
