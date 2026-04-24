import { useMemo } from 'react';
import { SectionList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Chip, Input, Text } from '@/components/ui';
import { TransactionRow } from '@/components/TransactionRow';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { TX_META } from '@/lib/mocks/wallet';
import { useWalletStore } from '@/lib/stores/wallet';

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date('2026-04-23T00:00:00Z');
  const diff = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

export default function WalletTransactions() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { txFilter, txQuery, setTxFilter, setTxQuery, transactions } = useWalletStore();

  const sections = useMemo(() => {
    const q = txQuery.trim().toLowerCase();
    const filtered = transactions.filter((tx) => {
      if (txFilter === 'in' && tx.amount <= 0) return false;
      if (txFilter === 'out' && tx.amount >= 0) return false;
      if (!q) return true;
      const hay = `${tx.counterparty} ${tx.note ?? ''} ${TX_META[tx.type].label}`.toLowerCase();
      return hay.includes(q);
    });

    const groups = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const k = dayKey(tx.createdAt);
      const existing = groups.get(k) ?? [];
      existing.push(tx);
      groups.set(k, existing);
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([k, data]) => ({
        title: formatDayLabel(k + 'T00:00:00Z'),
        data,
      }));
  }, [txFilter, txQuery, transactions]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.color.text}
            onPress={() => router.back()}
          />
          <Text variant="heading2" style={{ flex: 1 }}>
            Transactions
          </Text>
          <Badge label="W-02" tone="neutral" />
        </View>
        <Input
          value={txQuery}
          onChangeText={setTxQuery}
          placeholder="Rechercher une transaction…"
          leading={<Ionicons name="search" size={18} color={theme.color.textSecondary} />}
          trailing={
            txQuery ? (
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.color.textSecondary}
                onPress={() => setTxQuery('')}
              />
            ) : null
          }
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Toutes" active={txFilter === 'all'} onPress={() => setTxFilter('all')} tone="primary" />
          <Chip label="Entrées" active={txFilter === 'in'} onPress={() => setTxFilter('in')} tone="primary" />
          <Chip label="Sorties" active={txFilter === 'out'} onPress={() => setTxFilter('out')} tone="primary" />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(tx) => tx.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12, gap: 4 }}
        renderItem={({ item }) => (
          <View
            style={{
              paddingHorizontal: 12,
              backgroundColor: theme.color.card,
            }}
          >
            <TransactionRow tx={item} />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <Text
            variant="caption"
            tone="secondary"
            weight="semiBold"
            style={{ paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase' }}
          >
            {section.title}
          </Text>
        )}
        renderSectionFooter={() => <View style={{ height: 8 }} />}
        SectionSeparatorComponent={() => null}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.color.divider, marginHorizontal: 12 }} />
        )}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32, gap: 8 }}>
            <Ionicons name="receipt" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucune transaction
            </Text>
            <Text variant="bodyM" tone="secondary" align="center">
              Essayez un autre filtre ou une autre recherche.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
