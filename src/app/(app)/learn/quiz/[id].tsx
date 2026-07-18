import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Check, X, Trophy, RotateCcw, BookOpen } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LESSONS, getQuizById } from '@/data/learningContent';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const quiz = getQuizById(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!quiz) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Quiz not found.</Text>
      </View>
    );
  }

  const question = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const isCorrect = selected === question.correctIndex;
  const hasAnswered = selected !== null;

  const correctCount = answers.filter((a, i) => a === quiz.questions[i]?.correctIndex).length;
  const scorePercent = Math.round((correctCount / total) * 100);

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (currentIndex + 1 >= total) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
    setFinished(false);
  };

  // ── Score Screen ──────────────────────────────────────────────────────────
  if (finished) {
    const lesson = LESSONS.find((l) => l.quizId === quiz.id);
    const grade =
      scorePercent >= 80 ? { label: 'Excellent!', color: '#10B981' } :
      scorePercent >= 60 ? { label: 'Good job!', color: '#3B82F6' } :
      { label: 'Keep studying', color: '#F59E0B' };

    return (
      <View className="flex-1 bg-background">
        <StatusBar style="auto" />
        <View className="bg-card border-b border-border px-5 pb-4 flex-row items-center gap-3" style={{ paddingTop: insets.top + 12 }}>
          <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-70">
            <ArrowLeft size={18} color="#64748B" />
          </Pressable>
          <Text className="text-foreground font-bold text-base flex-1">{quiz.title}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32 }}>
          {/* Score card */}
          <Animated.View entering={FadeInDown.springify()} className="items-center py-10">
            <View className="w-28 h-28 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${grade.color}22` }}>
              <Trophy size={48} color={grade.color} />
            </View>
            <Text className="text-foreground text-4xl font-bold">{scorePercent}%</Text>
            <Text className="font-semibold text-lg mt-1" style={{ color: grade.color }}>{grade.label}</Text>
            <Text className="text-muted-foreground text-sm mt-2">
              {correctCount} correct out of {total} questions
            </Text>
          </Animated.View>

          {/* Per-question review */}
          <Text className="text-foreground font-bold text-base mb-4">Review</Text>
          {quiz.questions.map((q, i) => {
            const userAnswer = answers[i];
            const correct = userAnswer === q.correctIndex;
            return (
              <Animated.View
                key={q.id}
                entering={FadeInDown.delay(i * 60).springify()}
                className="bg-card border border-border rounded-2xl p-4 mb-3"
                style={{ borderCurve: 'continuous' } as any}
              >
                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: correct ? '#10B981' : '#EF4444' }}>
                    {correct ? <Check size={12} color="#fff" /> : <X size={12} color="#fff" />}
                  </View>
                  <Text className="text-foreground font-medium text-sm flex-1 leading-5">{q.question}</Text>
                </View>
                {!correct && (
                  <Text className="text-muted-foreground text-xs mt-2 ml-9">
                    Correct: <Text className="text-emerald-400 font-medium">{q.options[q.correctIndex]}</Text>
                  </Text>
                )}
              </Animated.View>
            );
          })}

          {/* Actions */}
          <View className="gap-3 mt-4">
            <Pressable onPress={handleRestart} className="bg-primary rounded-2xl p-4 flex-row items-center justify-center gap-2 active:opacity-80">
              <RotateCcw size={18} color="#fff" />
              <Text className="text-white font-semibold">Retake Quiz</Text>
            </Pressable>
            {lesson && (
              <Pressable
                onPress={() => router.push(`/(app)/learn/flashcards/${lesson.flashcardDeckId}` as any)}
                className="bg-card border border-border rounded-2xl p-4 flex-row items-center justify-center gap-2 active:opacity-80"
              >
                <BookOpen size={18} color="#3B82F6" />
                <Text className="text-foreground font-semibold">Review Flashcards</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Question Screen ───────────────────────────────────────────────────────
  const progress = (currentIndex / total) * 100;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="bg-card border-b border-border px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-70">
            <ArrowLeft size={18} color="#64748B" />
          </Pressable>
          <Text className="text-foreground font-bold text-base flex-1" numberOfLines={1}>{quiz.title}</Text>
          <Text className="text-muted-foreground text-sm">{currentIndex + 1} / {total}</Text>
        </View>
        {/* Progress */}
        <View className="h-2 bg-muted rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Question */}
        <Animated.View entering={FadeInDown.springify()} key={currentIndex}>
          <Text className="text-foreground text-xl font-bold leading-8 mb-6">
            {question.question}
          </Text>

          {/* Options */}
          <View className="gap-3">
            {question.options.map((option, idx) => {
              let bg = 'bg-card';
              let border = 'border-border';
              let textColor = 'text-foreground';

              if (hasAnswered) {
                if (idx === question.correctIndex) {
                  bg = 'bg-emerald-500/10';
                  border = 'border-emerald-500/40';
                  textColor = 'text-emerald-400';
                } else if (idx === selected) {
                  bg = 'bg-destructive/10';
                  border = 'border-destructive/40';
                  textColor = 'text-destructive';
                }
              } else if (idx === selected) {
                bg = 'bg-primary/10';
                border = 'border-primary/40';
                textColor = 'text-primary';
              }

              return (
                <Pressable
                  key={idx}
                  onPress={() => handleSelect(idx)}
                  disabled={hasAnswered}
                  className={`${bg} border ${border} rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80`}
                  style={{ borderCurve: 'continuous' }}
                >
                  <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                    <Text className="text-muted-foreground font-bold text-sm">
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text className={`${textColor} font-medium text-base flex-1`}>{option}</Text>
                  {hasAnswered && idx === question.correctIndex && (
                    <Check size={18} color="#10B981" />
                  )}
                  {hasAnswered && idx === selected && idx !== question.correctIndex && (
                    <X size={18} color="#EF4444" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className={`mt-5 rounded-2xl p-4 border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}
              style={{ borderCurve: 'continuous' } as any}
            >
              <Text className={`font-semibold text-sm mb-1 ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
              </Text>
              <Text className="text-foreground/80 text-sm leading-6">{question.explanation}</Text>
            </Animated.View>
          )}

          {/* Next button */}
          {hasAnswered && (
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-6">
              <Pressable
                onPress={handleNext}
                className="bg-primary rounded-2xl p-4 items-center active:opacity-80"
              >
                <Text className="text-white font-bold text-base">
                  {currentIndex + 1 >= total ? 'See Results' : 'Next Question →'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
