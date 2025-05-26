import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWallet } from '../contexts/WalletContext';
import HomeScreen from '../screens/HomeScreen';
import CardsScreen from '../screens/CardsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanScreen from '../screens/ScanScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateWalletScreen from '../screens/CreateWalletScreen';
import ImportWalletScreen from '../screens/ImportWalletScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom button for the NFC scanning tab
const ScanButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={styles.scanButton}
    onPress={onPress}
  >
    <View style={styles.scanButtonInner}>
      <Text style={styles.scanButtonIcon}>📶</Text>
    </View>
  </TouchableOpacity>
);

// Main tabs for the authenticated flow
const MainTabs = () => {
  const { scanNfcCard } = useWallet();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Cards" 
        component={CardsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💳</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📶</Text>
          ),
          tabBarButton: (props) => (
            <ScanButton onPress={() => scanNfcCard()} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth flow for onboarding, wallet creation, and import
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
    <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
  </Stack.Navigator>
);

// Root navigation - decides between auth flow and main flow based on wallet existence
const Navigation = () => {
  const { profile } = useWallet();
  
  // Check if the user has a wallet profile
  const isAuthenticated = !!profile;
  
  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

const styles = StyleSheet.create({
  scanButton: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  scanButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    transform: [{ rotate: '90deg' }],
  },
});

export default Navigation;