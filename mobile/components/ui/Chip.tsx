import { Pressable, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  tone?: 'default' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

export function Chip({
  label,
  active,
  onPress,
  leading,
  trailing,
  tone = 'default',
  size = 'md',
  style,
}: ChipProps) {
  const theme = useTheme();

  const bg = active
    ? tone === 'primary'
      ? theme.color.primary
      : theme.color.chipActive
    : theme.color.chipBg;
  const fg = active ? theme.color.textInverse : theme.color.text;
  const border = active
    ? 'transparent'
    : theme.color.border;

  const heights = { sm: 32, md: 40 } as const;
  const paddings = { sm: 12, md: 16 } as const;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: heights[size],
          paddingHorizontal: paddings[size],
          borderRadius: theme.radius.pill,
          backgroundColor: bg,
          opacity: pressed ? 0.8 : 1,
          borderWidth: active ? 0 : 1,
          borderColor: border,
        },
        style,
      ]}
    >
      {leading ? <View>{leading}</View> : null}
      <Text variant="caption" weight="semiBold" style={{ color: fg }}>
        {label}
      </Text>
      {trailing ? <View>{trailing}</View> : null}
    </Pressable>
  );
}
