import { ScrollView, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GradientHero, Text } from '@/components/ui';
import { VehicleCard } from '@/components/VehicleCard';
import { useTheme } from '@/theme/ThemeProvider';
import { filterVehicles, VEHICLES } from '@/lib/mocks/vehicles';
import { TRIPS, getCity, getCompany, type Trip } from '@/lib/mocks/transit';
import { formatMRU } from '@/lib/format';
import { useAuthStore } from '@/lib/stores/auth';
import { useSellStore } from '@/lib/stores/sell';

const BUS_IMAGE =
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=70';

const ACTION_CARDS = [
  {
    key: 'buy' as const,
    title: 'Achat',
    subtitle: 'Voitures à vendre',
    countLabel: '210+ annonces',
    photo: require('@/assets/images/home/home-buy.png'),
    bg: '#FFECE0',
    iconBg: '#FFFFFF',
    accent: '#F97316',
    href: '/marketplace/browse',
    badgeIcon: 'bag-handle' as const,
  },
  {
    key: 'rent' as const,
    title: 'Location',
    subtitle: 'Voitures à louer',
    countLabel: '120+ véhicules',
    photo: require('@/assets/images/home/home-rent.png'),
    bg: '#E4ECFD',
    iconBg: '#FFFFFF',
    accent: '#2563EB',
    href: '/rental/search',
    badgeIcon: 'key' as const,
  },
  {
    key: 'trip' as const,
    title: 'Billet Bus',
    subtitle: 'Transports urbains',
    countLabel: '45+ trajets',
    photo: require('@/assets/images/home/home-transit.png'),
    bg: '#DCF6E7',
    iconBg: '#FFFFFF',
    accent: '#10B981',
    href: '/transit',
    badgeIcon: 'bus' as const,
  },
];

function fmtDepart(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (sameDay) return `Aujourd'hui · ${hh}:${mm}`;
  if (isTomorrow) return `Demain · ${hh}:${mm}`;
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · ${hh}:${mm}`;
}

function TripMiniCard({ trip }: { trip: Trip }) {
  const theme = useTheme();
  const router = useRouter();
  const from = getCity(trip.fromCityId)?.name ?? trip.fromCityId;
  const to = getCity(trip.toCityId)?.name ?? trip.toCityId;
  const company = getCompany(trip.companyId)?.name ?? '';
  return (
    <Pressable
      onPress={() => router.push(`/transit/${trip.id}` as never)}
      style={({ pressed }) => ({
        width: 220,
        backgroundColor: theme.color.card,
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.color.border,
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View style={{ height: 140, backgroundColor: '#F1F5F9' }}>
        <Image
          source={{ uri: BUS_IMAGE }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="heart-outline" size={16} color={theme.color.text} />
        </View>
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Text variant="bodyM" weight="semiBold" numberOfLines={1}>
          {company}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="caption" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
            {from} → {to}
          </Text>
        </View>
        <Text variant="bodyM" weight="bold" style={{ color: theme.color.primary }}>
          {formatMRU(trip.price)} MRU
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={12} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary">
            {fmtDepart(trip.departure)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setSellMode = useSellStore((s) => s.setMode);
  const firstName = (user?.name || 'Bienvenue').split(' ')[0];

  const popular = filterVehicles(VEHICLES, {}, 'recent').slice(0, 6);
  const suggestionsMix = [
    { type: 'vehicle' as const, item: popular[0] },
    { type: 'trip' as const, item: TRIPS[0] },
    { type: 'vehicle' as const, item: popular[1] },
    { type: 'trip' as const, item: TRIPS[1] },
    { type: 'vehicle' as const, item: popular[2] },
  ].filter((e) => !!e.item);

  const onPublishAction = (key: 'sell' | 'rentOut') => {
    if (key === 'sell') {
      setSellMode('sell');
      router.push('/marketplace/sell/vin');
    } else {
      router.push('/rental/list-vehicle');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 18 }}
      >
        <GradientHero preset="brand" radius="blob">
          <SafeAreaView edges={['top']}>
            <View style={{ padding: 24, paddingBottom: 36, gap: 18 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    variant="heading1"
                    weight="bold"
                    style={{ color: theme.color.textInverse, fontSize: 28 }}
                  >
                    {t('home.greeting', { name: firstName })} 👋
                  </Text>
                  <Text variant="bodyM" style={{ color: '#FFFFFFCC', marginTop: 4 }}>
                    {t('home.tagline')}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/wallet' as never)}
                  hitSlop={8}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.16)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="notifications-outline" size={20} color={theme.color.textInverse} />
                  <View
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      paddingHorizontal: 4,
                      backgroundColor: theme.color.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(30,30,90,1)',
                    }}
                  >
                    <Text variant="caption" weight="bold" style={{ color: '#fff', fontSize: 10 }}>
                      3
                    </Text>
                  </View>
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.push('/marketplace/search')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  height: 56,
                  paddingLeft: 18,
                  paddingRight: 8,
                  backgroundColor: theme.color.card,
                  borderRadius: theme.radius.pill,
                  ...theme.shadow.md,
                  opacity: pressed ? 0.95 : 1,
                })}
              >
                <Ionicons name="search" size={18} color={theme.color.textSecondary} />
                <Text variant="bodyL" tone="secondary" style={{ flex: 1 }}>
                  {t('home.searchPlaceholder')}
                </Text>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.color.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...theme.shadow.cta,
                  }}
                >
                  <Ionicons name="mic" size={18} color={theme.color.textInverse} />
                </View>
              </Pressable>
            </View>
          </SafeAreaView>
        </GradientHero>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {ACTION_CARDS.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => router.push(a.href as never)}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: a.bg,
                  borderRadius: 20,
                  padding: 12,
                  gap: 10,
                  minHeight: 220,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: a.iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={a.badgeIcon} size={18} color={a.accent} />
                </View>
                <View
                  style={{
                    height: 88,
                    borderRadius: 14,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Image
                    source={a.photo}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                    transition={200}
                  />
                </View>
                <View style={{ gap: 2 }}>
                  <Text variant="bodyL" weight="bold" numberOfLines={1}>
                    {a.title}
                  </Text>
                  <Text variant="caption" tone="secondary" numberOfLines={1}>
                    {a.subtitle}
                  </Text>
                </View>
                <View
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{ color: a.accent, fontSize: 11 }}
                    numberOfLines={1}
                  >
                    {a.countLabel}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: theme.color.card,
              borderRadius: 20,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: theme.color.border,
            }}
          >
            <Pressable
              onPress={() => onPublishAction('sell')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FFECE0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="megaphone" size={18} color={theme.color.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight="bold">
                  {t('home.publishTitle')}
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                  {t('home.publishSubtitle')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
            </Pressable>

            <Pressable
              onPress={() => onPublishAction('sell')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: '#FFECE0',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons name="car" size={18} color={theme.color.primary} />
              <Text
                variant="bodyM"
                weight="semiBold"
                style={{ flex: 1, color: theme.color.primary }}
              >
                {t('home.sellAction')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.color.primary} />
            </Pressable>

            <Pressable
              onPress={() => onPublishAction('rentOut')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: '#E4ECFD',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons name="key" size={18} color="#2563EB" />
              <Text variant="bodyM" weight="semiBold" style={{ flex: 1, color: '#2563EB' }}>
                {t('home.rentOutAction')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="heading2" weight="bold">
              Voitures populaires
            </Text>
            <Pressable onPress={() => router.push('/marketplace/search')} hitSlop={6}>
              <Text variant="caption" weight="semiBold" style={{ color: theme.color.primary }}>
                {t('home.seeAll')}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 16 }}
          >
            {popular.map((v) => (
              <View key={v.id} style={{ width: 180 }}>
                <VehicleCard vehicle={v} layout="grid" />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="heading2" weight="bold">
              {t('home.suggestions')}
            </Text>
            <Pressable onPress={() => router.push('/marketplace/search')} hitSlop={6}>
              <Text variant="caption" weight="semiBold" style={{ color: theme.color.primary }}>
                {t('home.seeAll')}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 16 }}
          >
            {suggestionsMix.map((s, i) =>
              s.type === 'vehicle' ? (
                <View key={`v-${s.item.id}-${i}`} style={{ width: 220 }}>
                  <VehicleCard vehicle={s.item} layout="grid" />
                </View>
              ) : (
                <TripMiniCard key={`t-${s.item.id}-${i}`} trip={s.item} />
              ),
            )}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Pressable
            onPress={() => router.push('/transit' as never)}
            style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
          >
            <GradientHero preset="brand" radius="xxl">
              <View
                style={{
                  flexDirection: 'row',
                  padding: 20,
                  alignItems: 'center',
                  minHeight: 140,
                }}
              >
                <View style={{ flex: 1, gap: 8 }}>
                  <Text variant="heading2" weight="bold" style={{ color: theme.color.textInverse }}>
                    {t('home.transitCtaTitle')}
                  </Text>
                  <Text variant="caption" style={{ color: '#FFFFFFCC' }}>
                    {t('home.transitCtaSubtitle')}
                  </Text>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: theme.color.primary,
                      marginTop: 6,
                    }}
                  >
                    <Text variant="bodyM" weight="bold" style={{ color: theme.color.textInverse }}>
                      {t('home.transitCtaButton')}
                    </Text>
                  </View>
                </View>
                <Image
                  source={{ uri: BUS_IMAGE }}
                  style={{ width: 140, height: 100 }}
                  contentFit="contain"
                  transition={150}
                />
              </View>
            </GradientHero>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
