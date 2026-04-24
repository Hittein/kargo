import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card, CircleIcon, GradientHero, Text } from '@/components/ui';
import { TransactionRow } from '@/components/TransactionRow';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { monthlySummary, tierFromPoints } from '@/lib/mocks/wallet';
import { useWalletStore } from '@/lib/stores/wallet';

type Action = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
};

export default function WalletHome() {
  const theme = useTheme();
  const router = useRouter();
  const { balance, points, cardLast4, cardFrozen, balanceVisible, toggleBalance, transactions, hydrate } =
    useWalletStore();
  const { current, next } = tierFromPoints(points);
  const summary = monthlySummary();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const actions: Action[] = [
    { key: 'topup', icon: 'add-circle', label: 'Recharger', href: '/wallet/topup' },
    { key: 'transfer', icon: 'paper-plane', label: 'Envoyer', href: '/wallet/transfer' },
    { key: 'pay', icon: 'qr-code', label: 'Payer', href: '/wallet/transactions' },
    { key: 'withdraw', icon: 'cash', label: 'Retirer', href: '/wallet/transactions' },
  ];

  const latest = transactions.slice(0, 4);
  const progress = next
    ? Math.min(1, (points - current.minPoints) / (next.minPoints - current.minPoints))
    : 1;

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <GradientHero preset="brand" radius="blob">
          <SafeAreaView edges={['top']}>
            <View style={{ padding: 24, paddingBottom: 72, gap: 22 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Pressable
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                  hitSlop={8}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.color.textInverse} />
                </Pressable>
                <Pressable
                  onPress={() => router.push('/wallet/settings')}
                  hitSlop={8}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="settings-outline" size={18} color={theme.color.textInverse} />
                </Pressable>
              </View>

              <View>
                <Text variant="caption" style={{ color: '#FFFFFFAA' }}>
                  Kargo Wallet
                </Text>
                <Text
                  variant="heading1"
                  weight="bold"
                  style={{ color: theme.color.textInverse, marginTop: 2 }}
                >
                  Mon portefeuille
                </Text>
              </View>

              <View>
                <Text variant="caption" style={{ color: '#FFFFFFAA' }}>
                  Solde disponible
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
                  <Text
                    variant="displayXL"
                    weight="bold"
                    style={{ color: theme.color.textInverse }}
                  >
                    {balanceVisible ? formatMRU(balance) : '••••••'}
                  </Text>
                  <Pressable onPress={toggleBalance} hitSlop={10}>
                    <Ionicons
                      name={balanceVisible ? 'eye-off' : 'eye'}
                      size={22}
                      color={'#FFFFFFBB'}
                    />
                  </Pressable>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: theme.radius.pill,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <Ionicons name="card" size={12} color={theme.color.textInverse} />
                    <Text variant="caption" weight="semiBold" style={{ color: theme.color.textInverse }}>
                      •••• {cardLast4}
                    </Text>
                    {cardFrozen ? (
                      <Ionicons name="snow" size={12} color={'#FFFFFFBB'} />
                    ) : null}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: theme.radius.pill,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <Ionicons name="star" size={12} color={theme.color.accent} />
                    <Text variant="caption" weight="semiBold" style={{ color: theme.color.textInverse }}>
                      {current.label} · {points.toLocaleString('fr-FR')} pts
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </GradientHero>

        <View style={{ paddingHorizontal: 20, marginTop: -40, gap: 20 }}>
          <Card variant="elevated" radius="xl" padding={18}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {actions.map((a) => (
                <Pressable
                  key={a.key}
                  onPress={() => router.push(a.href as never)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    gap: 8,
                    opacity: pressed ? 0.85 : 1,
                    flex: 1,
                  })}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: theme.color.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={a.icon} size={22} color={theme.color.primary} />
                  </View>
                  <Text variant="caption" weight="semiBold" align="center">
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <Card onPress={() => router.push('/wallet/loyalty')} radius="xl">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: current.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="star" size={22} color={current.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text variant="bodyL" weight="bold">
                    {points.toLocaleString('fr-FR')} pts
                  </Text>
                  <Text variant="caption" tone="secondary">
                    · palier {current.label}
                  </Text>
                </View>
                {next ? (
                  <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    + {(next.minPoints - points).toLocaleString('fr-FR')} pts → {next.label}
                  </Text>
                ) : (
                  <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    Palier maximum
                  </Text>
                )}
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.color.bgElevated,
                    marginTop: 10,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${progress * 100}%`,
                      height: '100%',
                      backgroundColor: current.color,
                    }}
                  />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
            </View>
          </Card>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1 }} radius="lg" padding={16}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CircleIcon name="arrow-down" size={28} iconSize={14} tone="success" />
                <Text variant="caption" tone="secondary" weight="semiBold">
                  Entrées · avril
                </Text>
              </View>
              <Text variant="heading2" weight="bold" style={{ color: theme.color.success }}>
                + {formatMRU(summary.inflow)}
              </Text>
            </Card>
            <Card style={{ flex: 1 }} radius="lg" padding={16}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CircleIcon name="arrow-up" size={28} iconSize={14} tone="neutral" />
                <Text variant="caption" tone="secondary" weight="semiBold">
                  Sorties · avril
                </Text>
              </View>
              <Text variant="heading2" weight="bold">
                − {formatMRU(summary.outflow)}
              </Text>
            </Card>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text variant="heading2" weight="bold">
                Transactions récentes
              </Text>
              <Pressable onPress={() => router.push('/wallet/transactions')} hitSlop={6}>
                <Text variant="caption" weight="semiBold" style={{ color: theme.color.primary }}>
                  Tout voir
                </Text>
              </Pressable>
            </View>
            <Card radius="xl" padding={16}>
              {latest.map((tx, idx) => (
                <View key={tx.id}>
                  <TransactionRow tx={tx} />
                  {idx < latest.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: theme.color.divider }} />
                  ) : null}
                </View>
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
