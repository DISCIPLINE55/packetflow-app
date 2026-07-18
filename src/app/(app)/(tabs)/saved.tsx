import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Star } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { ProjectCard } from '@/components/ProjectCard';
import { useAppStore } from '@/store/useAppStore';
import type { DeviceType } from '@/types';

export default function SavedScreen() {
  const projects = useAppStore((s) => s.projects);
  const favorites = projects.filter((p) => p.is_favorite);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="px-5 pt-14 pb-4 border-b border-border">
        <Text className="text-foreground text-2xl font-bold">Saved</Text>
        <Text className="text-muted-foreground text-sm mt-1">Your favorite projects</Text>
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          title="No saved projects"
          description="Star a project to save it here for quick access."
          icon={<Star size={32} color="#F59E0B" />}
        />
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
          <View className="gap-3 py-4">
            {favorites.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.name}
                updatedAt={project.updated_at}
                deviceCount={project.device_count}
                isFavorite={project.is_favorite}
                deviceTypes={(project.topology_data?.nodes?.slice(0, 3) ?? []).map((n: any) => n.type as DeviceType)}
                onPress={() => router.push(`/(app)/canvas/${project.id}` as any)}
                onMenuPress={() => {}}
              />
            ))}
          </View>
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
