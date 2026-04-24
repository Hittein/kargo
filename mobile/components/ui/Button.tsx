import { ActivityIndicator, Pressable, PressableProps, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'inverse';
type Size = 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
};

const SIZE: Record<Size, { height: number; paddingX: number; fontVariant: 'bodyM' | 'bodyL' | 'heading2' }> = {
  sm: { height: 40, paddingX: 16, fontVariant: 'bodyM' },
  md: { height: 48, paddingX: 20, fontVariant: 'bodyL' },
  lg: { height: 56, paddingX: 24, fontVariant: 'bodyL' },
  xl: { height: 64, paddingX: 28, fontVariant: 'heading2' },
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading,
  disabled,
  fullWidth,
  leading,
  trailing,
  haptic = true,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const sz = SIZE[size];
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      bg: theme.color.primary,
      bgPressed: theme.color.primaryDeep,
      text: theme.color.textInverse,
      border: 'transparent',
      shadow: theme.shadow.cta,
    },
    secondary: {
      bg: theme.color.card,
      bgPressed: theme.color.bgElevated,
      text: theme.color.text,
      border: theme.color.border,
      shadow: theme.shadow.sm,
    },
    ghost: {
      bg: 'transparent',
      bgPressed: theme.color.bgElevated,
      text: theme.color.primary,
      border: 'transparent',
      shadow: theme.shadow.none,
    },
    destructive: {
      bg: theme.color.danger,
      bgPressed: '#E0526A',
      text: theme.color.textInverse,
      border: 'transparent',
      shadow: theme.shadow.md,
    },
    inverse: {
      bg: theme.color.text,
      bgPressed: theme.color.brand,
      text: theme.color.bg,
      border: 'transparent',
      shadow: theme.shadow.md,
    },
  }[variant];

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={({ pressed }) => [
        {
          height: sz.height,
          paddingHorizontal: sz.paddingX,
          borderRadius: theme.radius.pill,
          backgroundColor: pressed ? palette.bgPressed : palette.bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: palette.border,
          opacity: isDisabled ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: fullWidth ? 'stretch' : 'auto',
          gap: 10,
          ...(!isDisabled && variant !== 'ghost' ? palette.shadow : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text variant={sz.fontVariant} weight="semiBold" style={{ color: palette.text }}>
            {label}
          </Text>
          {trailing ? <View>{trailing}</View> : null}
        </>
      )}
    </Pressable>
  );
}
