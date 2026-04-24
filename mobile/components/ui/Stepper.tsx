import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function Stepper({ current, total, label }: { current: number; total: number; label?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="caption" tone="secondary">
          {label} · {current}/{total}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i < current ? theme.color.primary : theme.color.divider,
            }}
          />
        ))}
      </View>
    </View>
  );
}
