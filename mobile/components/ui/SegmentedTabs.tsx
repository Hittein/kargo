import { Pressable, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type SegmentedTabItem<K extends string = string> = {
  key: K;
  label: string;
  count?: number;
};

export type SegmentedTabsProps<K extends string = string> = {
  items: SegmentedTabItem<K>[];
  value: K;
  onChange: (k: K) => void;
  variant?: 'dot' | 'pill';
  style?: ViewStyle;
};

/**
 * Tabs segmentés — deux styles :
 * - `dot` : soulignement + point sous l'onglet actif (image 5)
 * - `pill` : pill noir fill sur l'actif, outline sur les autres (image 4)
 */
export function SegmentedTabs<K extends string = string>({
  items,
  value,
  onChange,
  variant = 'dot',
  style,
}: SegmentedTabsProps<K>) {
  const theme = useTheme();

  if (variant === 'pill') {
    return (
      <View style={[{ flexDirection: 'row', gap: 8 }, style]}>
        {items.map((it) => {
          const active = it.key === value;
          return (
            <Pressable
              key={it.key}
              onPress={() => onChange(it.key)}
              style={({ pressed }) => ({
                flex: 1,
                height: 44,
                borderRadius: theme.radius.pill,
                backgroundColor: active ? theme.color.chipActive : theme.color.chipBg,
                borderWidth: active ? 0 : 1,
                borderColor: theme.color.border,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                variant="bodyM"
                weight="semiBold"
                style={{ color: active ? theme.color.textInverse : theme.color.text }}
              >
                {it.label}
              </Text>
              {it.count != null ? (
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{ color: active ? theme.color.textInverse : theme.color.textSecondary, opacity: 0.85 }}
                >
                  · {it.count}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[{ flexDirection: 'row', gap: 24 }, style]}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            style={({ pressed }) => ({
              alignItems: 'center',
              gap: 6,
              paddingVertical: 6,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              variant="bodyL"
              weight={active ? 'bold' : 'medium'}
              style={{ color: active ? theme.color.text : theme.color.textSecondary }}
            >
              {it.label}
              {it.count != null ? (
                <Text variant="caption" tone="secondary">
                  {'  '}
                  {it.count}
                </Text>
              ) : null}
            </Text>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: active ? theme.color.primary : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
