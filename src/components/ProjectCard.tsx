import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/utils';
import type { DeviceType } from '@/types';
import { DeviceIcon, getDeviceColor } from './DeviceIcon';

interface ProjectCardProps {
  name: string;
  updatedAt: string;
  deviceCount: number;
  isFavorite?: boolean;
  deviceTypes?: DeviceType[];
  onPress?: () => void;
  onMenuPress?: () => void;
}

export function ProjectCard({
  name,
  updatedAt,
  deviceCount,
  isFavorite,
  deviceTypes = [],
  onPress,
  onMenuPress,
}: ProjectCardProps) {
  const displayTypes = deviceTypes.slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      className="bg-card rounded-2xl p-4 border border-border active:opacity-80"
      style={{ borderCurve: 'continuous' }}
    >
      {/* Preview area */}
      <View className="bg-muted rounded-xl h-24 mb-3 items-center justify-center overflow-hidden">
        <View className="flex-row gap-2">
          {displayTypes.length > 0 ? (
            displayTypes.map((type, i) => (
              <View key={i} className="w-10 h-10">
                <DeviceIcon type={type} size={40} />
              </View>
            ))
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
              <Text className="text-primary text-xl font-bold">{name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-foreground font-semibold text-base" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-muted-foreground text-xs mt-0.5">
            {deviceCount} device{deviceCount !== 1 ? 's' : ''} • {formatRelativeTime(updatedAt)}
          </Text>
        </View>
        <Pressable
          onPress={onMenuPress}
          className="w-8 h-8 items-center justify-center rounded-full active:bg-muted"
          hitSlop={8}
        >
          <Text className="text-muted-foreground text-lg leading-4">···</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function formatRelativeTime(isoStr: string): string {
  try {
    const diff = Date.now() - new Date(isoStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(isoStr).toLocaleDateString();
  } catch {
    return '';
  }
}
