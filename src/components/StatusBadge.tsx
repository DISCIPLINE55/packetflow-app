import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'error' | 'warning';
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  online: { label: 'Online', dot: 'bg-[#22C55E]', bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]' },
  offline: { label: 'Offline', dot: 'bg-muted-foreground', bg: 'bg-muted', text: 'text-muted-foreground' },
  error: { label: 'Error', dot: 'bg-destructive', bg: 'bg-destructive/20', text: 'text-destructive' },
  warning: { label: 'Warning', dot: 'bg-[#F59E0B]', bg: 'bg-[#F59E0B]/20', text: 'text-[#F59E0B]' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View
      className={cn(
        'flex-row items-center rounded-full',
        config.bg,
        size === 'sm' ? 'px-2 py-0.5 gap-1' : 'px-3 py-1 gap-1.5'
      )}
    >
      <View className={cn('rounded-full', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      <Text className={cn(config.text, size === 'sm' ? 'text-xs font-medium' : 'text-sm font-medium')}>
        {config.label}
      </Text>
    </View>
  );
}

interface SubscriptionBadgeProps {
  tier: 'free' | 'pro';
}

export function SubscriptionBadge({ tier }: SubscriptionBadgeProps) {
  return (
    <View
      className={cn(
        'px-2.5 py-0.5 rounded-full flex-row items-center gap-1',
        tier === 'pro' ? 'bg-[#06B6D4]/20' : 'bg-[#22C55E]/20'
      )}
    >
      <Text
        className={cn(
          'text-xs font-semibold',
          tier === 'pro' ? 'text-[#06B6D4]' : 'text-[#22C55E]'
        )}
      >
        {tier === 'pro' ? 'Pro' : 'Free'}
      </Text>
    </View>
  );
}
