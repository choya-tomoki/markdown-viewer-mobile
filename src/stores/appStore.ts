import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface RecentFolder {
  uri: string;
  name: string;
}

interface AppState {
  theme: ThemeMode;
  fontFamily: string;
  fontSize: number;
  recentFolders: RecentFolder[];

  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  addRecentFolder: (uri: string, name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontFamily: '',
      fontSize: 16,
      recentFolders: [],

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setFontFamily: (font) => set({ fontFamily: font }),
      setFontSize: (size) =>
        set({ fontSize: Math.max(10, Math.min(32, size)) }),
      addRecentFolder: (uri, name) =>
        set((state) => {
          const filtered = state.recentFolders.filter((f) => f.uri !== uri);
          return {
            recentFolders: [{ uri, name }, ...filtered].slice(0, 10),
          };
        }),
    }),
    {
      name: 'markdown-viewer-mobile-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
