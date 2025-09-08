import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { useDarkMode } from '@/components/theme/DarkModeProvider';
import { useSidebar } from '@/contexts/SidebarContext';
import { useFinancialVisibility } from '@/contexts/FinancialVisibilityContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Trash2,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  Mail,
  MessageCircle,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Header() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const { isFinancialVisible, toggleFinancialVisibility } = useFinancialVisibility();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(navigate);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = profile?.nome || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Sidebar Toggle */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </Button>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Financial Visibility Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFinancialVisibility}
            className="h-8 w-8 p-0"
            title={isFinancialVisible ? "Ocultar valores financeiros" : "Mostrar valores financeiros"}
          >
            {isFinancialVisible ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-600" />
            )}
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="h-8 w-8 p-0"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMarkAllAsRead}
                      className="text-xs h-6 px-2"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Marcar todas como lidas
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteAll}
                      className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Carregando...</span>
                </div>
              ) : notifications.length === 0 ? (
                <DropdownMenuItem disabled className="text-center py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma notificação
                  </span>
                </DropdownMenuItem>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start p-3 space-y-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {notification.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {notification.actionUrl && (
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {format(new Date(notification.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar || profile?.avatar_url} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-medium">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <span className="font-medium">{displayName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/relatorios')}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Agentes IA</span>
              </DropdownMenuItem>
              {user?.isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Administração</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const subject = 'Suporte - ProntuPsi';
                  const body = 'Olá, preciso de ajuda com o ProntuPsi.';
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Suporte (Email)</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const text = 'Olá, preciso de suporte no ProntuPsi.';
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Suporte (WhatsApp)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}