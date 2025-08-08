
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState, user } = useAuth();
  const location = useLocation();

  console.log('🔧 ProtectedRoute: Estado de auth:', authState);

  // Mostrar loading enquanto inicializa
  if (authState === 'INITIALIZING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (authState === 'UNAUTHENTICATED' || authState === 'ERROR') {
    console.log('🔧 ProtectedRoute: Não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // REGRA: Se precisar de verificação, redirecionar para verificação
  if (authState === 'NEEDS_VERIFICATION') {
    console.log('🔧 ProtectedRoute: Usuário não verificado, redirecionando para verificação');
    return <Navigate to="/email-verification" state={{ email: user?.email }} replace />;
  }

  // Se autenticado e verificado, permitir acesso
  if (authState === 'AUTHENTICATED') {
    return <>{children}</>;
  }

  // Fallback - não deveria chegar aqui
  return <Navigate to="/login" replace />;
}
