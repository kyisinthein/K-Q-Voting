import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StatusBar, Text, ViewStyle } from 'react-native';

type Props = {
  color?: string;
  style?: ViewStyle;
};

export default function BackButton({ color = '#1e90ff', style }: Props) {
  // Safe top offset: iOS ≈ 48px, Android uses StatusBar height
  const topInset = Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight ?? 16);

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      style={[
        {
          position: 'absolute',
          top: topInset,
          left: 12,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 18,
          backgroundColor: 'transparent',
          zIndex: 10, // ensure it sits above other content
          // Cross-platform shadow without background
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        style,
      ]}
    >
      <Text style={{ color, fontSize: 28, fontWeight: '800', lineHeight: 28 }}>‹‹</Text>
    </Pressable>
  );
}