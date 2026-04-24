import { Pressable, PressableProps, View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'default' | 'elevated' | 'flat' | 'sand' | 'soft';

export type CardProps = ViewProps & {
  variant?: Variant;
  padding?: number;
  radius?: 'md' | 'lg' | 'xl' | 'xxl';
  onPress?: PressableProps['onPress'];
  style?: ViewStyle;
};

export function Card({
  variant = 'default',
  padding = 20,
  radius = 'xl',
  onPress,
  style,
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    backgroundColor:
      variant === 'sand'
        ? theme.color.surface
        : variant === 'soft'
          ? theme.color.surfaceSoft
          : theme.color.card,
    borderRadius: theme.radius[radius],
    padding,
    ...(variant === 'elevated'
      ? theme.shadow.md
      : variant === 'flat'
        ? theme.shadow.none
        : theme.shadow.sm),
    ...(variant === 'flat' ? { borderWidth: 1, borderColor: theme.color.border } : null),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [baseStyle, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...rest} style={[baseStyle, style]}>
      {children}
    </View>
  );
}
