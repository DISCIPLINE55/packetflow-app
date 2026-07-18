import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/client/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) { setError(err.message); } else { setSent(true); }
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Link href="/(auth)/sign-in" asChild>
          <Pressable onPress={() => {}} className="flex-row items-center gap-2 mb-10 active:opacity-60">
            <ArrowLeft size={20} color="#6B7280" />
            <Text className="text-muted-foreground text-sm">Back to Login</Text>
          </Pressable>
        </Link>

        <View className="items-center mb-8 gap-3">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
            <Mail size={32} color="#3B82F6" />
          </View>
          <Text className="text-foreground text-2xl font-bold">Reset Password</Text>
          <Text className="text-muted-foreground text-sm text-center leading-5">
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        {sent ? (
          <View className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-2xl p-5 items-center gap-2">
            <Text className="text-[#22C55E] text-base font-semibold">Check your email!</Text>
            <Text className="text-muted-foreground text-sm text-center">
              We've sent a password reset link to {email}
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {error ? <Text className="text-destructive text-sm text-center">{error}</Text> : null}
            <View className="gap-1.5">
              <Text className="text-foreground text-sm font-medium">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base"
              />
            </View>
            <Pressable
              onPress={handleSend}
              disabled={loading}
              className="bg-primary rounded-2xl py-4 items-center mt-2 active:opacity-80"
              style={{ borderCurve: 'continuous', opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-white font-bold text-base">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
