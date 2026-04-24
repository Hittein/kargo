import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'gold' | 'transit';

export type BadgeProps = {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const theme = useTheme();
  const palette = {
    neutral: { bg: theme.color.bgElevated, fg: theme.color.text },
    primary: { bg: theme.color.primary, fg: theme.color.textInverse },
    success: { bg: theme.color.success, fg: theme.color.textInverse },
    danger: { bg: theme.color.danger, fg: theme.color.textInverse },
    gold: { bg: theme.color.accent, fg: theme.color.textInverse },
    transit: { bg: theme.color.transit, fg: theme.color.textInverse },
  }[tone];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: palette.bg,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <Text variant="caption" weight="semiBold" style={{ color: palette.fg }}>
        {label}
      </Text>
    </View>
  );
}
