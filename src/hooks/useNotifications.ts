import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api.service';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  status: 'unread' | 'read';
  metadata?: any;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCount {
  count: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get('/notifications');
      setNotifications((response as any).data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Backend não está rodando ou usuário não autenticado
        setNotifications([]);
        setError(null); // Não mostrar erro para o usuário
      } else {
        setError('Erro ao carregar notificações');
        console.error('Erro ao carregar notificações:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.get('/notifications/unread');
      setUnreadNotifications((response as any).data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Backend não está rodando ou usuário não autenticado
        setUnreadNotifications([]);
        setError(null); // Não mostrar erro para o usuário
      } else {
        setError('Erro ao carregar notificações não lidas');
        console.error('Erro ao carregar notificações não lidas:', err);
      }
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.get('/notifications/unread-count');
      setUnreadCount((response as any).data?.count || 0);
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Backend não está rodando ou usuário não autenticado
        setUnreadCount(0);
        setError(null); // Não mostrar erro para o usuário
      } else {
        setError('Erro ao carregar contador de notificações');
        console.error('Erro ao carregar contador de notificações:', err);
      }
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await apiService.put(`/notifications/${notificationId}/read`);
      
      // Atualizar o estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read' as const }
            : notification
        )
      );
      
      setUnreadNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError('Erro ao marcar notificação como lida');
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await apiService.put('/notifications/mark-all-read');
      
      // Atualizar o estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' as const }))
      );
      
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError('Erro ao marcar todas as notificações como lidas');
      console.error('Erro ao marcar todas as notificações como lidas:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await apiService.delete(`/notifications/${notificationId}`);
      
      // Atualizar o estado local
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      setUnreadNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Recalcular contador
      await fetchUnreadCount();
    } catch (err) {
      setError('Erro ao deletar notificação');
      console.error('Erro ao deletar notificação:', err);
    }
  }, [fetchUnreadCount]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      setError(null);
      await apiService.delete('/notifications');
      
      // Limpar estado local
      setNotifications([]);
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError('Erro ao deletar todas as notificações');
      console.error('Erro ao deletar todas as notificações:', err);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchNotifications();
    fetchUnreadNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadNotifications, fetchUnreadCount]);

  // Atualizar contador quando notificações não lidas mudarem
  useEffect(() => {
    setUnreadCount(unreadNotifications.length);
  }, [unreadNotifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};
