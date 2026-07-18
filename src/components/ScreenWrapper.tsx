import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  fadeIn?: boolean;
}

export function ScreenWrapper({ children, loading, fadeIn = true }: Props) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (fadeIn) {
    return (
      <Animated.View entering={FadeIn.duration(300)} className="flex-1 bg-background">
        {children}
      </Animated.View>
    );
  }

  return <View className="flex-1 bg-background">{children}</View>;
}
