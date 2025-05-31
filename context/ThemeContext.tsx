
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
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    accent: string;
    accentDark: string;
    accentLight: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    backgroundDark: string;
    backgroundLight: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    gray: string;
    grayDark: string;
    white: string;
    black: string;
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
    primaryDark: '#5a67d8',
    primaryLight: '#7c3aed',
    secondary: '#764ba2',
    secondaryDark: '#6b46c1',
    secondaryLight: '#8b5cf6',
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fbbf24',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#000000',
    backgroundDark: '#0a0a0a',
    backgroundLight: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#999999',
    border: '#333333',
    gray: '#6b7280',
    grayDark: '#4b5563',
    white: '#ffffff',
    black: '#000000',
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => {
  return { theme: useContext(ThemeContext) };
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
