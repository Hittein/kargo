import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, CircleIcon, GradientHero, Text } from '@/components/ui';
import { CityPickerModal } from '@/components/CityPickerModal';
import { useTheme } from '@/theme/ThemeProvider';
import { addDaysIso, formatDateShort, sameDay } from '@/lib/time';
import { getCity, type City } from '@/lib/mocks/transit';
import { useTransitStore } from '@/lib/stores/transit';

export default function TransitHome() {
  const theme = useTheme();
  const router = useRouter();
  const store = useTransitStore();
  const [picker, setPicker] = useState<null | 'from' | 'to'>(null);

  const fromCity = store.fromCityId ? getCity(store.fromCityId) : undefined;
  const toCity = store.toCityId ? getCity(store.toCityId) : undefined;

  const today = '2026-04-24T00:00:00.000Z';
  const tomorrow = addDaysIso(today, 1);
  const afterTomorrow = addDaysIso(today, 2);

  const canSearch = !!fromCity && !!toCity;

  const onSubmit = () => {
    if (!canSearch) return;
    store.pushRecent();
    router.push('/transit/results');
  };

  const handlePickSelect = (city: City) => {
    if (picker === 'from') store.setFrom(city.id);
    if (picker === 'to') store.setTo(city.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <GradientHero preset="brand" radius="blob">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=70',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.18,
            }}
            contentFit="cover"
          />
          <BusSilhouettes />
          <SafeAreaView edges={['top']}>
            <View style={{ padding: 24, paddingBottom: 72, gap: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Ionicons name="chevron-back" size={20} color={theme.color.textInverse} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => router.push('/(tabs)/tickets')}
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
                  <Ionicons name="ticket" size={18} color={theme.color.textInverse} />
                </Pressable>
              </View>

              <View>
                <Text variant="caption" style={{ color: '#FFFFFFAA' }}>
                  Transport
                </Text>
                <Text
                  variant="displayL"
                  weight="bold"
                  style={{ color: theme.color.textInverse, marginTop: 4 }}
                >
                  Où allez-vous{'\n'}aujourd'hui ?
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </GradientHero>

        <View style={{ paddingHorizontal: 20, marginTop: -56, gap: 16 }}>
          <Card variant="elevated" radius="xl" padding={20}>
            <View style={{ gap: 4 }}>
              <FieldRow
                icon="radio-button-on"
                iconColor={theme.color.primary}
                label="Départ"
                value={fromCity?.name ?? 'Sélectionner une ville'}
                onPress={() => setPicker('from')}
                placeholder={!fromCity}
              />
              <View
                style={{
                  height: 1,
                  backgroundColor: theme.color.divider,
                  marginLeft: 40,
                  marginVertical: 4,
                }}
              />
              <View style={{ position: 'relative' }}>
                <FieldRow
                  icon="location"
                  iconColor={theme.color.brand}
                  label="Destination"
                  value={toCity?.name ?? 'Sélectionner une ville'}
                  onPress={() => setPicker('to')}
                  placeholder={!toCity}
                />
                <Pressable
                  onPress={() => store.swap()}
                  hitSlop={10}
                  style={{
                    position: 'absolute',
                    right: -2,
                    top: -32,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.color.card,
                    borderWidth: 1,
                    borderColor: theme.color.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...theme.shadow.sm,
                  }}
                >
                  <Ionicons name="swap-vertical" size={18} color={theme.color.text} />
                </Pressable>
              </View>
            </View>
          </Card>

          <Card variant="default" radius="xl" padding={18}>
            <Text variant="caption" tone="secondary" weight="semiBold" style={{ marginBottom: 10 }}>
              DATE
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                { label: "Aujourd'hui", iso: today },
                { label: 'Demain', iso: tomorrow },
                { label: formatDateShort(afterTomorrow), iso: afterTomorrow },
                { label: formatDateShort(addDaysIso(today, 3)), iso: addDaysIso(today, 3) },
                { label: formatDateShort(addDaysIso(today, 4)), iso: addDaysIso(today, 4) },
              ].map((d) => {
                const active = sameDay(store.date, d.iso);
                return (
                  <Pressable
                    key={d.iso}
                    onPress={() => store.setDate(d.iso)}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      borderRadius: theme.radius.pill,
                      backgroundColor: active ? theme.color.chipActive : theme.color.chipBg,
                      borderWidth: active ? 0 : 1,
                      borderColor: theme.color.border,
                    }}
                  >
                    <Text
                      variant="bodyM"
                      weight="semiBold"
                      style={{ color: active ? theme.color.textInverse : theme.color.text }}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                marginTop: 18,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: theme.color.divider,
              }}
            >
              <CircleIcon name="people" size={36} tone="brand" />
              <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }}>
                Passagers
              </Text>
              <Pressable
                onPress={() => store.setPassengers(store.passengers - 1)}
                hitSlop={8}
                style={stepperBtn(theme)}
              >
                <Ionicons name="remove" size={16} color={theme.color.text} />
              </Pressable>
              <Text variant="bodyL" weight="bold" style={{ minWidth: 24, textAlign: 'center' }}>
                {store.passengers}
              </Text>
              <Pressable
                onPress={() => store.setPassengers(store.passengers + 1)}
                hitSlop={8}
                style={stepperBtn(theme)}
              >
                <Ionicons name="add" size={16} color={theme.color.text} />
              </Pressable>
            </View>
          </Card>

          <Button
            label="Rechercher des trajets"
            fullWidth
            size="lg"
            disabled={!canSearch}
            trailing={<Ionicons name="arrow-forward" size={18} color={theme.color.textInverse} />}
            onPress={onSubmit}
          />

          {store.recentSearches.length ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Text variant="heading2" weight="bold">
                Recherches récentes
              </Text>
              {store.recentSearches.slice(0, 3).map((r, idx) => {
                const f = getCity(r.fromCityId);
                const t = getCity(r.toCityId);
                return (
                  <Card
                    key={idx}
                    onPress={() => {
                      store.setFrom(r.fromCityId);
                      store.setTo(r.toCityId);
                    }}
                    radius="lg"
                    padding={14}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <CircleIcon name="time" size={40} tone="neutral" />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyL" weight="semiBold">
                          {f?.name} → {t?.name}
                        </Text>
                        <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                          {f?.region} · {t?.region}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <CityPickerModal
        visible={picker === 'from'}
        title="Ville de départ"
        excludeId={store.toCityId}
        onClose={() => setPicker(null)}
        onSelect={handlePickSelect}
      />
      <CityPickerModal
        visible={picker === 'to'}
        title="Ville de destination"
        excludeId={store.fromCityId}
        onClose={() => setPicker(null)}
        onSelect={handlePickSelect}
      />
    </View>
  );
}

function FieldRow({
  icon,
  iconColor,
  label,
  value,
  placeholder,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  label: string;
  value: string;
  placeholder?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: iconColor + '22',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={14} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="secondary" weight="semiBold" style={{ textTransform: 'uppercase' }}>
          {label}
        </Text>
        <Text
          variant="bodyL"
          weight="semiBold"
          style={{ color: placeholder ? theme.color.textSecondary : theme.color.text, marginTop: 2 }}
        >
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
    </Pressable>
  );
}

function stepperBtn(theme: ReturnType<typeof useTheme>) {
  return {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.color.bgElevated,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

function BusSilhouettes() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 12,
        height: 80,
        opacity: 0.55,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 28,
          height: 1.5,
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      />
      <View style={{ position: 'absolute', left: 16, bottom: 22 }}>
        <Ionicons name="bus" size={48} color="rgba(255,255,255,0.95)" />
      </View>
      <View style={{ position: 'absolute', left: 96, bottom: 26 }}>
        <Ionicons name="car-sport" size={28} color="rgba(255,255,255,0.7)" />
      </View>
      <View style={{ position: 'absolute', right: 110, bottom: 22 }}>
        <Ionicons name="bus-outline" size={42} color="rgba(255,255,255,0.85)" />
      </View>
      <View style={{ position: 'absolute', right: 24, bottom: 26 }}>
        <Ionicons name="car" size={26} color="rgba(255,255,255,0.6)" />
      </View>
    </View>
  );
}
