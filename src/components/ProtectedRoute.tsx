import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, validateSession, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Validate session when component mounts
    if (isAuthenticated) {
      validateSession();
    }
  }, [isAuthenticated, validateSession]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se autenticado mas sem permissão (perfil cliente), redireciona para manutenção
  const isRestrictedClient = user && user.perfil !== 'admin' && user.perfil !== 'analista';
  if (isRestrictedClient && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;