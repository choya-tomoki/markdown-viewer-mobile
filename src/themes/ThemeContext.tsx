import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ColorPalette } from './colors';
import { useAppStore } from '../stores/appStore';

interface ThemeContextValue {
  colors: ColorPalette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeSetting = useAppStore((s) => s.theme);

  const isDark = useMemo(() => {
    if (themeSetting === 'system') {
      return systemScheme === 'dark';
    }
    return themeSetting === 'dark';
  }, [themeSetting, systemScheme]);

  const value = useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
    }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
