import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  backgroundColor: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  backgroundColor,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 16,
    padding: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  label: {
    color: 'white',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ActionButton;