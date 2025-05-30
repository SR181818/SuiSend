import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  hasWallet: boolean;
  setAuthenticated: (value: boolean) => void;
  setHasWallet: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
  };

  const setHasWallet = (value: boolean) => {
    setHasWallet(value);
  };

  const value: AuthContextType = {
    isAuthenticated,
    hasWallet,
    setAuthenticated,
    setHasWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};