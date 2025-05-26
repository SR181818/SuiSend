import './src/utils/textEncoderPolyfill';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { WalletProvider } from './src/contexts/WalletContext';
import AppNavigator from './src/navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/services/queryClient';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';

// Ignore specific warnings that might appear due to third-party libraries
LogBox.ignoreLogs([
  'Require cycle:', // Ignore require cycle warnings
  'ViewPropTypes will be removed from React Native', // Common warning from outdated dependencies
  'expo-permissions is now deprecated' // Ignore expo-permissions deprecation
]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NetworkProvider>
              <WalletProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </WalletProvider>
            </NetworkProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}