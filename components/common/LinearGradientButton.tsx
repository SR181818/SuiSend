
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LinearGradientButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  colors?: string[];
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const LinearGradientButton: React.FC<LinearGradientButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  icon,
  colors = ['#6366f1', '#8b5cf6'],
  variant = 'primary',
  size = 'medium',
}) => {
  const getButtonColors = () => {
    if (disabled) return ['#9ca3af', '#6b7280'];
    if (variant === 'secondary') return ['#374151', '#4b5563'];
    return colors;
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[styles.container, getButtonSize()]}
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
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
});

export default LinearGradientButton;
