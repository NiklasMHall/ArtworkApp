// src/components/LoadingSpinner.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color = '#6200ee',
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default LoadingSpinner;