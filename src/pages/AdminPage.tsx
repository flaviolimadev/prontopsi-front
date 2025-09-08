import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  UserPlus,
  Activity,
  Database,
  Server,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  UserMinus,
  Eye,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import { UserDetails } from '@/services/admin.service';
import { RouteAnalyticsMap } from '@/components/admin/RouteAnalyticsMap';
import { UserSummaryStats } from '@/components/admin/UserSummaryStats';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    stats,
    users,
    systemHealth,
    logs,
    routeAnalytics,
    userRouteAnalytics,
    userDetailedStats,
    loading,
    error,
    loadStats,
    loadUsers,
    loadUserDetails,
    loadSystemHealth,
    loadSystemLogs,
    loadRouteAnalytics,
    loadUserRouteAnalytics,
    loadUserDetailedStats,
    toggleUserStatus,
    toggleAdminStatus,
    deleteUser,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [adminFilter, setAdminFilter] = useState<boolean | undefined>();
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('🔧 AdminPage: useEffect executado', { user, isAdmin: user?.isAdmin });
    if (user?.isAdmin) {
      console.log('🔧 AdminPage: Carregando dados iniciais...');
      loadStats();
      loadUsers();
      loadSystemHealth();
      loadSystemLogs();
      loadUserDetailedStats();
      // Remover carregamento duplicado - RouteAnalyticsMap carrega seus próprios dados
    }
  }, [user?.isAdmin]);

  // Carregar usuários com filtros
  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers(1, 10, searchTerm, statusFilter, adminFilter);
  };

  // Carregar próxima página
  const handleNextPage = () => {
    if (users && currentPage < users.pagination.totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadUsers(nextPage, 10, searchTerm, statusFilter, adminFilter);
    }
  };

  // Carregar página anterior
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      loadUsers(prevPage, 10, searchTerm, statusFilter, adminFilter);
    }
  };

  // Alternar status do usuário
  const handleToggleUserStatus = async (userId: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const success = await toggleUserStatus(userId, newStatus);
    if (success) {
      loadUsers(currentPage, 10, searchTerm, statusFilter, adminFilter);
    }
  };

  // Alternar status de admin
  const handleToggleAdminStatus = async (userId: string, currentIsAdmin: boolean) => {
    const success = await toggleAdminStatus(userId, !currentIsAdmin);
    if (success) {
      loadUsers(currentPage, 10, searchTerm, statusFilter, adminFilter);
    }
  };

  // Deletar usuário
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      const success = await deleteUser(userId);
      if (success) {
        loadUsers(currentPage, 10, searchTerm, statusFilter, adminFilter);
      }
    }
  };

  // Abrir modal de detalhes do usuário
  const handleViewUserDetails = async (userId: string) => {
    try {
      const userDetails = await loadUserDetails(userId);
      if (userDetails) {
        setSelectedUser(userDetails);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do usuário:', error);
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Painel de Administração
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie usuários, monitore o sistema e configure aplicações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadStats();
              loadUsers();
              loadSystemHealth();
              // RouteAnalyticsMap tem seu próprio botão de atualizar
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Administrador
          </Badge>
        </div>
      </div>

      {/* Estatísticas Principais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.users.newToday} novos hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.active.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.users.active / stats.users.total) * 100)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sessions.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.sessions.newToday} novas hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center gap-2 ${getHealthColor(systemHealth?.status || 'unknown')}`}>
                {getHealthIcon(systemHealth?.status || 'unknown')}
                {systemHealth?.status === 'healthy' ? 'Saudável' : 'Atenção'}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {systemHealth?.uptime || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abas de Funcionalidades */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Resumo de Estatísticas de Usuários */}
          <UserSummaryStats />
          
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter === undefined ? '' : statusFilter.toString()}
                    onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Todos os status</option>
                    <option value="1">Ativos</option>
                    <option value="0">Inativos</option>
                  </select>
                  <select
                    value={adminFilter === undefined ? '' : adminFilter.toString()}
                    onChange={(e) => setAdminFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Todos os usuários</option>
                    <option value="true">Apenas admins</option>
                    <option value="false">Apenas usuários</option>
                  </select>
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>

              {/* Lista de usuários */}
              {console.log('🔧 AdminPage: Renderizando lista de usuários', { users, loading, error })}
              {users && (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {users.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.fullName}
                              </p>
                              {user.isAdmin && (
                                <Badge variant="outline" className="text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                              {user.planoId && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                              {user.contato && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {user.contato}
                                </span>
                              )}
                              {user.clinicName && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {user.clinicName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.status === 1 ? 'default' : 'secondary'}>
                                {user.status === 1 ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <Badge variant={user.emailVerified ? 'default' : 'outline'}>
                                {user.emailVerified ? 'Verificado' : 'Não verificado'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDetails(user.id)}
                            disabled={loading}
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                            disabled={loading}
                            title={user.status === 1 ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            {user.status === 1 ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAdminStatus(user.id, user.isAdmin)}
                            disabled={loading}
                            title={user.isAdmin ? 'Remover privilégios de admin' : 'Tornar admin'}
                          >
                            {user.isAdmin ? (
                              <UserMinus className="w-4 h-4" />
                            ) : (
                              <Crown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700"
                            title="Deletar usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginação */}
                  {users.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando {((users.pagination.page - 1) * users.pagination.limit) + 1} a{' '}
                        {Math.min(users.pagination.page * users.pagination.limit, users.pagination.total)} de{' '}
                        {users.pagination.total} usuários
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1 || loading}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage >= users.pagination.totalPages || loading}
                        >
                          Próximo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Carregando usuários...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento do Sistema</CardTitle>
              <CardDescription>
                Acompanhe a saúde e performance do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemHealth && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-500" />
                      <span>Banco de Dados</span>
                    </div>
                    <Badge variant="outline" className={systemHealth.database === 'online' ? 'text-green-600' : 'text-red-600'}>
                      {systemHealth.database === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-green-500" />
                      <span>Servidor API</span>
                    </div>
                    <Badge variant="outline" className={systemHealth.api === 'online' ? 'text-green-600' : 'text-red-600'}>
                      {systemHealth.api === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      <span>Uptime</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {systemHealth.uptime}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>Última verificação</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(systemHealth.lastCheck).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics e Relatórios</CardTitle>
              <CardDescription>
                Visualize métricas e gere relatórios do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RouteAnalyticsMap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configure parâmetros globais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Configurações em Desenvolvimento</h3>
                <p className="text-sm text-muted-foreground">
                  Em breve você poderá configurar parâmetros do sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Usuário */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onToggleStatus={handleToggleUserStatus}
        onToggleAdmin={handleToggleAdminStatus}
        loading={loading}
      />
    </div>
  );
};

export default AdminPage;