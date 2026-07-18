import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, ArrowLeft, Bell, Check, CheckCircle, Info, Star } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { useSession } from '@/ctx';
import { fetchNotifications, markNotificationRead } from '@/db/api';
import { useAppStore } from '@/store/useAppStore';
import type { AppNotification } from '@/types';

function NotifIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ReactNode; bg: string }> = {
    info: { icon: <Info size={14} color="#3B82F6" />, bg: 'bg-primary/10' },
    success: { icon: <CheckCircle size={14} color="#22C55E" />, bg: 'bg-[#22C55E]/10' },
    warning: { icon: <AlertCircle size={14} color="#F59E0B" />, bg: 'bg-[#F59E0B]/10' },
    error: { icon: <AlertCircle size={14} color="#EF4444" />, bg: 'bg-destructive/10' },
  };
  const config = map[type] ?? map.info;
  return (
    <View className={`w-9 h-9 rounded-full ${config.bg} items-center justify-center`}>
      {config.icon}
    </View>
  );
}

export default function NotificationsScreen() {
  const { session } = useSession();
  const { notifications, setNotifications, markRead, markAllRead } = useAppStore();

  const { isLoading, refetch } = useQuery({
    queryKey: ['notifications', session?.user.id],
    queryFn: () => fetchNotifications(session!.user.id),
    enabled: !!session?.user.id,
    onSuccess: (data: Awaited<ReturnType<typeof fetchNotifications>>) => setNotifications(data),
  } as any);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const handleMarkRead = async (id: string) => {
    try { await markNotificationRead(id); } catch {}
    markRead(id);
  };

  const handleMarkAllRead = async () => {
    try {
      for (const n of notifications.filter((n) => !n.is_read)) {
        await markNotificationRead(n.id);
      }
    } catch {}
    markAllRead();
  };

  const formatTime = (iso: string) => {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    } catch { return ''; }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-border bg-background">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-card border border-border items-center justify-center active:opacity-70">
            <ArrowLeft size={18} color="#6B7280" />
          </Pressable>
          <Text className="text-foreground text-xl font-bold">Notifications</Text>
          {unreadCount > 0 && (
            <View className="px-2 py-0.5 rounded-full bg-primary">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllRead}>
            <Text className="text-primary text-sm font-medium">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3B82F6" />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="No notifications to show right now."
          icon={<Bell size={32} color="#6B7280" />}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="automatic"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleMarkRead(item.id)}
              className="flex-row items-start gap-3 px-5 py-4 active:bg-muted"
              style={{ backgroundColor: item.is_read ? undefined : 'rgba(59,130,246,0.05)' }}
            >
              <NotifIcon type={item.type} />
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-semibold text-sm">{item.title}</Text>
                  {!item.is_read && <View className="w-2 h-2 rounded-full bg-primary" />}
                </View>
                <Text className="text-muted-foreground text-sm mt-0.5 leading-5">{item.message}</Text>
                <Text className="text-muted-foreground text-xs mt-1">{formatTime(item.created_at)}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View className="h-px bg-border" />}
        />
      )}
    </View>
  );
}
