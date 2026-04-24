import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { TIERS, tierFromPoints } from '@/lib/mocks/wallet';
import { useWalletStore } from '@/lib/stores/wallet';

export default function WalletLoyalty() {
  const theme = useTheme();
  const router = useRouter();
  const { points } = useWalletStore();
  const { current, next } = tierFromPoints(points);
  const progress = next
    ? Math.min(1, (points - current.minPoints) / (next.minPoints - current.minPoints))
    : 1;

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Ionicons name="chevron-back" size={26} color={theme.color.text} onPress={() => router.back()} />
        <Badge label="W-08" tone="neutral" />
      </View>

      <Card style={{ backgroundColor: current.color }}>
        <Text variant="caption" style={{ color: theme.color.textInverse, opacity: 0.8 }}>
          Kargo Points
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <Text variant="displayL" style={{ color: theme.color.textInverse }}>
            {points.toLocaleString('fr-FR')}
          </Text>
          <Text variant="bodyL" weight="semiBold" style={{ color: theme.color.textInverse, opacity: 0.9 }}>
            pts
          </Text>
        </View>
        <Text variant="bodyL" weight="semiBold" style={{ color: theme.color.textInverse, marginTop: 4 }}>
          Palier {current.label}
        </Text>
        <View
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.25)',
            marginTop: 14,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: theme.color.textInverse }} />
        </View>
        {next ? (
          <Text variant="caption" style={{ color: theme.color.textInverse, opacity: 0.85, marginTop: 8 }}>
            Plus que {(next.minPoints - points).toLocaleString('fr-FR')} points pour passer{' '}
            {next.label}
          </Text>
        ) : (
          <Text variant="caption" style={{ color: theme.color.textInverse, opacity: 0.85, marginTop: 8 }}>
            Vous avez atteint le palier maximum.
          </Text>
        )}
      </Card>

      <Text variant="heading2">Avantages du palier {current.label}</Text>
      <Card variant="sand">
        <View style={{ gap: 10 }}>
          {current.perks.map((p) => (
            <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="checkmark-circle" size={16} color={theme.color.success} />
              <Text variant="bodyM" style={{ flex: 1 }}>
                {p}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Text variant="heading2">Tous les paliers</Text>
      {TIERS.map((t) => {
        const unlocked = points >= t.minPoints;
        const isCurrent = t.key === current.key;
        return (
          <Card
            key={t.key}
            style={
              isCurrent
                ? { borderWidth: 2, borderColor: t.color }
                : undefined
            }
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: unlocked ? t.color : theme.color.bgElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={unlocked ? 'star' : 'lock-closed'}
                  size={18}
                  color={unlocked ? theme.color.textInverse : theme.color.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="bodyL" weight="semiBold">
                    {t.label}
                  </Text>
                  {isCurrent ? <Badge label="Actuel" tone="primary" /> : null}
                </View>
                <Text variant="caption" tone="secondary">
                  Dès {t.minPoints.toLocaleString('fr-FR')} pts
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                  {t.perks.join(' · ')}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
