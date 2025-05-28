import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { mockChartData } from '@/utils/mockData';

interface PortfolioChartProps {
  timeRange: '1d' | '1w' | '1m' | '1y';
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ timeRange }) => {
  const { theme } = useTheme();
  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth - 32; // Adjusting for padding
  const chartHeight = 180;
  
  // Get data based on timeRange
  const data = mockChartData[timeRange];
  
  if (!data || data.length === 0) {
    return <View style={{ width: chartWidth, height: chartHeight }} />;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight * 0.8;
  };

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = getY(value);
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;

  // Create a path for the gradient fill
  const fillPath = `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;

  // Determine if the trend is positive
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = isPositive ? theme.colors.success : theme.colors.error;

  return (
    <View style={[styles.container, { width: chartWidth, height: chartHeight }]}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={fillPath} fill="url(#gradient)" />
        <Path d={linePath} stroke={lineColor} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default PortfolioChart;