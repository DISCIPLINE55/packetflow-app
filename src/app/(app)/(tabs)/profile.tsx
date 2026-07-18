import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut as fbSignOut } from 'firebase/auth';
import {
  Bell,
  ChevronRight,
  Crown,
  Edit3,
  KeyRound,
  LogOut,
  Settings,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { firebaseAuth } from '@/client/firebase';
import { supabase } from '@/client/supabase';
import { SubscriptionBadge } from '@/components/StatusBadge';
import { useSession } from '@/ctx';
import { fetchProfile } from '@/db/api';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}

function MenuRow({ icon, label, onPress, danger, right }: MenuItem) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4 active:bg-muted"
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-8 h-8 rounded-full items-center justify-center ${danger ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          {icon}
        </View>
        <Text className={`text-base font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>{label}</Text>
      </View>
      {right ?? <ChevronRight size={18} color="#6B7280" />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { session } = useSession();
  const { profile, projects, setProfile } = useAppStore();
  const [signingOut, setSigningOut] = useState(false);
  const insets = useSafeAreaInsets();

  const { isLoading } = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: () => fetchProfile(session!.user.id),
    enabled: !!session?.user.id,
    onSuccess: (data: Awaited<ReturnType<typeof fetchProfile>>) => { if (data) setProfile(data); },
  } as any);

  const displayName = profile?.full_name || session?.user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((w: string) => w[0]?.toUpperCase()).slice(0, 2).join('');
  const email = profile?.email || session?.user.email || '';
  const tier = profile?.subscription_tier ?? 'free';

  const handleSignOut = async () => {
    setSigningOut(true);
    const backend = useSettingsStore.getState().backend;
    try {
      if (backend === 'firebase') {
        await fbSignOut(firebaseAuth);
      } else {
        await supabase.auth.signOut();
      }
    } finally {
      router.replace('/');
    }
  };

  const menuItems: MenuItem[] = [
    { icon: <Edit3 size={16} color="#3B82F6" />, label: 'Edit Profile', onPress: () => router.push('/(app)/edit-profile' as any) },
    { icon: <KeyRound size={16} color="#3B82F6" />, label: 'Change Password', onPress: () => router.push('/(auth)/forgot-password' as any) },
    { icon: <Bell size={16} color="#3B82F6" />, label: 'Notifications', onPress: () => router.push('/(app)/notifications' as any) },
    { icon: <Crown size={16} color="#F59E0B" />, label: 'Subscription', onPress: () => {}, right: <SubscriptionBadge tier={tier} /> },
  ];

  if (isLoading && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="px-5 pb-4 border-b border-border flex-row items-center justify-between" style={{ paddingTop: insets.top + 8 }}>
        <View className="w-8" />
        <Text className="text-foreground text-2xl font-bold text-center">Profile</Text>
        <Pressable onPress={() => router.push('/(app)/settings' as any)} className="w-8 h-8 rounded-full bg-card border border-border items-center justify-center active:opacity-70">
          <Settings size={16} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        {/* Avatar section */}
        <View className="items-center py-8 gap-3">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-3xl font-bold">{initials}</Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-foreground text-xl font-bold">{displayName}</Text>
            <Text className="text-muted-foreground text-sm">{email}</Text>
            <SubscriptionBadge tier={tier} />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-5 gap-3 mb-6">
          {[
            { label: 'Projects', value: projects.length },
            { label: 'Favorites', value: projects.filter((p) => p.is_favorite).length },
            { label: 'Devices', value: profile?.total_devices ?? 0 },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-card border border-border rounded-2xl p-3 items-center" style={{ borderCurve: 'continuous' }}>
              <Text className="text-foreground text-2xl font-bold">{stat.value}</Text>
              <Text className="text-muted-foreground text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View className="bg-card border border-border rounded-2xl mx-5 overflow-hidden" style={{ borderCurve: 'continuous' }}>
          {menuItems.map((item, i) => (
            <React.Fragment key={item.label}>
              <MenuRow {...item} />
              {i < menuItems.length - 1 && <View className="h-px bg-border mx-4" />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <View className="mx-5 mt-4 mb-10">
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            className="flex-row items-center gap-3 px-4 py-4 bg-destructive/10 border border-destructive/20 rounded-2xl active:opacity-70"
            style={{ borderCurve: 'continuous' }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text className="text-destructive font-semibold text-base">
              {signingOut ? 'Signing out...' : 'Log Out'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
