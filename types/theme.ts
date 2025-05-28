export interface Theme {
  colors: {
    // Primary colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    
    // Secondary colors
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    
    // Accent color
    accent: string;
    accentDark: string;
    accentLight: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    
    // Background colors
    background: string;
    backgroundDark: string;
    backgroundLight: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    
    // Other UI colors
    border: string;
    gray: string;
    grayDark: string;
    
    // Common colors
    white: string;
    black: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}