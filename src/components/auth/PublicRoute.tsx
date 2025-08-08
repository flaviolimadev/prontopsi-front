
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { authState, loading } = useAuth();
  const location = useLocation();

  console.log('🔧 PublicRoute: Estado de auth:', authState);

  // Mostrar loading enquanto inicializa
  if (authState === 'INITIALIZING' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se estiver autenticado e verificado, redirecionar para dashboard
  if (authState === 'AUTHENTICATED') {
    console.log('🔧 PublicRoute: Usuário autenticado, redirecionando para dashboard');
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Se não estiver autenticado ou precisar de verificação, mostrar o conteúdo público
  return <>{children}</>;
}
