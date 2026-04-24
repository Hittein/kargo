import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useNotificationsStore, type Notif, type NotifCategory } from '@/lib/stores/notifications';
import { formatRelativeDate } from '@/lib/format';

const CAT_META: Record<NotifCategory, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  message: { label: 'Messages', icon: 'chatbubbles', color: '#6366F1' },
  transit: { label: 'Transport', icon: 'bus', color: '#0EA5E9' },
  rental: { label: 'Locations', icon: 'key', color: '#F59E0B' },
  marketplace: { label: 'Annonces', icon: 'pricetag', color: '#FB7185' },
  wallet: { label: 'Wallet', icon: 'wallet', color: '#10B981' },
  trust: { label: 'Trust', icon: 'shield-checkmark', color: '#7C3AED' },
  promo: { label: 'Promo', icon: 'gift', color: '#F7B500' },
  system: { label: 'Système', icon: 'information-circle', color: '#94A3B8' },
};

type Filter = 'all' | 'unread' | 'archived' | NotifCategory;

export default function NotificationsCenter() {
  const theme = useTheme();
  const router = useRouter();
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const archive = useNotificationsStore((s) => s.archive);
  const remove = useNotificationsStore((s) => s.remove);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'all') return !n.archived;
      if (filter === 'unread') return !n.read && !n.archived;
      if (filter === 'archived') return n.archived;
      return n.category === filter && !n.archived;
    });
  }, [items, filter]);

  return (
    <Screen scroll>
      <BackHeader
        title="Notifications"
        code="M-03"
        trailing={
          <Pressable onPress={() => router.push('/notifications/preferences')} hitSlop={12}>
            <Ionicons name="options" size={22} color={theme.color.textSecondary} />
          </Pressable>
        }
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {(['all', 'unread', 'archived'] as Filter[]).map((f) => (
          <FilterPill key={f} label={labelFor(f)} active={filter === f} onPress={() => setFilter(f)} />
        ))}
        {(Object.keys(CAT_META) as NotifCategory[]).map((c) => (
          <FilterPill key={c} label={CAT_META[c].label} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </View>

      {filter === 'all' || filter === 'unread' ? (
        <Button label="Tout marquer comme lu" variant="ghost" size="sm" onPress={markAllRead} />
      ) : null}

      <View style={{ gap: 8 }}>
        {filtered.length === 0 ? (
          <Card variant="sand">
            <View style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
              <Ionicons name="notifications-off" size={32} color={theme.color.textSecondary} />
              <Text variant="bodyM" tone="secondary">
                Rien à afficher.
              </Text>
            </View>
          </Card>
        ) : (
          filtered.map((n) => (
            <NotifRow
              key={n.id}
              notif={n}
              onPress={() => {
                markRead(n.id);
                if (n.href) router.push(n.href as never);
              }}
              onLongPress={() =>
                Alert.alert(n.title, undefined, [
                  { text: 'Marquer comme lu', onPress: () => markRead(n.id) },
                  { text: 'Archiver', onPress: () => archive(n.id) },
                  { text: 'Supprimer', style: 'destructive', onPress: () => remove(n.id) },
                  { text: 'Annuler', style: 'cancel' },
                ])
              }
            />
          ))
        )}
      </View>
    </Screen>
  );
}

function NotifRow({ notif, onPress, onLongPress }: { notif: Notif; onPress: () => void; onLongPress: () => void }) {
  const theme = useTheme();
  const meta = CAT_META[notif.category];
  return (
    <Card padding={14} onPress={onPress}>
      <Pressable onLongPress={onLongPress} delayLongPress={250} style={{ flexDirection: 'row', gap: 12 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: meta.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={meta.icon} size={18} color={theme.color.textInverse} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }} numberOfLines={1}>
              {notif.title}
            </Text>
            {!notif.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.color.primary }} /> : null}
            <Text variant="caption" tone="secondary">
              {formatRelativeDate(notif.createdAt)}
            </Text>
          </View>
          <Text variant="bodyM" tone="secondary" numberOfLines={2}>
            {notif.body}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
      }}
    >
      <Text variant="caption" weight="semiBold" style={{ color: active ? theme.color.textInverse : theme.color.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function labelFor(f: Filter): string {
  if (f === 'all') return 'Tous';
  if (f === 'unread') return 'Non lus';
  if (f === 'archived') return 'Archivés';
  return CAT_META[f as NotifCategory].label;
}
