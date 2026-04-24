import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, ThemeName, themes } from './index';

type ThemeContextValue = {
  theme: Theme;
  scheme: ThemeName;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme: ThemeName = systemScheme === 'dark' ? 'dark' : 'light';
  const value = useMemo<ThemeContextValue>(
    () => ({ theme: themes[scheme], scheme }),
    [scheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx.theme;
}

export function useThemeScheme(): ThemeName {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeScheme must be used within <ThemeProvider>');
  return ctx.scheme;
}
