import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface MnemonicDisplayProps {
  mnemonic: string;
}

const MnemonicDisplay: React.FC<MnemonicDisplayProps> = ({ mnemonic }) => {
  const { theme } = useTheme();
  const words = mnemonic.split(' ');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}>
      <View style={styles.wordsContainer}>
        {words.map((word, index) => (
          <View
            key={index}
            style={[
              styles.wordContainer,
              { backgroundColor: theme.colors.background + '80' }
            ]}
          >
            <Text style={[styles.wordNumber, { color: theme.colors.textSecondary }]}>
              {index + 1}
            </Text>
            <Text style={[styles.word, { color: theme.colors.text }]}>
              {word}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordContainer: {
    width: '30%',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginRight: 4,
    width: 16,
  },
  word: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});

export default MnemonicDisplay;