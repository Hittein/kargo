import { ScrollView, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Card, GradientHero, Text } from '@/components/ui';
import { VehicleCard } from '@/components/VehicleCard';
import { useTheme } from '@/theme/ThemeProvider';
import { filterVehicles, VEHICLES } from '@/lib/mocks/vehicles';
import { useAuthStore } from '@/lib/stores/auth';
import { useSellStore } from '@/lib/stores/sell';

const ACTION_CARDS = [
  {
    key: 'buy' as const,
    title: 'Achat',
    subtitle: 'Voitures',
    count: '210+',
    photo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&q=70',
    icon: 'car' as const,
    bg: '#FFECE0',
    accent: '#F97316',
    href: '/marketplace/browse',
  },
  {
    key: 'rent' as const,
    title: 'Location',
    subtitle: 'Voitures',
    count: '120+',
    photo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&q=70',
    icon: 'key' as const,
    bg: '#E4ECFD',
    accent: '#2563EB',
    href: '/rental/search',
  },
  {
    key: 'trip' as const,
    title: 'Billet Bus',
    subtitle: 'Transports',
    count: '45+',
    photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=70',
    icon: 'bus' as const,
    bg: '#DCF6E7',
    accent: '#10B981',
    href: '/transit',
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setSellMode = useSellStore((s) => s.setMode);
  const firstName = (user?.name || 'Bienvenue').split(' ')[0];

  const suggestions = filterVehicles(VEHICLES, {}, 'recent').slice(0, 5);

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
                  <Text
                    variant="bodyM"
                    style={{ color: '#FFFFFFCC', marginTop: 4 }}
                  >
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
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: a.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={a.icon} size={16} color="#fff" />
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={a.accent} />
                </View>
                <Image
                  source={{ uri: a.photo }}
                  style={{ width: '100%', height: 64 }}
                  contentFit="contain"
                  transition={150}
                />
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
                    alignSelf: 'stretch',
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" weight="bold" style={{ color: a.accent }}>
                    {a.count}
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
              gap: 14,
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
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFECE0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="key" size={20} color={theme.color.primary} />
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

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => onPublishAction('sell')}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: '#FFECE0',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Ionicons name="car" size={16} color={theme.color.primary} />
                <Text variant="bodyM" weight="semiBold" style={{ color: theme.color.primary }}>
                  {t('home.sellAction')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onPublishAction('rentOut')}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: '#E4ECFD',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Ionicons name="key" size={16} color="#2563EB" />
                <Text variant="bodyM" weight="semiBold" style={{ color: '#2563EB' }}>
                  {t('home.rentOutAction')}
                </Text>
              </Pressable>
            </View>
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
            {suggestions.map((v) => (
              <View key={v.id} style={{ width: 220 }}>
                <VehicleCard vehicle={v} layout="grid" />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Pressable
            onPress={() => router.push('/transit' as never)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.95 : 1,
            })}
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
                  <Text
                    variant="heading2"
                    weight="bold"
                    style={{ color: theme.color.textInverse }}
                  >
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
                  source={{
                    uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=70',
                  }}
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
