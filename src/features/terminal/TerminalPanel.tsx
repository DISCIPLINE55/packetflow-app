import { Copy, Send, Terminal, Trash2, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useTerminalStore } from '@/store/useTerminalStore';

const lineColors: Record<string, string> = {
  output: '#22C55E',
  input: '#60A5FA',
  error: '#F87171',
  system: '#F59E0B',
};

interface TerminalPanelProps {
  onClose: () => void;
}

export function TerminalPanel({ onClose }: TerminalPanelProps) {
  const {
    lines,
    currentInput,
    clearLines,
    setInput,
    executeCommand,
    exportLogs,
    getPrompt,
  } = useTerminalStore();

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (lines.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [lines.length]);

  const handleSend = () => {
    if (!currentInput.trim()) return;
    executeCommand(currentInput);
  };

  const handleCopy = () => {
    const text = exportLogs();
    // Clipboard is web-only via navigator; skip silently on native
    if (process.env.EXPO_OS === 'web' && typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  };

  const prompt = getPrompt();

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
        backgroundColor: '#080F1A',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        borderTopWidth: 1, borderColor: '#1E293B',
        height: 300,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#0F1F30' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Terminal size={14} color="#22C55E" />
          <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '800', letterSpacing: 1.8, fontFamily: 'monospace' }}>TERMINAL</Text>
          {/* Mode badge */}
          <View style={{ backgroundColor: '#0F2A1A', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: '#1A4A2A' }}>
            <Text style={{ color: '#4ADE80', fontSize: 10, fontWeight: '700', fontFamily: 'monospace' }}>{prompt}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable onPress={handleCopy} className="active:opacity-60" style={{ width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
            <Copy size={13} color="#475569" />
          </Pressable>
          <Pressable onPress={clearLines} className="active:opacity-60" style={{ width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={13} color="#475569" />
          </Pressable>
          <Pressable onPress={onClose} className="active:opacity-60" style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#1A0A0A', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Output */}
      <FlatList
        ref={flatListRef}
        data={lines}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingVertical: 8, gap: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Text
            selectable
            style={{
              fontFamily: 'monospace',
              fontSize: 11.5,
              color: lineColors[item.type] ?? '#22C55E',
              lineHeight: 18,
            }}
          >
            {item.text}
          </Text>
        )}
      />

      {/* Input row */}
      <KeyboardAvoidingView behavior="padding">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#0F1F30', backgroundColor: '#04090F' }}>
          <Text style={{ color: '#4ADE80', fontSize: 12, fontFamily: 'monospace', flexShrink: 0 }}>{prompt}</Text>
          <TextInput
            value={currentInput}
            onChangeText={setInput}
            placeholder="Type IOS command..."
            placeholderTextColor="#1E3A5F"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1,
              color: '#F1F5F9',
              fontFamily: 'monospace',
              fontSize: 12,
              paddingVertical: 4,
            }}
          />
          <Pressable
            onPress={handleSend}
            className="active:opacity-70"
            style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' }}
          >
            <Send size={14} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
