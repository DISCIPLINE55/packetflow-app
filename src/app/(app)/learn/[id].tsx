import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft, BookOpen, Layers, Network, Route, Shield,
  TreePine, GitBranch, Brain, ChevronRight, Lightbulb, AlertTriangle,
  Terminal, LayoutGrid,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable, ScrollView, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLessonById } from '@/data/learningContent';
import type { LessonStep } from '@/data/learningContent';

const ICON_MAP: Record<string, React.ElementType> = {
  Layers, Network, Route, Shield, TreePine, GitBranch, Brain, BookOpen,
};

function LessonIcon({ name, color, size = 22 }: { name: string; color: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? BookOpen;
  return <Icon size={size} color={color} />;
}

function StepBlock({ step }: { key?: React.Key; step: LessonStep }) {
  switch (step.type) {
    case 'heading':
      return (
        <Text className="text-foreground text-xl font-bold mt-6 mb-2">{step.body}</Text>
      );
    case 'text':
      return (
        <Text className="text-foreground/85 text-base leading-7 mb-3">{step.body}</Text>
      );
    case 'code':
      return (
        <View className="bg-[#0D1117] rounded-xl p-4 mb-4 border border-border/40" style={{ borderCurve: 'continuous' }}>
          <View className="flex-row items-center gap-2 mb-2">
            <Terminal size={12} color="#64748B" />
            <Text className="text-[#64748B] text-xs font-medium">{step.language ?? 'code'}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={{ fontFamily: 'monospace', fontSize: 13, color: '#E2E8F0', lineHeight: 22 }}>
              {step.body}
            </Text>
          </ScrollView>
        </View>
      );
    case 'tip':
      return (
        <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4 flex-row gap-3" style={{ borderCurve: 'continuous' }}>
          <Lightbulb size={18} color="#10B981" style={{ marginTop: 2 }} />
          <Text className="text-emerald-400 text-sm leading-6 flex-1">{step.body}</Text>
        </View>
      );
    case 'warning':
      return (
        <View className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 flex-row gap-3" style={{ borderCurve: 'continuous' }}>
          <AlertTriangle size={18} color="#F59E0B" style={{ marginTop: 2 }} />
          <Text className="text-amber-400 text-sm leading-6 flex-1">{step.body}</Text>
        </View>
      );
    case 'diagram':
      return (
        <View className="bg-card border border-border rounded-xl p-4 mb-4" style={{ borderCurve: 'continuous' }}>
          <View className="flex-row items-center gap-2 mb-2">
            <LayoutGrid size={12} color="#64748B" />
            <Text className="text-muted-foreground text-xs font-medium">diagram</Text>
          </View>
          <Text style={{ fontFamily: 'monospace', fontSize: 13, color: '#94A3B8', lineHeight: 22 }}>
            {step.body}
          </Text>
        </View>
      );
    default:
      return null;
  }
}

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const lesson = getLessonById(id);

  if (!lesson) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Lesson not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Header */}
      <View
        className="bg-card border-b border-border px-5 pb-4 flex-row items-center gap-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-70"
        >
          <ArrowLeft size={18} color="#64748B" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-foreground font-bold text-base" numberOfLines={1}>{lesson.title}</Text>
          <Text className="text-muted-foreground text-xs mt-0.5">{lesson.duration} · {lesson.difficulty}</Text>
        </View>
        <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: `${lesson.accentColor}22` }}>
          <LessonIcon name={lesson.icon} color={lesson.accentColor} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: `${lesson.accentColor}15`, borderCurve: 'continuous' }}>
          <Text className="text-foreground font-bold text-2xl mb-2">{lesson.title}</Text>
          <Text className="text-muted-foreground text-sm leading-6">{lesson.description}</Text>
        </View>

        {/* Steps */}
        {lesson.content.map((step, i) => (
          <StepBlock key={i} step={step} />
        ))}

        {/* CTA row */}
        <View className="flex-row gap-3 mt-6">
          <Pressable
            onPress={() => router.push(`/(app)/learn/flashcards/${lesson.flashcardDeckId}` as any)}
            className="flex-1 bg-card border border-border rounded-2xl p-4 items-center gap-2 active:opacity-75"
            style={{ borderCurve: 'continuous' }}
          >
            <BookOpen size={22} color={lesson.accentColor} />
            <Text className="text-foreground font-semibold text-sm">Flashcards</Text>
            <Text className="text-muted-foreground text-xs">Review key terms</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/(app)/learn/quiz/${lesson.quizId}` as any)}
            className="flex-1 rounded-2xl p-4 items-center gap-2 active:opacity-75"
            style={{ backgroundColor: lesson.accentColor, borderCurve: 'continuous' }}
          >
            <Brain size={22} color="#fff" />
            <Text className="text-white font-semibold text-sm">Take Quiz</Text>
            <Text className="text-white/70 text-xs">Test your knowledge</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
