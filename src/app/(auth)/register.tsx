import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, updateProfile as fbUpdateProfile } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react-native';
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
import { firebaseAuth } from '@/client/firebase';
import { supabase } from '@/client/supabase';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const backend = useSettingsStore((s) => s.backend);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (backend === 'firebase') {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await fbUpdateProfile(cred.user, { displayName: fullName });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (err) throw new Error(err.message);
      }
      router.replace('/(app)/(tabs)/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8 gap-2">
          <Text className="text-foreground text-3xl font-bold">Create Account</Text>
          <Text className="text-muted-foreground text-sm">Sign up to get started</Text>
        </View>

        {error ? (
          <Text className="text-destructive text-sm mb-4 text-center">{error}</Text>
        ) : null}

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              className="bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base"
            />
          </View>

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

          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                className="bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base pr-12"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3 top-3.5">
                {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </Pressable>
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Confirm Password</Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showConfirm}
                className="bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base pr-12"
              />
              <Pressable onPress={() => setShowConfirm((v) => !v)} className="absolute right-3 top-3.5">
                {showConfirm ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="rounded-2xl py-4 items-center mt-2 active:opacity-80"
            style={{
              borderCurve: 'continuous',
              opacity: loading ? 0.7 : 1,
              backgroundColor: '#22C55E',
              shadowColor: '#22C55E',
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 }}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row justify-center mt-8 gap-1">
          <Text className="text-muted-foreground text-sm">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable onPress={() => {}}>
              <Text className="text-primary text-sm font-semibold">Login</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
