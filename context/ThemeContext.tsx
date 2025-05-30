import React, { createContext, useContext, ReactNode } from 'react';

interface Theme {
  primary: string;
  background: string;
  text: string;
  secondary: string;
  accent: string;
  colors: {
    primary: string;
    background: string;
    backgroundLight: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    border: string;
    surface: string;
  };
}

const lightTheme: Theme = {
  primary: '#007AFF',
  background: '#FFFFFF',
  text: '#000000',
  secondary: '#6b7280',
  accent: '#6366f1',
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    backgroundLight: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6b7280',
    success: '#28a745',
    error: '#dc3545',
    border: '#E5E5E5',
    surface: '#F8F9FA',
  },
};

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value: ThemeContextType = {
    theme: lightTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};