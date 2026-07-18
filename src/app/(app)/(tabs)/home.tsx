import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Clock, Cpu, Network, Plus, Star, Trash2, Copy, Heart } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProjectCard } from '@/components/ProjectCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useSession } from '@/ctx';
import { createProject, fetchProfile, fetchProjects, updateProjectMeta, deleteProject, duplicateProject } from '@/db/api';
import { useAppStore } from '@/store/useAppStore';
import type { DeviceType } from '@/types';

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-2" style={{ borderCurve: 'continuous' }}>
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">{icon}</View>
      <Text className="text-foreground text-xl font-bold">{value}</Text>
      <Text className="text-muted-foreground text-xs text-center">{label}</Text>
    </View>
  );
}

function QuickActionItem({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2 active:opacity-70">
      <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
        {icon}
      </View>
      <Text className="text-muted-foreground text-xs text-center w-16">{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { session } = useSession();
  const { profile, projects, setProfile, setProjects, addProject } = useAppStore();
  const insets = useSafeAreaInsets();
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: () => fetchProfile(session!.user.id),
    enabled: !!session?.user.id,
  });

  const { data: projectsData, isLoading: projectsLoading, refetch } = useQuery({
    queryKey: ['projects', session?.user.id],
    queryFn: () => fetchProjects(session!.user.id),
    enabled: !!session?.user.id,
  });

  useFocusEffect(useCallback(() => { refetch(); }, []));

  useEffect(() => { if (profileData) setProfile(profileData); }, [profileData]);
  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);

  const displayName = profile?.full_name || session?.user.email?.split('@')[0] || 'User';
  const recentProjects = projects.slice(0, 6);

  const handleCreateProject = async () => {
    try {
      const p = await createProject(`Network ${Date.now().toString().slice(-4)}`);
      addProject(p);
      router.push(`/(app)/canvas/${p.id}` as any);
    } catch (e) {}
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    setMenuProjectId(null);
    try {
      await updateProjectMeta(id, { is_favorite: !current });
      setProjects(projects.map((p: { id: string }) => p.id === id ? { ...p, is_favorite: !current } : p) as any);
    } catch (e) {}
  };

  const handleDuplicate = async (id: string) => {
    setMenuProjectId(null);
    try {
      const src = projects.find((p: { id: string }) => p.id === id);
      if (!src) return;
      const copy = await duplicateProject(src as any);
      addProject(copy);
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    setMenuProjectId(null);
    try {
      await deleteProject(id);
      setProjects(projects.filter((p: { id: string }) => p.id !== id) as any);
    } catch (e) {}
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pb-4 bg-background border-b border-border"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-sm font-bold">{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="text-foreground font-bold text-xl">PacketFlow</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <StatusBadge status="online" size="sm" />
          <Pressable
            onPress={() => router.push('/(app)/notifications' as any)}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:opacity-70"
          >
            <Bell size={18} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View className="px-5 py-5 gap-6">

          {/* Welcome */}
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <Text className="text-foreground text-2xl font-bold">Welcome, {displayName} 👋</Text>
            <Text className="text-muted-foreground text-sm mt-1">Ready to design your network?</Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text className="text-foreground font-semibold text-base mb-3">Overview</Text>
            <View className="flex-row gap-3">
              <StatCard icon={<Network size={20} color="#3B82F6" />} label="Projects" value={projects.length} />
              <StatCard icon={<Cpu size={20} color="#8B5CF6" />} label="Devices" value={profile?.total_devices ?? 0} />
              <StatCard icon={<Star size={20} color="#F59E0B" />} label="Favorites" value={projects.filter((p: { is_favorite?: boolean }) => p.is_favorite).length} />
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text className="text-foreground font-semibold text-base mb-3">Quick Actions</Text>
            <View className="bg-card border border-border rounded-2xl p-4" style={{ borderCurve: 'continuous' }}>
              <View className="flex-row justify-around">
                <QuickActionItem icon={<Plus size={22} color="#3B82F6" />} label="New Project" onPress={handleCreateProject} />
                <QuickActionItem icon={<Clock size={22} color="#8B5CF6" />} label="Recent" onPress={() => router.push('/(app)/(tabs)/projects' as any)} />
                <QuickActionItem icon={<Star size={22} color="#F59E0B" />} label="Favorites" onPress={() => router.push('/(app)/(tabs)/saved' as any)} />
                <QuickActionItem icon={<Network size={22} color="#22C55E" />} label="Templates" onPress={() => router.push('/(app)/(tabs)/projects' as any)} />
              </View>
            </View>
          </Animated.View>

          {/* Recent Projects */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-foreground font-semibold text-base">Recent Projects</Text>
              <Pressable onPress={() => router.push('/(app)/(tabs)/projects' as any)}>
                <Text className="text-primary text-sm">See all</Text>
              </Pressable>
            </View>

            {projectsLoading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : recentProjects.length === 0 ? (
              <View className="bg-card border border-border rounded-2xl p-8 items-center gap-3" style={{ borderCurve: 'continuous' }}>
                <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                  <Plus size={28} color="#3B82F6" />
                </View>
                <Text className="text-foreground font-semibold text-base">Your canvas is empty</Text>
                <Text className="text-muted-foreground text-sm text-center">Add devices from the tools to start building your network.</Text>
                <Pressable onPress={handleCreateProject} className="bg-primary rounded-xl px-6 py-3 mt-1 active:opacity-80">
                  <Text className="text-white font-semibold">Create Project</Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-3">
                {recentProjects.map((project: { id: string; name: string; updated_at: string; device_count: number; is_favorite?: boolean; topology_data?: { nodes?: Array<{ type: string }> } }) => (
                  <View key={project.id}>
                    <ProjectCard
                      name={project.name}
                      updatedAt={project.updated_at}
                      deviceCount={project.device_count}
                      isFavorite={project.is_favorite ?? false}
                      deviceTypes={(project.topology_data?.nodes?.slice(0, 3) ?? []).map((n: any) => n.type as DeviceType)}
                      onPress={() => router.push(`/(app)/canvas/${project.id}` as any)}
                      onMenuPress={() => setMenuProjectId(menuProjectId === project.id ? null : project.id)}
                    />
                    {menuProjectId === project.id && (
                      <View className="bg-card border border-border rounded-xl mt-1 overflow-hidden" style={{ borderCurve: 'continuous' }}>
                        <Pressable onPress={() => handleToggleFavorite(project.id, project.is_favorite ?? false)} className="flex-row items-center gap-3 px-4 py-3 active:bg-muted">
                          <Heart size={16} color="#F59E0B" />
                          <Text className="text-foreground text-sm">{project.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}</Text>
                        </Pressable>
                        <Pressable onPress={() => handleDuplicate(project.id)} className="flex-row items-center gap-3 px-4 py-3 active:bg-muted border-t border-border">
                          <Copy size={16} color="#6B7280" />
                          <Text className="text-foreground text-sm">Duplicate</Text>
                        </Pressable>
                        <Pressable onPress={() => handleDelete(project.id)} className="flex-row items-center gap-3 px-4 py-3 active:bg-muted border-t border-border">
                          <Trash2 size={16} color="#EF4444" />
                          <Text className="text-destructive text-sm">Delete</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        </View>

        {/* Bottom padding */}
        <View className="h-6" />
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={handleCreateProject}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg active:opacity-80"
        style={{ shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
      >
        <Plus size={26} color="white" />
      </Pressable>
    </View>
  );
}
