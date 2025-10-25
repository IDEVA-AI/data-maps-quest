import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  tokens: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateTokens: (newTokenCount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock authentication check
    const mockUser = {
      id: "1",
      email: "user@example.com",
      name: "Usuário Teste",
      tokens: 150
    };
    
    // Simulate loading time
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Mock login - simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser = {
            id: "1",
            email,
            name: "Usuário Teste",
            tokens: 150
          };
          setUser(mockUser);
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error("Credenciais inválidas"));
        }
      }, 1500);
    });
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    
    // Mock registration - simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password && name) {
          const mockUser = {
            id: "1",
            email,
            name,
            tokens: 15 // Free tokens on registration
          };
          setUser(mockUser);
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error("Dados inválidos"));
        }
      }, 1500);
    });
  };

  const logout = (): void => {
    setUser(null);
  };

  const updateTokens = (newTokenCount: number): void => {
    if (user) {
      setUser({ ...user, tokens: newTokenCount });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};