import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      router.replace('/(auth)/onboarding');
    });
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="flex-1 items-center justify-center bg-[#0B1220]">
      <StatusBar style="light" />
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }} className="items-center gap-6">
        <View className="w-24 h-24 rounded-2xl bg-[#1E293B] items-center justify-center"
          style={{ shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 4 } }}>
          <Svg width={60} height={60} viewBox="0 0 60 60">
            <Path d="M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z" fill="none" stroke="#3B82F6" strokeWidth={2.5} />
            <Circle cx={30} cy={30} r={10} fill="none" stroke="#22D3EE" strokeWidth={2} />
            <Circle cx={30} cy={30} r={4} fill="#3B82F6" />
            <Line x1={30} y1={5} x2={30} y2={20} stroke="#3B82F6" strokeWidth={2} />
            <Line x1={30} y1={40} x2={30} y2={55} stroke="#3B82F6" strokeWidth={2} />
            <Line x1={8} y1={30} x2={20} y2={30} stroke="#3B82F6" strokeWidth={2} />
            <Line x1={40} y1={30} x2={52} y2={30} stroke="#3B82F6" strokeWidth={2} />
          </Svg>
        </View>
        <View className="items-center gap-1">
          <Text className="text-[#F8FAFC] text-4xl font-bold tracking-wide">PacketFlow</Text>
          <Text className="text-[#CBD5E1] text-base tracking-widest uppercase">Design. Simulate. Learn.</Text>
        </View>
      </Animated.View>
      <View className="absolute bottom-20 w-48">
        <View className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
          <Animated.View style={{ width: barWidth, height: '100%' }} className="bg-[#3B82F6] rounded-full" />
        </View>
        <Text className="text-[#64748B] text-xs text-center mt-3">Loading your network...</Text>
      </View>
    </View>
  );
}
