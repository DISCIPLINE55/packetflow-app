import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, Flame, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { firebaseAuth } from '@/client/firebase';
import { supabase } from '@/client/supabase';
import { useSettingsStore } from '@/store/useSettingsStore';

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

function GitHubIcon({ isDark }: { isDark?: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={isDark ? 'white' : '#24292e'}>
      <Path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </Svg>
  );
}

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const backend = useSettingsStore((s) => s.backend);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      if (backend === 'firebase') {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw new Error(err.message);
      }
      router.replace('/(app)/(tabs)/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backendLabel = backend === 'firebase' ? '🔥 Firebase' : '⚡ Supabase';

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-10 gap-3">
          <Text className="text-foreground text-3xl font-bold">Welcome Back!</Text>
          <Text className="text-muted-foreground text-sm">Login to your account</Text>
          {/* Backend badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border">
            {backend === 'firebase' ? <Flame size={12} color="#F97316" /> : <Zap size={12} color="#3B82F6" />}
            <Text className="text-muted-foreground text-xs">{backendLabel}</Text>
          </View>
        </View>
        {error ? <Text className="text-destructive text-sm mb-4 text-center">{error}</Text> : null}
        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="#6B7280" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} className="bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base" />
          </View>
          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Password</Text>
            <View className="relative">
              <TextInput value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="#6B7280" secureTextEntry={!showPassword} className="bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base pr-12" />
              <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3 top-3.5">
                {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </Pressable>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => setRememberMe((v) => !v)} className="flex-row items-center gap-2">
              <View className={`w-4 h-4 rounded border ${rememberMe ? 'bg-primary border-primary' : 'border-border bg-card'}`}>
                {rememberMe && <Text className="text-white text-xs text-center leading-4">✓</Text>}
              </View>
              <Text className="text-muted-foreground text-sm">Remember me</Text>
            </Pressable>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable onPress={() => {}}><Text className="text-primary text-sm font-medium">Forgot password?</Text></Pressable>
            </Link>
          </View>
          <Pressable onPress={handleLogin} disabled={loading} className="bg-primary rounded-2xl py-4 items-center mt-2 active:opacity-80" style={{ borderCurve: 'continuous', opacity: loading ? 0.7 : 1 }}>
            <Text className="text-white font-bold text-base">{loading ? 'Logging in...' : 'Login'}</Text>
          </Pressable>
        </View>
        <View className="flex-row justify-center mt-8 gap-1">
          <Text className="text-muted-foreground text-sm">Don't have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <Pressable onPress={() => {}}><Text className="text-primary text-sm font-semibold">Sign Up</Text></Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
