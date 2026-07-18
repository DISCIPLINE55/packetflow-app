import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  BookOpen, Brain, ChevronRight, Layers, Network,
  Route, Shield, TreePine, GitBranch, Wifi, CloudOff,
  RefreshCw,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  FlatList, Pressable, ScrollView, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOfflineStore } from '@/store/useOfflineStore';
import { CATEGORIES, LESSONS, getLessonsByCategory } from '@/data/learningContent';
import type { Lesson } from '@/data/learningContent';

const ICON_MAP: Record<string, React.ElementType> = {
  Layers, Network, Route, Shield, TreePine, GitBranch, Brain, BookOpen, Wifi,
};

function LessonIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? BookOpen;
  return <Icon size={size} color={color} />;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

function LessonCard({ lesson }: { key?: React.Key; lesson: Lesson }) {
  return (
    <Pressable
      onPress={() => router.push(`/(app)/learn/${lesson.id}` as any)}
      className="bg-card border border-border rounded-2xl p-4 mb-3 active:opacity-75"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: `${lesson.accentColor}22` }}>
          <LessonIcon name={lesson.icon} color={lesson.accentColor} size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="text-foreground font-semibold text-base">{lesson.title}</Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-muted-foreground text-xs">{lesson.duration}</Text>
            <Text className="text-muted-foreground text-xs">·</Text>
            <Text className="text-xs font-medium" style={{ color: DIFFICULTY_COLOR[lesson.difficulty] }}>
              {DIFFICULTY_LABEL[lesson.difficulty]}
            </Text>
          </View>
        </View>
        <ChevronRight size={16} color="#9CA3AF" />
      </View>
      <Text className="text-muted-foreground text-sm mt-2 leading-5" numberOfLines={2}>
        {lesson.description}
      </Text>
    </Pressable>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { isOnline, pendingCount, isSyncing } = useOfflineStore();

  const categorized = useMemo(
    () => CATEGORIES.map((cat) => ({ category: cat, lessons: getLessonsByCategory(cat) })),
    [],
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      {/* Header */}
      <View className="bg-card border-b border-border px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Learn</Text>
            <Text className="text-muted-foreground text-sm mt-0.5">{LESSONS.length} lessons · {CATEGORIES.length} categories</Text>
          </View>
          {/* Sync status badge */}
          {!isOnline ? (
            <View className="flex-row items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-3 py-1.5">
              <CloudOff size={12} color="#EF4444" />
              <Text className="text-xs font-medium" style={{ color: '#EF4444' }}>Offline</Text>
            </View>
          ) : isSyncing ? (
            <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <RefreshCw size={12} color="#3B82F6" />
              <Text className="text-xs font-medium text-primary">Syncing…</Text>
            </View>
          ) : pendingCount > 0 ? (
            <View className="flex-row items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1.5">
              <CloudOff size={12} color="#F59E0B" />
              <Text className="text-xs font-medium" style={{ color: '#F59E0B' }}>{pendingCount} pending</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Quick-access row */}
      <View className="flex-row gap-3 px-5 py-4">
        <Pressable
          onPress={() => router.push('/(app)/learn/quiz-all' as any)}
          className="flex-1 bg-primary rounded-2xl p-4 items-center gap-2 active:opacity-80"
          style={{ borderCurve: 'continuous' }}
        >
          <Brain size={24} color="#fff" />
          <Text className="text-white font-semibold text-sm">Practice Quiz</Text>
          <Text className="text-white/70 text-xs">All topics</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/(app)/learn/${LESSONS[0].id}` as any)}
          className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-2 active:opacity-80"
          style={{ borderCurve: 'continuous' }}
        >
          <BookOpen size={24} color="#3B82F6" />
          <Text className="text-foreground font-semibold text-sm">Start Here</Text>
          <Text className="text-muted-foreground text-xs">OSI Model</Text>
        </Pressable>
      </View>

      {/* Lesson categories */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {categorized.map(({ category, lessons }) => (
          <View key={category} className="mb-4">
            <Text className="text-foreground font-bold text-lg mb-3">{category}</Text>
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
