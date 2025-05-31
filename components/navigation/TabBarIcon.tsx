
import React from 'react';
import { LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  icon: LucideIcon;
  color: string;
  size?: number;
  focused?: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ icon: IconComponent, color, size = 24, focused }) => {
  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      color={color}
      size={size}
      strokeWidth={focused ? 2.5 : 2}
    />
  );
};

export default TabBarIcon;
