import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = [
  { step: 1, label: 'Véhicule', route: '/marketplace/sell/vin' },
  { step: 2, label: 'Historique', route: '/marketplace/sell/history' },
  { step: 3, label: 'Prix', route: '/marketplace/sell/price' },
  { step: 4, label: 'Photos', route: '/marketplace/sell/photos' },
  { step: 5, label: 'Contact', route: '/marketplace/sell/contact' },
];

export function SellStepper({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 6,
        backgroundColor: theme.color.bgElevated,
      }}
    >
      {STEPS.map((s, i) => {
        const active = s.step === current;
        const done = s.step < current;
        const canTap = done;
        return (
          <View key={s.step} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              onPress={() => canTap && router.push(s.route as never)}
              hitSlop={6}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: active
                    ? theme.color.primary
                    : done
                      ? theme.color.success
                      : theme.color.bg,
                  borderWidth: active || done ? 0 : 1,
                  borderColor: theme.color.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color={theme.color.textInverse} />
                ) : (
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{ color: active ? theme.color.textInverse : theme.color.textSecondary }}
                  >
                    {s.step}
                  </Text>
                )}
              </View>
            </Pressable>
            {i < STEPS.length - 1 ? (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: done ? theme.color.success : theme.color.border,
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
