import React, { createContext, useContext, ReactNode } from 'react';

interface Theme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

const lightTheme: Theme = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
  accent: '#6366f1',
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