import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatKm, formatMRU } from '@/lib/format';
import {
  MY_LISTINGS,
  STATUS_LABEL,
  STATUS_TONE,
  type ListingStatus,
  type MyListing,
} from '@/lib/mocks/my-listings';
import { useSellStore } from '@/lib/stores/sell';

type Tab = 'active' | 'moderation' | 'draft' | 'sold' | 'rejected';

const TAB_STATUS: Record<Tab, ListingStatus> = {
  active: 'active',
  moderation: 'moderation',
  draft: 'draft',
  sold: 'sold',
  rejected: 'rejected',
};

export default function MyListings() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');

  const counts = useMemo(() => {
    const c: Record<ListingStatus, number> = {
      active: 0,
      draft: 0,
      moderation: 0,
      rejected: 0,
      sold: 0,
    };
    for (const l of MY_LISTINGS) c[l.status]++;
    return c;
  }, []);

  const list = useMemo(
    () => MY_LISTINGS.filter((l) => l.status === TAB_STATUS[tab]),
    [tab],
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Mes annonces
        </Text>
        <Badge label="A-13" tone="primary" />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <StatCard
            icon="eye"
            label="Vues"
            value={MY_LISTINGS.reduce((s, l) => s + l.views, 0).toLocaleString('fr-FR')}
          />
          <StatCard
            icon="chatbubbles"
            label="Leads"
            value={MY_LISTINGS.reduce((s, l) => s + l.leads, 0).toString()}
          />
          <StatCard
            icon="heart"
            label="Favoris"
            value={MY_LISTINGS.reduce((s, l) => s + l.favorites, 0).toString()}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {(
            [
              { key: 'active' as Tab, label: 'Actives', count: counts.active },
              { key: 'moderation' as Tab, label: 'Modération', count: counts.moderation },
              { key: 'draft' as Tab, label: 'Brouillons', count: counts.draft },
              { key: 'sold' as Tab, label: 'Vendues', count: counts.sold },
              { key: 'rejected' as Tab, label: 'Refusées', count: counts.rejected },
            ]
          ).map((t) => (
            <Chip
              key={t.key}
              label={`${t.label} · ${t.count}`}
              active={tab === t.key}
              tone="primary"
              onPress={() => setTab(t.key)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <ListingRow listing={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: 10, padding: 40 }}>
            <Ionicons name="pricetag-outline" size={40} color={theme.color.textSecondary} />
            <Text variant="bodyL" weight="semiBold">
              Aucune annonce
            </Text>
            <Button
              label="Publier une annonce"
              onPress={() => {
                useSellStore.getState().setMode('sell');
                router.push('/marketplace/sell/vin');
              }}
              leading={<Ionicons name="add" size={16} color={theme.color.textInverse} />}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <Card variant="sand" padding={12} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={18} color={theme.color.textSecondary} />
      <Text variant="bodyL" weight="bold">
        {value}
      </Text>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </Card>
  );
}

function ListingRow({ listing }: { listing: MyListing }) {
  const theme = useTheme();
  const router = useRouter();

  const isDraft = listing.status === 'draft';
  const onPress = isDraft
    ? () => {
        useSellStore.getState().setMode('sell');
        router.push('/marketplace/sell/vin');
      }
    : () => router.push(`/marketplace/${listing.id}` as never);

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 12,
            backgroundColor: theme.color.bgElevated,
            overflow: 'hidden',
          }}
        >
          {listing.photoUrl ? (
            <Image source={{ uri: listing.photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="image-outline" size={28} color={theme.color.textSecondary} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyL" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
              {listing.brand ? `${listing.brand} ${listing.model}` : 'Brouillon'}
            </Text>
            <Badge
              label={STATUS_LABEL[listing.status]}
              tone={STATUS_TONE[listing.status]}
            />
          </View>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {listing.year} · {listing.km ? formatKm(listing.km) : '—'} · {listing.city || '—'}
          </Text>
          {listing.price > 0 ? (
            <Text variant="bodyM" weight="bold" style={{ color: theme.color.primary }}>
              {formatMRU(listing.price)} MRU
            </Text>
          ) : null}

          {listing.status === 'active' ? (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <Stat icon="eye" v={listing.views} />
              <Stat icon="chatbubbles" v={listing.leads} />
              <Stat icon="heart" v={listing.favorites} />
            </View>
          ) : null}
          {listing.status === 'rejected' && listing.rejectReason ? (
            <Text variant="caption" tone="danger" numberOfLines={2}>
              {listing.rejectReason}
            </Text>
          ) : null}
          {listing.status === 'moderation' && listing.moderationStep ? (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {listing.moderationStep}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

function Stat({
  icon,
  v,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  v: number;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={12} color={theme.color.textSecondary} />
      <Text variant="caption" tone="secondary">
        {v.toLocaleString('fr-FR')}
      </Text>
    </View>
  );
}
