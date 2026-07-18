import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable, Text, View, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate,
  Extrapolation, runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDeckById } from '@/data/learningContent';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 48;

function FlashCard({
  front,
  back,
}: {
  front: string;
  back: string;
}) {
  const flip = useSharedValue(0);
  const [showBack, setShowBack] = useState(false);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` }],
    opacity: interpolate(flip.value, [0, 0.5, 1], [1, 0, 0], Extrapolation.CLAMP),
    position: 'absolute',
    width: '100%',
    height: '100%',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360], Extrapolation.CLAMP)}deg` }],
    opacity: interpolate(flip.value, [0, 0.5, 1], [0, 0, 1], Extrapolation.CLAMP),
    position: 'absolute',
    width: '100%',
    height: '100%',
  }));

  const handleFlip = () => {
    const toBack = flip.value < 0.5;
    flip.value = withTiming(toBack ? 1 : 0, { duration: 400 });
    setTimeout(() => runOnJS(setShowBack)(toBack), 200);
  };

  return (
    <Pressable onPress={handleFlip} style={{ width: CARD_W, height: 260 }}>
      {/* Front */}
      <Animated.View
        style={[frontStyle]}
        className="bg-card border-2 border-border rounded-3xl items-center justify-center p-8"
      >
        <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4">Question</Text>
        <Text className="text-foreground text-xl font-bold text-center leading-8">{front}</Text>
        <Text className="text-muted-foreground text-xs mt-6">Tap to reveal answer</Text>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[backStyle]}
        className="bg-primary/10 border-2 border-primary/30 rounded-3xl items-center justify-center p-8"
      >
        <Text className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Answer</Text>
        <Text className="text-foreground text-base font-medium text-center leading-7">{back}</Text>
        <Text className="text-muted-foreground text-xs mt-6">Tap to flip back</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function FlashcardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const deck = getDeckById(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  if (!deck) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Deck not found.</Text>
      </View>
    );
  }

  const card = deck.cards[currentIndex];
  const progress = completed.size / deck.cards.length;
  const allDone = completed.size === deck.cards.length;

  const goNext = () => {
    setCompleted((prev) => new Set([...prev, currentIndex]));
    if (currentIndex < deck.cards.length - 1) setCurrentIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setCompleted(new Set());
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="bg-card border-b border-border px-5 pb-4 flex-row items-center gap-3" style={{ paddingTop: insets.top + 12 }}>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-70">
          <ArrowLeft size={18} color="#64748B" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-foreground font-bold text-base" numberOfLines={1}>{deck.title}</Text>
          <Text className="text-muted-foreground text-xs mt-0.5">{deck.cards.length} cards</Text>
        </View>
        <Pressable onPress={restart} className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-70">
          <RotateCcw size={16} color="#64748B" />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-muted mx-5 mt-4 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
      <Text className="text-center text-muted-foreground text-xs mt-2">
        {completed.size} / {deck.cards.length} reviewed
      </Text>

      {/* Card area */}
      <View className="flex-1 items-center justify-center px-6">
        {allDone ? (
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center">
              <Check size={36} color="#10B981" />
            </View>
            <Text className="text-foreground text-2xl font-bold">All done!</Text>
            <Text className="text-muted-foreground text-base text-center">
              You reviewed all {deck.cards.length} cards.
            </Text>
            <Pressable
              onPress={restart}
              className="mt-4 bg-primary rounded-2xl px-8 py-3 active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">Review Again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} className="active:opacity-70">
              <Text className="text-muted-foreground text-sm">Back to lesson</Text>
            </Pressable>
          </View>
        ) : (
          <FlashCard front={card.front} back={card.back} />
        )}
      </View>

      {/* Navigation */}
      {!allDone && (
        <View className="flex-row items-center justify-between px-8 pb-6" style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            onPress={goPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-card border border-border items-center justify-center active:opacity-70"
            style={{ opacity: currentIndex === 0 ? 0.35 : 1 }}
          >
            <ChevronLeft size={22} color="#64748B" />
          </Pressable>

          <Text className="text-muted-foreground text-sm font-medium">
            {currentIndex + 1} / {deck.cards.length}
          </Text>

          <Pressable
            onPress={goNext}
            className="w-12 h-12 rounded-full bg-primary items-center justify-center active:opacity-70"
          >
            {currentIndex === deck.cards.length - 1 ? (
              <Check size={22} color="#fff" />
            ) : (
              <ChevronRight size={22} color="#fff" />
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
