// Side-effect: polyfills global localStorage for Supabase native auth storage (must precede createClient)
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey: string = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// On web localStorage is natively available; on native the install polyfill above provides it
const authStorage = Platform.OS === 'web' ? localStorage : localStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
