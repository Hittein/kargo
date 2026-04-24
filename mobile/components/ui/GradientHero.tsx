import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

type Preset = 'brand' | 'ink' | 'sunset';

export type GradientHeroProps = {
  preset?: Preset;
  colors?: [string, string, ...string[]];
  height?: number | 'auto';
  radius?: 'none' | 'lg' | 'xl' | 'xxl' | 'blob';
  children?: React.ReactNode;
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

/**
 * Hero coloré avec gradient pour les écrans marquants (Home, T-01, W-01).
 * Coin bas arrondi "blob" pour l'effet vague douce des refs.
 */
export function GradientHero({
  preset = 'brand',
  colors,
  height = 'auto',
  radius = 'blob',
  children,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientHeroProps) {
  const theme = useTheme();
  const stops = (colors ?? (theme.gradients[preset] as unknown as [string, string, ...string[]]));

  const borderRadiusStyle: ViewStyle =
    radius === 'none'
      ? {}
      : radius === 'blob'
        ? {
            borderBottomLeftRadius: theme.radius.xxl,
            borderBottomRightRadius: theme.radius.xxl,
          }
        : {
            borderRadius: theme.radius[radius],
          };

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          ...(height !== 'auto' ? { height } : {}),
        },
        borderRadiusStyle,
        style,
      ]}
    >
      <LinearGradient colors={stops} start={start} end={end} style={{ flex: 1 }}>
        {children}
      </LinearGradient>
    </View>
  );
}
