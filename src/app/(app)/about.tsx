import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ExternalLink, FileText, Shield } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

function LogoMark() {
  return (
    <Svg width={60} height={60} viewBox="0 0 60 60">
      <Path d="M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5 Z" fill="none" stroke="#3B82F6" strokeWidth={2.5} />
      <Circle cx={30} cy={30} r={10} fill="none" stroke="#22D3EE" strokeWidth={2} />
      <Circle cx={30} cy={30} r={4} fill="#3B82F6" />
      <Line x1={30} y1={5} x2={30} y2={20} stroke="#3B82F6" strokeWidth={2} />
      <Line x1={30} y1={40} x2={30} y2={55} stroke="#3B82F6" strokeWidth={2} />
      <Line x1={8} y1={30} x2={20} y2={30} stroke="#3B82F6" strokeWidth={2} />
      <Line x1={40} y1={30} x2={52} y2={30} stroke="#3B82F6" strokeWidth={2} />
    </Svg>
  );
}

export default function AboutScreen() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border bg-background">
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-card border border-border items-center justify-center active:opacity-70">
          <ArrowLeft size={18} color="#6B7280" />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">About PacketFlow</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View className="px-5 py-8 gap-6">
          {/* Logo */}
          <View className="items-center gap-4">
            <View className="w-24 h-24 rounded-3xl bg-card border border-border items-center justify-center">
              <LogoMark />
            </View>
            <View className="items-center gap-1">
              <Text className="text-foreground text-2xl font-bold">PacketFlow</Text>
              <Text className="text-muted-foreground text-sm">Design. Simulate. Learn.</Text>
              <View className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mt-1">
                <Text className="text-primary text-xs font-semibold">Version 1.0.0</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="bg-card border border-border rounded-2xl p-5" style={{ borderCurve: 'continuous' }}>
            <Text className="text-foreground font-semibold text-base mb-3">About</Text>
            <Text className="text-muted-foreground text-sm leading-6">
              PacketFlow is a professional network design and simulation app for mobile devices.
              Inspired by Cisco Packet Tracer, it brings powerful network topology design
              to your fingertips — perfect for students, educators, and IT professionals.
            </Text>
          </View>

          {/* Info */}
          <View className="bg-card border border-border rounded-2xl overflow-hidden" style={{ borderCurve: 'continuous' }}>
            {[
              { label: 'Version', value: '1.0.0 (Build 1)' },
              { label: 'Platform', value: 'iOS & Android' },
              { label: 'Framework', value: 'React Native + Expo' },
              { label: 'Backend', value: 'Supabase' },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <View className="flex-row items-center justify-between px-5 py-3.5">
                  <Text className="text-muted-foreground text-sm">{item.label}</Text>
                  <Text className="text-foreground text-sm font-medium">{item.value}</Text>
                </View>
                {i < arr.length - 1 && <View className="h-px bg-border mx-5" />}
              </React.Fragment>
            ))}
          </View>

          {/* Links */}
          <View className="bg-card border border-border rounded-2xl overflow-hidden" style={{ borderCurve: 'continuous' }}>
            {[
              { icon: <FileText size={16} color="#3B82F6" />, label: 'Terms of Service' },
              { icon: <Shield size={16} color="#22C55E" />, label: 'Privacy Policy' },
              { icon: <ExternalLink size={16} color="#8B5CF6" />, label: 'Open Source Licenses' },
            ].map((item, i, arr) => (
              <React.Fragment key={item.label}>
                <Pressable onPress={() => {}} className="flex-row items-center gap-3 px-5 py-4 active:opacity-70">
                  <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">{item.icon}</View>
                  <Text className="text-foreground text-sm flex-1">{item.label}</Text>
                  <ExternalLink size={14} color="#6B7280" />
                </Pressable>
                {i < arr.length - 1 && <View className="h-px bg-border mx-5" />}
              </React.Fragment>
            ))}
          </View>

          <Text className="text-muted-foreground text-xs text-center">
            © 2026 PacketFlow. All rights reserved.
          </Text>
          <View className="h-6" />
        </View>
      </ScrollView>
    </View>
  );
}
