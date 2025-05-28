import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bone as Icon } from 'lucide-react-native';
import Animated, { useAnimatedStyle, interpolateColor, withTiming } from 'react-native-reanimated';

interface TabBarIconProps {
  icon: any;
  color: string;
  size: number;
  focused?: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ icon, color, size, focused }) => {
  const IconComponent = icon;
  
  return (
    <View style={styles.container}>
      <IconComponent color={color} size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabBarIcon;