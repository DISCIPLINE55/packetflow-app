// Practice Quiz — picks a random question from all available quizzes
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Trophy, RotateCcw, Check, X, BookOpen } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QUIZZES } from '@/data/learningContent';
import type { QuizQuestion } from '@/data/learningContent';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizAllScreen() {
  const insets = useSafeAreaInsets();

  const questions: QuizQuestion[] = useMemo(
    () => shuffle(QUIZZES.flatMap((q) => q.questions)).slice(0, 10),
    [],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const hasAnswered = selected !== null;
  const isCorrect = selected === question?.correctIndex;
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const scorePercent = Math.round((correctCount / total) * 100);

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (currentIndex + 1 >= total) { setFinished(true); return; }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setShowExplanation(false);
  };

  const restart = () => {
    setCurrentIndex(0); setSelected(null);
    setAnswers([]); setShowExplanation(false); setFinished(false);
  };

  if (finished) {
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
          <Text className="text-foreground font-bold text-base flex-1">Practice Quiz</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32 }}>
          <Animated.View entering={FadeInDown.springify()} className="items-center py-10">
            <View className="w-28 h-28 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${grade.color}22` }}>
              <Trophy size={48} color={grade.color} />
            </View>
            <Text className="text-foreground text-4xl font-bold">{scorePercent}%</Text>
            <Text className="font-semibold text-lg mt-1" style={{ color: grade.color }}>{grade.label}</Text>
            <Text className="text-muted-foreground text-sm mt-2">{correctCount} correct out of {total}</Text>
          </Animated.View>
          {quiz_questions_review(questions, answers)}
          <Pressable onPress={restart} className="bg-primary rounded-2xl p-4 flex-row items-center justify-center gap-2 active:opacity-80 mt-2">
            <RotateCcw size={18} color="#fff" />
            <Text className="text-white font-semibold">New Practice Round</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const progress = (currentIndex / total) * 100;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="bg-card border-b border-border px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full bg-muted items-center justify-center active:opacity-70">
            <ArrowLeft size={18} color="#64748B" />
          </Pressable>
          <Text className="text-foreground font-bold text-base flex-1">Practice Quiz</Text>
          <Text className="text-muted-foreground text-sm">{currentIndex + 1} / {total}</Text>
        </View>
        <View className="h-2 bg-muted rounded-full overflow-hidden">
          <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>
        <Animated.View entering={FadeInDown.springify()} key={currentIndex}>
          <Text className="text-foreground text-xl font-bold leading-8 mb-6">{question.question}</Text>
          <View className="gap-3">
            {question.options.map((option, idx) => {
              let bg = 'bg-card', border = 'border-border', textColor = 'text-foreground';
              if (hasAnswered) {
                if (idx === question.correctIndex) { bg = 'bg-emerald-500/10'; border = 'border-emerald-500/40'; textColor = 'text-emerald-400'; }
                else if (idx === selected) { bg = 'bg-destructive/10'; border = 'border-destructive/40'; textColor = 'text-destructive'; }
              }
              return (
                <Pressable key={idx} onPress={() => handleSelect(idx)} disabled={hasAnswered}
                  className={`${bg} border ${border} rounded-2xl p-4 flex-row items-center gap-4 active:opacity-80`}
                  style={{ borderCurve: 'continuous' }}>
                  <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                    <Text className="text-muted-foreground font-bold text-sm">{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text className={`${textColor} font-medium text-base flex-1`}>{option}</Text>
                  {hasAnswered && idx === question.correctIndex && <Check size={18} color="#10B981" />}
                  {hasAnswered && idx === selected && idx !== question.correctIndex && <X size={18} color="#EF4444" />}
                </Pressable>
              );
            })}
          </View>
          {showExplanation && (
            <Animated.View entering={FadeIn.duration(300)}
              className={`mt-5 rounded-2xl p-4 border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}
              style={{ borderCurve: 'continuous' } as any}>
              <Text className={`font-semibold text-sm mb-1 ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
              </Text>
              <Text className="text-foreground/80 text-sm leading-6">{question.explanation}</Text>
            </Animated.View>
          )}
          {hasAnswered && (
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-6">
              <Pressable onPress={handleNext} className="bg-primary rounded-2xl p-4 items-center active:opacity-80">
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

function quiz_questions_review(questions: QuizQuestion[], answers: (number | null)[]) {
  return (
    <>
      <Text className="text-foreground font-bold text-base mb-4">Review</Text>
      {questions.map((q, i) => {
        const correct = answers[i] === q.correctIndex;
        return (
          <Animated.View key={q.id} entering={FadeInDown.delay(i * 50).springify()}
            className="bg-card border border-border rounded-2xl p-4 mb-3"
            style={{ borderCurve: 'continuous' } as any}>
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                style={{ backgroundColor: correct ? '#10B981' : '#EF4444' }}>
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
    </>
  );
}
