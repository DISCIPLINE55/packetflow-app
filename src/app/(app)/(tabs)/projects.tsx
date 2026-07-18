import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Archive, Copy, MoreVertical, Plus, Search, Star, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EmptyState } from '@/components/EmptyState';
import { ProjectCard } from '@/components/ProjectCard';
import { useSession } from '@/ctx';
import {
  createProject,
  deleteProject,
  duplicateProject,
  fetchProjects,
  updateProjectMeta,
} from '@/db/api';
import { useAppStore } from '@/store/useAppStore';
import type { DeviceType } from '@/types';

type TabType = 'recent' | 'shared';

export default function ProjectsScreen() {
  const { session } = useSession();
  const { projects, setProjects, addProject, removeProject, updateProject } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [search, setSearch] = useState('');
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);

  const { isLoading, refetch } = useQuery({
    queryKey: ['projects', session?.user.id],
    queryFn: () => fetchProjects(session!.user.id),
    enabled: !!session?.user.id,
    onSuccess: (data: Awaited<ReturnType<typeof fetchProjects>>) => setProjects(data),
  } as any);

  useFocusEffect(useCallback(() => { refetch(); }, []));

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    try {
      const p = await createProject(`Network ${Date.now().toString().slice(-4)}`);
      addProject(p);
      router.push(`/(app)/canvas/${p.id}` as any);
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      removeProject(id);
    } catch (e) {}
    setMenuProjectId(null);
  };

  const handleDuplicate = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    try {
      const copy = await duplicateProject(project);
      addProject(copy);
    } catch (e) {}
    setMenuProjectId(null);
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      await updateProjectMeta(id, { is_favorite: !current });
      updateProject(id, { is_favorite: !current });
    } catch (e) {}
    setMenuProjectId(null);
  };

  const handleArchive = async (id: string) => {
    try {
      await updateProjectMeta(id, { is_archived: true });
      removeProject(id);
    } catch (e) {}
    setMenuProjectId(null);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-border bg-background">
        <Text className="text-foreground text-2xl font-bold">Projects</Text>
        <Pressable
          onPress={handleCreate}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-80"
        >
          <Plus size={20} color="white" />
        </Pressable>
      </View>

      {/* Search */}
      <View className="px-5 py-3">
        <View className="flex-row items-center bg-card border border-border rounded-xl px-3 gap-2">
          <Search size={16} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects..."
            placeholderTextColor="#6B7280"
            className="flex-1 py-3 text-foreground text-sm"
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 gap-1 mb-2">
        {(['recent', 'shared'] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${activeTab === tab ? 'bg-primary' : 'bg-card border border-border'}`}
          >
            <Text
              className={`text-sm font-medium capitalize ${activeTab === tab ? 'text-white' : 'text-muted-foreground'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : 'No projects yet'}
          description={search ? `No projects match "${search}"` : 'Create your first network topology project.'}
          action={
            !search ? (
              <Pressable onPress={handleCreate} className="bg-primary rounded-xl px-6 py-3 active:opacity-80">
                <Text className="text-white font-semibold">Create Project</Text>
              </Pressable>
            ) : undefined
          }
        />
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="gap-3 py-2">
            {filtered.map((project, idx) => (
              <Animated.View key={project.id} entering={FadeIn.delay(idx * 40).duration(300)}>
                <View className="relative">
                  <ProjectCard
                    name={project.name}
                    updatedAt={project.updated_at}
                    deviceCount={project.device_count}
                    isFavorite={project.is_favorite}
                    deviceTypes={(project.topology_data?.nodes?.slice(0, 3) ?? []).map((n: any) => n.type as DeviceType)}
                    onPress={() => {
                      setMenuProjectId(null);
                      router.push(`/(app)/canvas/${project.id}` as any);
                    }}
                    onMenuPress={() => setMenuProjectId(menuProjectId === project.id ? null : project.id)}
                  />

                  {/* Context menu */}
                  {menuProjectId === project.id && (
                    <View className="absolute right-4 top-16 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden w-44">
                      <Pressable
                        onPress={() => handleToggleFavorite(project.id, project.is_favorite)}
                        className="flex-row items-center gap-3 px-4 py-3 active:bg-muted"
                      >
                        <Star size={16} color="#F59E0B" />
                        <Text className="text-foreground text-sm">{project.is_favorite ? 'Unfavorite' : 'Favorite'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDuplicate(project.id)}
                        className="flex-row items-center gap-3 px-4 py-3 active:bg-muted"
                      >
                        <Copy size={16} color="#3B82F6" />
                        <Text className="text-foreground text-sm">Duplicate</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleArchive(project.id)}
                        className="flex-row items-center gap-3 px-4 py-3 active:bg-muted"
                      >
                        <Archive size={16} color="#6B7280" />
                        <Text className="text-foreground text-sm">Archive</Text>
                      </Pressable>
                      <View className="h-px bg-border mx-3" />
                      <Pressable
                        onPress={() => handleDelete(project.id)}
                        className="flex-row items-center gap-3 px-4 py-3 active:bg-muted"
                      >
                        <Trash2 size={16} color="#EF4444" />
                        <Text className="text-[#EF4444] text-sm">Delete</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
          <View className="h-24" />
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={handleCreate}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg active:opacity-80"
        style={{ shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
      >
        <Plus size={26} color="white" />
      </Pressable>
    </View>
  );
}
