import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, Usuario, LoginCredentials, RegisterData } from '@/services/authService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: Usuario | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Validate session with server
          const isValid = await authService.validateSession();
          if (isValid) {
            setUser(currentUser);
          } else {
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.senha
          });
          if (signInError) {
            console.log({ level: 'error', action: 'supabase_auth_signin_error', error: signInError.message });
          }
          if (signInError) {
            const { error: signUpError } = await supabase.auth.signUp({
              email: credentials.email,
              password: credentials.senha
            });
            if (signUpError) {
              console.log({ level: 'error', action: 'supabase_auth_signup_error', error: signUpError.message });
            }
            if (!signUpError) {
              await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.senha
              });
            }
          }
          const { data: sessionData } = await supabase.auth.getSession();
          console.log({ level: 'info', action: 'supabase_auth_session_after_login', session: Boolean(sessionData.session) });
        } catch {}
        setUser(response.data);
        toast.success(`Bem-vindo, ${response.data.nome}!`);
        return true;
      } else {
        toast.error(response.error || 'Erro ao fazer login');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro interno do servidor');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      if (response.success && response.data) {
        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.senha
          });
          if (signUpError) {
            console.log({ level: 'error', action: 'supabase_auth_signup_error', error: signUpError.message });
          }
          if (signUpError) {
            await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.senha
            });
          }
          const { data: sessionData } = await supabase.auth.getSession();
          console.log({ level: 'info', action: 'supabase_auth_session_after_register', session: Boolean(sessionData.session) });
        } catch {}
        setUser(response.data);
        toast.success(`Conta criada com sucesso! Bem-vindo, ${response.data.nome}!`);
        return true;
      } else {
        toast.error(response.error || 'Erro ao criar conta');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erro interno do servidor');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logout realizado com sucesso');
  };

  const validateSession = async (): Promise<boolean> => {
    try {
      const isValid = await authService.validateSession();
      if (!isValid) {
        setUser(null);
      }
      return isValid;
    } catch (error) {
      console.error('Error validating session:', error);
      setUser(null);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: user !== null,
    validateSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};