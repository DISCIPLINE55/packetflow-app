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

export const useAppStore = create<AppStore>((set: (partial: Partial<AppStore> | ((s: AppStore) => Partial<AppStore>)) => void, get: () => AppStore) => ({
  profile: null,
  projects: [],
  notifications: [],
  unreadCount: 0,
  setProfile: (profile: Profile | null) => set({ profile }),
  setProjects: (projects: Project[]) => set({ projects }),
  addProject: (p: Project) => set((s: AppStore) => ({ projects: [p, ...s.projects] })),
  updateProject: (id: string, updates: Partial<Project>) =>
    set((s: AppStore) => ({
      projects: s.projects.map((p: Project) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProject: (id: string) =>
    set((s: AppStore) => ({ projects: s.projects.filter((p: Project) => p.id !== id) })),
  setNotifications: (notifications: AppNotification[]) =>
    set({ notifications, unreadCount: notifications.filter((n: AppNotification) => !n.is_read).length }),
  markRead: (id: string) =>
    set((s: AppStore) => {
      const notifications = s.notifications.map((n: AppNotification) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n: AppNotification) => !n.is_read).length };
    }),
  markAllRead: () =>
    set((s: AppStore) => ({
      notifications: s.notifications.map((n: AppNotification) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
}));
