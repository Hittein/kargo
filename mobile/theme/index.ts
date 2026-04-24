import { gradients, palette, radius, shadow, spacing, typography, motion, fontFamily } from './tokens';

type Surface = {
  bg: string;
  bgElevated: string;
  card: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  divider: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  accent: string;
  accentDeep: string;
  success: string;
  danger: string;
  transit: string;
  brand: string;
  brandSoft: string;
  brandDeep: string;
  overlay: string;
  chipBg: string;
  chipActive: string;
};

const lightSurface: Surface = {
  bg: palette.white,
  bgElevated: '#F4F6FB',
  card: palette.white,
  surface: palette.sand,
  surfaceSoft: '#F8FAFD',
  text: palette.ink,
  textSecondary: palette.slate,
  textInverse: palette.white,
  border: '#E2E8F0',
  divider: '#EEF2F7',
  primary: palette.amber,
  primaryDeep: palette.amberDeep,
  primarySoft: '#FFE6DA',
  accent: palette.gold,
  accentDeep: palette.goldDeep,
  success: palette.success,
  danger: palette.coral,
  transit: palette.indigo,
  brand: palette.navy,
  brandSoft: palette.cyan,
  brandDeep: '#05112F',
  overlay: 'rgba(10, 22, 40, 0.55)',
  chipBg: '#F4F6FB',
  chipActive: palette.ink,
};

const darkSurface: Surface = {
  bg: palette.ink,
  bgElevated: palette.inkSoft,
  card: palette.inkSoft,
  surface: '#1F2A44',
  surfaceSoft: '#1A2238',
  text: palette.white,
  textSecondary: palette.slateSoft,
  textInverse: palette.ink,
  border: '#283449',
  divider: '#1F2A44',
  primary: palette.amber,
  primaryDeep: palette.amberDeep,
  primarySoft: '#3A1F16',
  accent: palette.gold,
  accentDeep: palette.goldDeep,
  success: palette.success,
  danger: palette.coral,
  transit: palette.indigo,
  brand: palette.navy,
  brandSoft: palette.cyan,
  brandDeep: '#05112F',
  overlay: 'rgba(0, 0, 0, 0.6)',
  chipBg: palette.inkSoft,
  chipActive: palette.white,
};

export const themes = {
  light: {
    name: 'light' as const,
    color: lightSurface,
    palette,
    spacing,
    radius,
    typography,
    shadow,
    motion,
    fontFamily,
    gradients,
  },
  dark: {
    name: 'dark' as const,
    color: darkSurface,
    palette,
    spacing,
    radius,
    typography,
    shadow,
    motion,
    fontFamily,
    gradients,
  },
};

export type ThemeName = keyof typeof themes;
export type Theme = (typeof themes)[ThemeName];

export { palette, radius, shadow, spacing, typography, motion, fontFamily, gradients };
