
import React, { createContext, useContext, ReactNode } from 'react';

interface Theme {
  primary: string;
  background: string;
  text: string;
  secondary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  card: string;
  success: string;
  warning: string;
  error: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    card: string;
    success: string;
    warning: string;
    error: string;
  };
}

const defaultTheme: Theme = {
  primary: '#667eea',
  background: '#000000',
  text: '#ffffff',
  secondary: '#764ba2',
  textSecondary: '#cccccc',
  textTertiary: '#999999',
  border: '#333333',
  card: '#1a1a1a',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  colors: {
    primary: '#667eea',
    background: '#000000',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#999999',
    border: '#333333',
    card: '#1a1a1a',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => {
  return useContext(ThemeContext);
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};
