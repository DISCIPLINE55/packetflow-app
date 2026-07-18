import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut as fbSignOut } from 'firebase/auth';
import { ArrowLeft, ChevronRight, LogOut } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { firebaseAuth } from '@/client/firebase';
import { supabase } from '@/client/supabase';
import { useSettingsStore } from '@/store/useSettingsStore';

function SunIcon({ active }: { active: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="5" stroke={active ? 'white' : '#374151'} strokeWidth="2" />
      <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={active ? 'white' : '#374151'} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={active ? 'white' : '#374151'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text className="text-primary text-xs font-semibold uppercase tracking-wider px-5 pb-2 pt-5">{title}</Text>;
}

function SettingRow({
  label,
  subtitle,
  right,
  onPress,
}: {
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between px-5 py-4 bg-card active:opacity-80"
    >
      <View className="flex-1 mr-3">
        <Text className="text-foreground text-base">{label}</Text>
        {subtitle && <Text className="text-muted-foreground text-xs mt-0.5">{subtitle}</Text>}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color="#6B7280" /> : null)}
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-border mx-5" />;
}

export default function SettingsScreen() {
  const {
    themeMode, setThemeMode,
    autoSave, setAutoSave,
    units, setUnits,
    animationSpeed, setAnimationSpeed,
    showLinkLabels, setShowLinkLabels,
    showGrid, setShowGrid,
    backend, setBackend,
  } = useSettingsStore();
  const [signingOut, setSigningOut] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (backend === 'firebase') {
        await fbSignOut(firebaseAuth);
      } else {
        await supabase.auth.signOut();
      }
      router.replace('/');
    } finally {
      setSigningOut(false);
    }
  };

  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const activeColor = isDark ? '#3B82F6' : '#2563EB';
  const inactiveBg  = isDark ? '#1E293B' : '#E5E7EB';
  const inactiveText= isDark ? '#94A3B8' : '#374151';

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="flex-row items-center gap-3 px-4 pb-4 border-b border-border bg-background" style={{ paddingTop: insets.top + 8 }}>
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-card border border-border items-center justify-center active:opacity-70">
          <ArrowLeft size={18} color={isDark ? '#CBD5E1' : '#6B7280'} />
        </Pressable>
        <Text className="text-foreground text-xl font-bold flex-1">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">

        {/* General */}
        <SectionHeader title="General" />
        <View className="bg-card border border-border rounded-2xl mx-4 overflow-hidden" style={{ borderCurve: 'continuous' }}>
          {/* Theme — sun/moon/system picker */}
          <SettingRow
            label="Theme"
            right={
              <View className="flex-row gap-1 bg-muted rounded-xl p-1">
                <Pressable
                  onPress={() => setThemeMode('light')}
                  className="w-9 h-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: themeMode === 'light' ? activeColor : 'transparent' }}
                >
                  <SunIcon active={themeMode === 'light'} />
                </Pressable>
                <Pressable
                  onPress={() => setThemeMode('dark')}
                  className="w-9 h-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: themeMode === 'dark' ? '#1E293B' : 'transparent' }}
                >
                  <MoonIcon active={themeMode === 'dark'} />
                </Pressable>
                <Pressable
                  onPress={() => setThemeMode('system')}
                  className="px-2 h-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: themeMode === 'system' ? (isDark ? '#334155' : '#D1D5DB') : 'transparent' }}
                >
                  <Text style={{ color: themeMode === 'system' ? (isDark ? '#F1F5F9' : '#111827') : inactiveText, fontSize: 10, fontWeight: '700' }}>AUTO</Text>
                </Pressable>
              </View>
            }
          />
          <Divider />
          {/* Units dropdown */}
          <SettingRow
            label="Units"
            right={
              <View className="flex-row gap-1">
                {(['metric', 'imperial'] as const).map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setUnits(u)}
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: units === u ? activeColor : inactiveBg }}
                  >
                    <Text style={{ color: units === u ? 'white' : inactiveText, fontSize: 12, fontWeight: '500' }}>
                      {u.charAt(0).toUpperCase() + u.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
          <Divider />
          <SettingRow
            label="Auto Save"
            subtitle="Save projects automatically every 30s"
            right={<Switch value={autoSave} onValueChange={setAutoSave} trackColor={{ true: '#22C55E', false: isDark ? '#334155' : '#E5E7EB' }} thumbColor="white" />}
          />
        </View>

        {/* Simulation */}
        <SectionHeader title="Simulation" />
        <View className="bg-card border border-border rounded-2xl mx-4 overflow-hidden" style={{ borderCurve: 'continuous' }}>
          <SettingRow
            label="Animation Speed"
            right={
              <View className="flex-row gap-1">
                {(['slow', 'normal', 'fast'] as const).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setAnimationSpeed(s)}
                    className="px-2.5 py-1.5 rounded-lg"
                    style={{ backgroundColor: animationSpeed === s ? activeColor : inactiveBg }}
                  >
                    <Text style={{ color: animationSpeed === s ? 'white' : inactiveText, fontSize: 11, fontWeight: '500' }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
          <Divider />
          <SettingRow
            label="Show Link Labels"
            subtitle="Show cable type on connections"
            right={<Switch value={showLinkLabels} onValueChange={setShowLinkLabels} trackColor={{ true: '#22C55E', false: isDark ? '#334155' : '#E5E7EB' }} thumbColor="white" />}
          />
          <Divider />
          <SettingRow
            label="Show Grid"
            subtitle="Display grid on canvas"
            right={<Switch value={showGrid} onValueChange={setShowGrid} trackColor={{ true: '#22C55E', false: isDark ? '#334155' : '#E5E7EB' }} thumbColor="white" />}
          />
        </View>

        {/* Backend */}
        <SectionHeader title="Backend" />
        <View className="bg-card border border-border rounded-2xl mx-4 overflow-hidden" style={{ borderCurve: 'continuous' }}>
          <SettingRow
            label="Data Backend"
            subtitle="Switch between Supabase and Firebase"
            right={
              <View className="flex-row gap-1">
                {(['supabase', 'firebase'] as const).map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => setBackend(b)}
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: backend === b ? activeColor : inactiveBg }}
                  >
                    <Text style={{ color: backend === b ? 'white' : inactiveText, fontSize: 11, fontWeight: '600' }}>
                      {b.charAt(0).toUpperCase() + b.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
          <Divider />
          <SettingRow
            label="Active"
            right={
              <Text style={{ color: activeColor, fontSize: 12, fontWeight: '700' }}>
                {backend === 'firebase' ? '🔥 Firebase Firestore' : '⚡ Supabase Postgres'}
              </Text>
            }
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View className="bg-card border border-border rounded-2xl mx-4 overflow-hidden" style={{ borderCurve: 'continuous' }}>
          <SettingRow label="Version" right={<Text className="text-muted-foreground text-sm">1.2.0</Text>} />
          <Divider />
          <SettingRow label="Help & Support" onPress={() => router.push('/(app)/help' as any)} />
          <Divider />
          <SettingRow label="About PacketFlow" onPress={() => router.push('/(app)/about' as any)} />
        </View>

        {/* Sign Out */}
        <SectionHeader title="Account" />
        <View className="mx-4">
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            className="flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-70"
            style={{ backgroundColor: '#EF444420', borderCurve: 'continuous', opacity: signingOut ? 0.6 : 1 }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 15 }}>
              {signingOut ? 'Signing out…' : `Sign Out (${backend === 'firebase' ? 'Firebase' : 'Supabase'})`}
            </Text>
          </Pressable>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

