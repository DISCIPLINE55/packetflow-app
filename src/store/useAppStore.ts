import { create } from 'zustand';
import type { AppNotification, Profile, Project } from '@/types';

interface AppStore {
  profile: Profile | null;
  projects: Project[];
  notifications: AppNotification[];
  unreadCount: number;
  setProfile: (p: Profile | null) => void;
  setProjects: (ps: Project[]) => void;
  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setNotifications: (ns: AppNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  profile: null,
  projects: [],
  notifications: [],
  unreadCount: 0,
  setProfile: (profile) => set({ profile }),
  setProjects: (projects) => set({ projects }),
  addProject: (p) => set((s) => ({ projects: [p, ...s.projects] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.is_read).length }),
  markRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.is_read).length };
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
}));
