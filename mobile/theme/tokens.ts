export const palette = {
  ink: '#0A1628',
  inkSoft: '#172238',
  amber: '#FF6B35',
  amberDeep: '#E8541E',
  gold: '#F7B500',
  goldDeep: '#D89A00',
  sand: '#F5EFE6',
  mist: '#EEF2F7',
  slate: '#475569',
  slateSoft: '#94A3B8',
  success: '#10B981',
  coral: '#FB7185',
  indigo: '#4F46E5',
  navy: '#0A1E5B',
  cyan: '#4DB8D6',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 14,
  lg: 22,
  xl: 32,
  xxl: 44,
  pill: 999,
} as const;

export const gradients = {
  brand: ['#0A1E5B', '#1E3A8A', '#4DB8D6'] as const,
  brandSoft: ['#4DB8D6', '#60A5FA'] as const,
  ink: ['#0A1628', '#172238'] as const,
  sunset: ['#FF6B35', '#F7B500'] as const,
} as const;

export const fontFamily = {
  sansRegular: 'Poppins_400Regular',
  sansMedium: 'Poppins_500Medium',
  sansSemiBold: 'Poppins_600SemiBold',
  sansBold: 'Poppins_700Bold',
  arRegular: 'IBMPlexSansArabic_400Regular',
  arMedium: 'IBMPlexSansArabic_500Medium',
  arSemiBold: 'IBMPlexSansArabic_600SemiBold',
  arBold: 'IBMPlexSansArabic_700Bold',
} as const;

export const typography = {
  displayXL: { fontSize: 40, lineHeight: 48, family: fontFamily.sansBold },
  displayL: { fontSize: 32, lineHeight: 40, family: fontFamily.sansBold },
  heading1: { fontSize: 24, lineHeight: 32, family: fontFamily.sansBold },
  heading2: { fontSize: 18, lineHeight: 26, family: fontFamily.sansMedium },
  bodyL: { fontSize: 15, lineHeight: 22, family: fontFamily.sansRegular },
  bodyM: { fontSize: 13, lineHeight: 20, family: fontFamily.sansRegular },
  caption: { fontSize: 11, lineHeight: 16, family: fontFamily.sansMedium },
} as const;

export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0A1E5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#0A1E5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A1E5B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  cta: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
} as const;

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export type Palette = typeof palette;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Typography = typeof typography;
export type Gradients = typeof gradients;
