import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Home, 
  Users, 
  Calendar, 
  Wallet, 
  FileText, 
  MessageSquare, 
  Settings, 
  Sparkles,
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface RouteData {
  path: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  accessCount: number;
  uniqueUsers: number;
  avgTimeSpent: number;
  bounceRate: number;
  category: 'core' | 'secondary' | 'admin' | 'auth';
}

interface UserRouteStats {
  userId: string;
  userName: string;
  userPlan: string;
  totalAccess: number;
  routes: {
    path: string;
    accessCount: number;
    percentage: number;
  }[];
}

const routeIcons = {
  '/dashboard': Home,
  '/pacientes': Users,
  '/agenda': Calendar,
  '/financeiro': Wallet,
  '/prontuarios': FileText,
  '/arquivos': MessageSquare,
  '/configuracoes': Settings,
  '/relatorios': Sparkles,
  '/admin': BarChart3,
  '/login': Eye,
  '/signup': MousePointer,
  '/planos': TrendingUp,
};

// Dados simulados baseados nas rotas reais do sistema
const mockRouteData: RouteData[] = [
  {
    path: '/dashboard',
    name: 'Painel',
    icon: Home,
    description: 'Visão geral do sistema',
    accessCount: 2847,
    uniqueUsers: 156,
    avgTimeSpent: 3.2,
    bounceRate: 12,
    category: 'core'
  },
  {
    path: '/pacientes',
    name: 'Pacientes',
    icon: Users,
    description: 'Gerenciar pacientes',
    accessCount: 1923,
    uniqueUsers: 142,
    avgTimeSpent: 8.5,
    bounceRate: 8,
    category: 'core'
  },
  {
    path: '/agenda',
    name: 'Agenda',
    icon: Calendar,
    description: 'Agendamentos',
    accessCount: 1654,
    uniqueUsers: 138,
    avgTimeSpent: 5.1,
    bounceRate: 15,
    category: 'core'
  },
  {
    path: '/financeiro',
    name: 'Financeiro',
    icon: Wallet,
    description: 'Controle financeiro',
    accessCount: 987,
    uniqueUsers: 89,
    avgTimeSpent: 6.8,
    bounceRate: 22,
    category: 'core'
  },
  {
    path: '/relatorios',
    name: 'Agentes IA',
    icon: Sparkles,
    description: 'Assistentes inteligentes',
    accessCount: 456,
    uniqueUsers: 34,
    avgTimeSpent: 4.2,
    bounceRate: 18,
    category: 'secondary'
  },
  {
    path: '/arquivos',
    name: 'Arquivos',
    icon: MessageSquare,
    description: 'Documentos',
    accessCount: 723,
    uniqueUsers: 67,
    avgTimeSpent: 7.3,
    bounceRate: 25,
    category: 'secondary'
  },
  {
    path: '/prontuarios',
    name: 'Prontuários',
    icon: FileText,
    description: 'Prontuários psicológicos',
    accessCount: 834,
    uniqueUsers: 78,
    avgTimeSpent: 12.4,
    bounceRate: 14,
    category: 'core'
  },
  {
    path: '/configuracoes',
    name: 'Configurações',
    icon: Settings,
    description: 'Preferências',
    accessCount: 234,
    uniqueUsers: 45,
    avgTimeSpent: 2.8,
    bounceRate: 35,
    category: 'secondary'
  },
  {
    path: '/admin',
    name: 'Admin',
    icon: BarChart3,
    description: 'Painel administrativo',
    accessCount: 89,
    uniqueUsers: 3,
    avgTimeSpent: 15.6,
    bounceRate: 5,
    category: 'admin'
  },
  {
    path: '/login',
    name: 'Login',
    icon: Eye,
    description: 'Autenticação',
    accessCount: 1234,
    uniqueUsers: 189,
    avgTimeSpent: 1.2,
    bounceRate: 8,
    category: 'auth'
  },
  {
    path: '/planos',
    name: 'Planos',
    icon: TrendingUp,
    description: 'Seleção de planos',
    accessCount: 345,
    uniqueUsers: 67,
    avgTimeSpent: 4.5,
    bounceRate: 28,
    category: 'secondary'
  }
];

const mockUserStats: UserRouteStats[] = [
  {
    userId: 'user-1',
    userName: 'Dr. João Silva',
    userPlan: 'Pro',
    totalAccess: 156,
    routes: [
      { path: '/dashboard', accessCount: 45, percentage: 28.8 },
      { path: '/pacientes', accessCount: 38, percentage: 24.4 },
      { path: '/agenda', accessCount: 32, percentage: 20.5 },
      { path: '/prontuarios', accessCount: 25, percentage: 16.0 },
      { path: '/financeiro', accessCount: 16, percentage: 10.3 }
    ]
  },
  {
    userId: 'user-2',
    userName: 'Dra. Maria Santos',
    userPlan: 'Advanced',
    totalAccess: 203,
    routes: [
      { path: '/pacientes', accessCount: 67, percentage: 33.0 },
      { path: '/dashboard', accessCount: 52, percentage: 25.6 },
      { path: '/agenda', accessCount: 41, percentage: 20.2 },
      { path: '/relatorios', accessCount: 28, percentage: 13.8 },
      { path: '/prontuarios', accessCount: 15, percentage: 7.4 }
    ]
  },
  {
    userId: 'user-3',
    userName: 'Dr. Carlos Oliveira',
    userPlan: 'Gratuito',
    totalAccess: 89,
    routes: [
      { path: '/dashboard', accessCount: 34, percentage: 38.2 },
      { path: '/pacientes', accessCount: 28, percentage: 31.5 },
      { path: '/agenda', accessCount: 18, percentage: 20.2 },
      { path: '/configuracoes', accessCount: 9, percentage: 10.1 }
    ]
  }
];

export function RouteAnalyticsMap() {
  const [selectedView, setSelectedView] = useState<'overview' | 'users'>('overview');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const { 
    routeAnalytics, 
    userRouteAnalytics, 
    loading, 
    loadRouteAnalytics, 
    loadUserRouteAnalytics 
  } = useAdmin();

  // Carregar dados quando o componente montar
  useEffect(() => {
    console.log('🔄 RouteAnalyticsMap: Carregando dados...');
    loadRouteAnalytics();
    loadUserRouteAnalytics();
  }, []); // Remover dependências para evitar loop infinito

  // Usar dados reais ou fallback para dados simulados
  const routeData = routeAnalytics?.routes || mockRouteData;
  const userStats = userRouteAnalytics?.users || mockUserStats;
  const summary = routeAnalytics?.summary;

  const totalAccess = summary?.totalAccess || routeData.reduce((sum, route) => sum + route.accessCount, 0);
  const totalUsers = summary?.activeUsers || Math.max(...routeData.map(route => route.uniqueUsers));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-500';
      case 'secondary': return 'bg-green-500';
      case 'admin': return 'bg-purple-500';
      case 'auth': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'core': return 'Core';
      case 'secondary': return 'Secundário';
      case 'admin': return 'Admin';
      case 'auth': return 'Autenticação';
      default: return 'Outros';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Pro': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      case 'Gratuito': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !routeAnalytics) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('overview')}
          >
            Visão Geral
          </Button>
          <Button
            variant={selectedView === 'users' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('users')}
          >
            Por Usuário
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadRouteAnalytics();
              loadUserRouteAnalytics();
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {summary ? (
            <>
              <span className="font-medium text-green-600">Dados Reais</span> • 
              Total: {totalAccess.toLocaleString()} acessos • {totalUsers} usuários únicos
            </>
          ) : (
            <>
              Total: {totalAccess.toLocaleString()} acessos • {totalUsers} usuários únicos
            </>
          )}
        </div>
      </div>

      {selectedView === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routeData
            .sort((a, b) => b.accessCount - a.accessCount)
            .map((route) => {
              // Mapear ícone baseado no path se não estiver definido
              const Icon = route.icon || routeIcons[route.path] || Home;
              const percentage = (route.accessCount / totalAccess) * 100;
              
              return (
                <Card key={route.path} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(route.category)}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{route.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{route.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={getCategoryColor(route.category)}>
                        {getCategoryLabel(route.category)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Acessos</span>
                        <span className="font-medium">{route.accessCount.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% do total
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>Usuários</span>
                        </div>
                        <div className="font-medium">{route.uniqueUsers}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Tempo médio</span>
                        </div>
                        <div className="font-medium">{route.avgTimeSpent}min</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa de rejeição</span>
                        <span className={route.bounceRate > 20 ? 'text-red-600' : 'text-green-600'}>
                          {route.bounceRate}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {selectedView === 'users' && (
        <div className="space-y-4">
          {userStats.map((user) => (
            <Card key={user.userId} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.userName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {user.totalAccess} acessos totais
                    </p>
                  </div>
                  <Badge className={getPlanColor(user.userPlan)}>
                    {user.userPlan}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {user.routes.map((route) => {
                    const routeInfo = routeData.find(r => r.path === route.path);
                    if (!routeInfo) return null;
                    
                    // Mapear ícone baseado no path se não estiver definido
                    const Icon = routeInfo.icon || routeIcons[routeInfo.path] || Home;
                    
                    return (
                      <div key={route.path} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className={`p-2 rounded-lg ${getCategoryColor(routeInfo.category)}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{routeInfo.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {route.accessCount} acessos
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={route.percentage} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {route.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumo estatístico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Rotas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {routeData.filter(r => r.category === 'core').length}
              </div>
              <div className="text-sm text-muted-foreground">Rotas Core</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {routeData.filter(r => r.category === 'secondary').length}
              </div>
              <div className="text-sm text-muted-foreground">Rotas Secundárias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {routeData.filter(r => r.category === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Rotas Admin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {routeData.filter(r => r.category === 'auth').length}
              </div>
              <div className="text-sm text-muted-foreground">Rotas Auth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
