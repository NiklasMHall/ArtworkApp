import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface ProfileImageProps {
  uri?: string;
  size: number;
  style?: ViewStyle;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ uri, size, style }) => {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...style,
  };

  if (!uri) {
    return (
      <View style={[styles.container, containerStyle, styles.placeholder]}>
        <Ionicons name="person" size={size * 0.6} color="#666" />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size }]}
        onLoadStart={() => <ActivityIndicator />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    borderRadius: 999,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
  },
});

export default ProfileImage;