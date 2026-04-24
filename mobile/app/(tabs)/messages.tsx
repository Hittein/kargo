import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Screen, SegmentedTabs, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useMessagingStore, type ChatThread, type MessageContext } from '@/lib/stores/messaging';
import { formatRelativeDate } from '@/lib/format';

type Tab = 'all' | 'listing' | 'rental' | 'trip' | 'support';

export default function MessagesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const threads = useMessagingStore((s) => s.threads);
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (tab === 'all') return threads;
    return threads.filter((t) => t.context.kind === tab);
  }, [threads, tab]);

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="heading1">Messages</Text>
        <Badge label="M-01" tone="neutral" />
      </View>

      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { key: 'all', label: `Tous (${threads.length})` },
          { key: 'listing', label: 'Annonces' },
          { key: 'rental', label: 'Locations' },
          { key: 'trip', label: 'Trajets' },
          { key: 'support', label: 'Support' },
        ]}
      />

      <View style={{ gap: 8 }}>
        {filtered.length === 0 ? (
          <Card variant="sand">
            <View style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
              <Ionicons name="chatbubbles-outline" size={36} color={theme.color.textSecondary} />
              <Text variant="bodyM" tone="secondary">
                Aucune conversation pour ce filtre.
              </Text>
            </View>
          </Card>
        ) : (
          filtered.map((t) => <ThreadRow key={t.id} thread={t} onPress={() => router.push(`/chat/${t.id}`)} />)
        )}
      </View>
    </Screen>
  );
}

function ThreadRow({ thread, onPress }: { thread: ChatThread; onPress: () => void }) {
  const theme = useTheme();
  const initial = thread.partnerName.slice(0, 1).toUpperCase();
  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: ctxColor(thread.context, theme),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="bodyL" weight="bold" style={{ color: theme.color.textInverse }}>
            {initial}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }} numberOfLines={1}>
              {thread.partnerName}
            </Text>
            {thread.partnerVerified ? (
              <Ionicons name="shield-checkmark" size={14} color={theme.color.success} />
            ) : null}
            <Text variant="caption" tone="secondary">
              {formatRelativeDate(thread.lastAt)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Badge label={ctxLabel(thread.context)} tone="neutral" />
            <Text variant="caption" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
              {thread.lastMessage || '—'}
            </Text>
            {thread.unread > 0 ? (
              <View
                style={{
                  minWidth: 22,
                  height: 22,
                  paddingHorizontal: 6,
                  borderRadius: 11,
                  backgroundColor: theme.color.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="caption" weight="bold" style={{ color: theme.color.textInverse }}>
                  {thread.unread}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

function ctxColor(ctx: MessageContext, theme: ReturnType<typeof useTheme>) {
  if (ctx.kind === 'listing') return theme.color.primary;
  if (ctx.kind === 'rental') return theme.color.accent;
  if (ctx.kind === 'trip') return theme.color.transit;
  return theme.color.textSecondary;
}

function ctxLabel(ctx: MessageContext) {
  return { listing: 'Annonce', rental: 'Location', trip: 'Trajet', support: 'Support' }[ctx.kind];
}
