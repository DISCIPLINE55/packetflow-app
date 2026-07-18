import { Tabs } from 'expo-router';
import { Bookmark, BookOpen, FolderOpen, Home, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { NAV_THEME } from '@/lib/theme';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function TabsLayout() {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s: { themeMode: string }) => s.themeMode);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const theme = isDark ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDark ? '#64748B' : '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <FolderOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Bookmark size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
