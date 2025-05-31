
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BackupWallet() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup Your Wallet</Text>
      <Text style={styles.description}>
        This screen was causing errors and has been temporarily disabled.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
  },
});
