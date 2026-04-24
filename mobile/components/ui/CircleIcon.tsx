import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

export type CircleIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  iconSize?: number;
  color?: string;
  bg?: string;
  tone?: 'brand' | 'primary' | 'success' | 'danger' | 'neutral' | 'gold' | 'transit';
  style?: ViewStyle;
};

export function CircleIcon({
  name,
  size = 44,
  iconSize,
  color,
  bg,
  tone = 'neutral',
  style,
}: CircleIconProps) {
  const theme = useTheme();

  const palette = {
    brand: { bg: theme.color.brand + '22', fg: theme.color.brand },
    primary: { bg: theme.color.primary + '22', fg: theme.color.primary },
    success: { bg: theme.color.success + '22', fg: theme.color.success },
    danger: { bg: theme.color.danger + '22', fg: theme.color.danger },
    neutral: { bg: theme.color.bgElevated, fg: theme.color.text },
    gold: { bg: theme.color.accent + '22', fg: theme.color.accent },
    transit: { bg: theme.color.transit + '22', fg: theme.color.transit },
  }[tone];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg ?? palette.bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Ionicons name={name} size={iconSize ?? size * 0.45} color={color ?? palette.fg} />
    </View>
  );
}
