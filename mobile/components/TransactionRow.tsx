import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatMRU, formatRelativeDate } from '@/lib/format';
import type { Transaction } from '@/lib/mocks/wallet';
import { TX_META } from '@/lib/mocks/wallet';

export function TransactionRow({ tx }: { tx: Transaction }) {
  const theme = useTheme();
  const meta = TX_META[tx.type];
  const inflow = tx.amount > 0;
  const amountColor = inflow ? theme.color.success : theme.color.text;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: inflow ? theme.color.success + '22' : theme.color.bgElevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={meta.icon as React.ComponentProps<typeof Ionicons>['name']}
          size={18}
          color={inflow ? theme.color.success : theme.color.text}
        />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyL" weight="semiBold" numberOfLines={1}>
          {tx.counterparty}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="caption" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {meta.label} · {formatRelativeDate(tx.createdAt)}
          </Text>
          {tx.status === 'pending' ? (
            <Badge label="En attente" tone="gold" />
          ) : tx.status === 'failed' ? (
            <Badge label="Échouée" tone="danger" />
          ) : tx.status === 'refunded' ? (
            <Badge label="Remboursée" tone="neutral" />
          ) : null}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text variant="bodyL" weight="bold" style={{ color: amountColor }}>
          {inflow ? '+ ' : '- '}
          {formatMRU(Math.abs(tx.amount))}
        </Text>
        {tx.pointsEarned ? (
          <Text variant="caption" style={{ color: theme.color.accent }}>
            + {tx.pointsEarned} pts
          </Text>
        ) : null}
      </View>
    </View>
  );
}
