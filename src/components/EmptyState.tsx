import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-8 gap-4', className)}>
      {icon && <View className="w-20 h-20 rounded-full bg-muted items-center justify-center mb-2">{icon}</View>}
      <Text className="text-foreground text-xl font-semibold text-center">{title}</Text>
      {description && (
        <Text className="text-muted-foreground text-sm text-center leading-5">{description}</Text>
      )}
      {action}
    </View>
  );
}
