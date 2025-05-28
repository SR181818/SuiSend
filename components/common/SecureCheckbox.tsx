import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Theme } from '@/types/theme';

interface SecureCheckboxProps {
  isChecked: boolean;
  onToggle: () => void;
  label: string;
  theme: Theme;
}

const SecureCheckbox: React.FC<SecureCheckboxProps> = ({
  isChecked,
  onToggle,
  label,
  theme,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: isChecked ? theme.colors.primary : theme.colors.border,
            backgroundColor: isChecked ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {isChecked && <Check color="white\" size={14} />}
      </View>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  label: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SecureCheckbox;