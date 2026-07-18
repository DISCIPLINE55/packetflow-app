import { create } from 'zustand';

export type BackendType = 'supabase' | 'firebase';

interface SettingsStore {
  themeMode: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'normal' | 'large';
  animationsEnabled: boolean;
  autoSave: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  showLinkLabels: boolean;
  showGrid: boolean;
  units: 'metric' | 'imperial';
  backend: BackendType;

  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: string) => void;
  setFontSize: (size: 'small' | 'normal' | 'large') => void;
  setAnimationsEnabled: (v: boolean) => void;
  setAutoSave: (v: boolean) => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setShowLinkLabels: (v: boolean) => void;
  setShowGrid: (v: boolean) => void;
  setUnits: (u: 'metric' | 'imperial') => void;
  setBackend: (b: BackendType) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  themeMode: 'system',
  language: 'en',
  fontSize: 'normal',
  animationsEnabled: true,
  autoSave: true,
  animationSpeed: 'normal',
  showLinkLabels: true,
  showGrid: true,
  units: 'metric',
  backend: 'supabase',

  setThemeMode: (themeMode) => set({ themeMode }),
  setLanguage: (language) => set({ language }),
  setFontSize: (fontSize) => set({ fontSize }),
  setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setShowLinkLabels: (showLinkLabels) => set({ showLinkLabels }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setUnits: (units) => set({ units }),
  setBackend: (backend) => set({ backend }),
}));
