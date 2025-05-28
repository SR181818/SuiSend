import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LineChartProps {
  data: number[];
  width: number;
  height: number;
  color: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, width, height, color }) => {
  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const getY = (value: number) => {
    return height - ((value - minValue) / range) * height;
  };

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = getY(value);
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;

  // Create a path for the gradient fill
  const fillPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={fillPath} fill="url(#gradient)" />
        <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default LineChart;

export { LineChart }