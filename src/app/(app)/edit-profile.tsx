import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSession } from '@/ctx';
import { updateProfile } from '@/db/api';
import { useAppStore } from '@/store/useAppStore';

export default function EditProfileScreen() {
  const { session } = useSession();
  const { profile, setProfile } = useAppStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [email] = useState(profile?.email ?? session?.user.email ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const initials = fullName.split(' ').map((w) => w[0]?.toUpperCase()).slice(0, 2).join('') || '?';

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const updated = await updateProfile(session!.user.id, { full_name: fullName, bio });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => router.back(), 800);
    } catch (e) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-base';

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="flex-row items-center gap-3 px-4 pt-14 pb-4 border-b border-border bg-background">
        <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full bg-card border border-border items-center justify-center active:opacity-70">
          <ArrowLeft size={18} color="#6B7280" />
        </Pressable>
        <Text className="text-foreground text-xl font-bold">Edit Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 py-6 gap-6" keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View className="items-center">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-3xl font-bold">{initials}</Text>
            </View>
            <Pressable onPress={() => {}} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border items-center justify-center">
              <Camera size={14} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {error ? <Text className="text-destructive text-sm text-center">{error}</Text> : null}
        {saved ? <Text className="text-[#22C55E] text-sm text-center font-medium">Profile saved successfully!</Text> : null}

        <View className="gap-4">
          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Full Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Your name" placeholderTextColor="#6B7280" autoCapitalize="words" className={inputCls} />
          </View>

          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Email</Text>
            <View className="bg-muted border border-border rounded-xl px-4 py-3.5">
              <Text className="text-muted-foreground text-base">{email}</Text>
            </View>
            <Text className="text-muted-foreground text-xs">Email cannot be changed here.</Text>
          </View>

          <View className="gap-1.5">
            <Text className="text-foreground text-sm font-medium">Bio</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Tell us about yourself..." placeholderTextColor="#6B7280" multiline numberOfLines={4} className={`${inputCls} h-24`} textAlignVertical="top" />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={loading}
            className="bg-primary rounded-2xl py-4 items-center mt-2 active:opacity-80"
            style={{ borderCurve: 'continuous', opacity: loading ? 0.7 : 1 }}
          >
            <Text className="text-white font-bold text-base">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
