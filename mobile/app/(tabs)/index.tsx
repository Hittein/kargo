import { ScrollView, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Card, CircleIcon, GradientHero, Text } from '@/components/ui';
import { VehicleCard } from '@/components/VehicleCard';
import { useTheme } from '@/theme/ThemeProvider';
import { filterVehicles, VEHICLES } from '@/lib/mocks/vehicles';
import { useAuthStore } from '@/lib/stores/auth';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.name || 'Bienvenue').split(' ')[0];

  const actions: Array<{
    key: 'buy' | 'rent' | 'trip';
    photo: string;
    title: string;
    subtitle: string;
    bg: string;
    href: string;
  }> = [
    {
      key: 'buy',
      photo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=70',
      title: t('home.actions.buy'),
      subtitle: '10 voitures',
      bg: theme.color.primarySoft,
      href: '/marketplace/browse',
    },
    {
      key: 'rent',
      photo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&q=70',
      title: t('home.actions.rent'),
      subtitle: 'Courte & longue durée',
      bg: '#FFF4D6',
      href: '/rental/search',
    },
    {
      key: 'trip',
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=70',
      title: t('home.actions.trip'),
      subtitle: '6 villes MR',
      bg: '#DDECF5',
      href: '/transit',
    },
  ];

  const publishActions: Array<{
    key: 'sell' | 'rentOut';
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    badge: string;
    bg: string;
    accent: string;
    href: string;
  }> = [
    {
      key: 'sell',
      icon: 'cash',
      title: 'Vendre ma voiture',
      subtitle: 'Estimation IA + visibilité 30j',
      badge: 'GRATUIT',
      bg: '#FFF7E6',
      accent: '#F59E0B',
      href: '/marketplace/sell/vin',
    },
    {
      key: 'rentOut',
      icon: 'key',
      title: 'Mettre en location',
      subtitle: 'Gagnez jusqu\'à 80 000 MRU/mois',
      badge: 'PRO',
      bg: '#E0F2FE',
      accent: '#0284C7',
      href: '/rental/list-vehicle',
    },
  ];

  const suggestions = filterVehicles(VEHICLES, {}, 'recent').slice(0, 4);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 24 }}
      >
        <GradientHero preset="brand" radius="blob">
          <SafeAreaView edges={['top']}>
            <View style={{ padding: 24, paddingBottom: 36, gap: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text variant="caption" style={{ color: '#FFFFFFAA' }}>
                    {t('app.tagline')}
                  </Text>
                  <Text
                    variant="heading1"
                    weight="bold"
                    style={{ color: theme.color.textInverse, marginTop: 2 }}
                  >
                    {t('home.greeting', { name: firstName })}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/wallet')}
                  hitSlop={8}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="wallet" size={20} color={theme.color.textInverse} />
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.push('/marketplace/search')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  height: 56,
                  paddingLeft: 20,
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

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {actions.map((a) => (
              <Card
                key={a.key}
                radius="xl"
                padding={14}
                variant="flat"
                style={{
                  flex: 1,
                  backgroundColor: a.bg,
                  borderColor: 'transparent',
                  gap: 10,
                }}
                onPress={() => router.push(a.href as never)}
              >
                <Image
                  source={{ uri: a.photo }}
                  style={{ width: '100%', height: 72, borderRadius: 12 }}
                  contentFit="cover"
                  transition={150}
                />
                <View>
                  <Text variant="bodyL" weight="bold" numberOfLines={1}>
                    {a.title}
                  </Text>
                  <Text variant="caption" tone="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
                    {a.subtitle}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.color.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="megaphone" size={16} color={theme.color.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="heading2" weight="bold">
                Vous voulez vendre ou louer ?
              </Text>
              <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                Publiez votre annonce en quelques minutes.
              </Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {publishActions.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => router.push(a.href as never)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: theme.radius.xl,
                  backgroundColor: a.bg,
                  borderWidth: 1,
                  borderColor: a.accent + '33',
                  opacity: pressed ? 0.92 : 1,
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: a.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={a.icon} size={22} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text variant="bodyL" weight="bold">
                      {a.title}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                        backgroundColor: a.accent,
                      }}
                    >
                      <Text variant="caption" weight="bold" style={{ color: '#fff', fontSize: 10, letterSpacing: 0.4 }}>
                        {a.badge}
                      </Text>
                    </View>
                  </View>
                  <Text variant="caption" tone="secondary" style={{ marginTop: 3 }}>
                    {a.subtitle}
                  </Text>
                </View>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#FFFFFFCC',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="arrow-forward" size={16} color={a.accent} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>
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
                Tout voir
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
          >
            {suggestions.map((v) => (
              <View key={v.id} style={{ width: 220 }}>
                <VehicleCard vehicle={v} layout="grid" />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <Card variant="soft" radius="xl">
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <CircleIcon name="shield-checkmark" size={44} tone="success" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyL" weight="bold">
                  Kargo Trust
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                  Séquestre paiement, vérification VIN, inspection 80 points.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
