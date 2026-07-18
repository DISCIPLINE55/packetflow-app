// Zustand store for offline/sync state
import { create } from 'zustand';

interface OfflineStore {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  setIsOnline: (v: boolean) => void;
  setPendingCount: (n: number) => void;
  setIsSyncing: (v: boolean) => void;
  setLastSyncedAt: (d: Date) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncedAt: null,
  setIsOnline: (v) => set({ isOnline: v }),
  setPendingCount: (n) => set({ pendingCount: n }),
  setIsSyncing: (v) => set({ isSyncing: v }),
  setLastSyncedAt: (d) => set({ lastSyncedAt: d }),
}));
