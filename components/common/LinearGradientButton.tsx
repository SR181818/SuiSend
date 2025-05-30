import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LinearGradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export default function LinearGradientButton({
  title,
  onPress,
  colors = ['#6366f1', '#8b5cf6'],
  icon,
  disabled = false,
  loading = false,
  style,
}: LinearGradientButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#9ca3af', '#6b7280'] : colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={styles.title}>{title}</Text>
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});