
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  border: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    backgroundLight: string;
    backgroundDark: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    white: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const lightTheme: Theme = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  accent: '#6366f1',
  border: '#e5e7eb',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    backgroundLight: '#f8fafc',
    backgroundDark: '#f1f5f9',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    border: '#e5e7eb',
    accent: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    white: '#ffffff',
  },
};

const darkTheme: Theme = {
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  accent: '#8b5cf6',
  border: '#374151',
  colors: {
    primary: '#8b5cf6',
    secondary: '#6366f1',
    background: '#111827',
    backgroundLight: '#1f2937',
    backgroundDark: '#0f172a',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    border: '#374151',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    white: '#ffffff',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
