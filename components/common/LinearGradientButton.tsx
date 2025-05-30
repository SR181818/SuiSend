import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LinearGradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function LinearGradientButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  isLoading = false,
  icon,
}: LinearGradientButtonProps) {
  const getButtonColors = () => {
    if (disabled) return ['#9CA3AF', '#6B7280'];

    switch (variant) {
      case 'primary':
        return ['#3B82F6', '#1D4ED8'];
      case 'secondary':
        return ['#6B7280', '#374151'];
      case 'danger':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#3B82F6', '#1D4ED8'];
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 16 };
      case 'medium':
        return { height: 44, paddingHorizontal: 20 };
      case 'large':
        return { height: 52, paddingHorizontal: 24 };
      default:
        return { height: 44, paddingHorizontal: 20 };
    }
  };

  return (
    <TouchableOpacity
      onPress={disabled || isLoading ? undefined : onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getButtonColors()}
        style={[styles.gradient, getButtonSize()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, size === 'small' && styles.smallText]}>
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
});