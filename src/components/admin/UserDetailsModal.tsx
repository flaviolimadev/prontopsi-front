import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText, 
  Calendar, 
  DollarSign,
  Users,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Crown,
  Star,
  MessageCircle,
  Settings
} from 'lucide-react';
import { UserDetails } from '@/services/admin.service';

interface UserDetailsModalProps {
  user: UserDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus?: (userId: string, currentStatus: number) => void;
  onToggleAdmin?: (userId: string, currentIsAdmin: boolean) => void;
  loading?: boolean;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onToggleStatus,
  onToggleAdmin,
  loading = false
}) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[85vh] pr-2">
          <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.status === 1 ? 'default' : 'secondary'}>
              {user.status === 1 ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge variant={user.emailVerified ? 'default' : 'outline'}>
              {user.emailVerified ? 'Email Verificado' : 'Email Não Verificado'}
            </Badge>
            {user.isAdmin && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                <Crown className="w-3 h-3 mr-1" />
                Administrador
              </Badge>
            )}
            {user.planoId && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                <p className="text-sm">{user.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Código</label>
                <p className="text-sm font-mono">{user.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CRP</label>
                <p className="text-sm">{user.crp || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contato</label>
                <p className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.contato || 'Não informado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-sm">{user.phone || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome da Clínica</label>
                <p className="text-sm">{user.clinicName || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Endereço</label>
                <p className="text-sm flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  {user.address || 'Não informado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Biografia</label>
                <p className="text-sm">{user.bio || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Configurações WhatsApp */}
          {user.whatsappNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Configurações WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Número WhatsApp</label>
                  <p className="text-sm">{user.whatsappNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relatórios Habilitados</label>
                  <p className="text-sm flex items-center gap-2">
                    {user.whatsappReportsEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {user.whatsappReportsEnabled ? 'Sim' : 'Não'}
                  </p>
                </div>
                {user.whatsappReportTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Horário dos Relatórios</label>
                    <p className="text-sm">{user.whatsappReportTime}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.stats.totalPatients}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    Pacientes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.stats.totalSessions}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Sessões
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.stats.totalPagamentos || 0}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Pagamentos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(user.stats.pontosEmReais || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Pontos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Última Atualização</label>
                <p className="text-sm">{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nível</label>
                <p className="text-sm">{user.nivelId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID do Plano</label>
                <p className="text-sm font-mono">{user.planoId || 'Nenhum'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onToggleStatus?.(user.id, user.status)}
              disabled={loading}
            >
              {user.status === 1 ? 'Desativar' : 'Ativar'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onToggleAdmin?.(user.id, user.isAdmin)}
              disabled={loading}
            >
              {user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
            </Button>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
