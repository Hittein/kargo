import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, CircleIcon, GradientHero, Text } from '@/components/ui';
import { CityPickerModal } from '@/components/CityPickerModal';
import { MiniDatePicker } from '@/components/MiniDatePicker';
import { useTheme } from '@/theme/ThemeProvider';
import { getCity, type City } from '@/lib/mocks/transit';
import { useTransitStore, type TripMode, type TripLeg } from '@/lib/stores/transit';

const MODES: { key: TripMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'one-way', label: 'Aller simple', icon: 'arrow-forward' },
  { key: 'round-trip', label: 'Aller-retour', icon: 'swap-horizontal' },
  { key: 'multi', label: 'Multi-destinations', icon: 'git-branch' },
];

export default function TransitHome() {
  const theme = useTheme();
  const router = useRouter();
  const store = useTransitStore();

  const [picker, setPicker] = useState<null | { kind: 'from' | 'to'; legIndex: number }>(null);
  const [datePicker, setDatePicker] = useState<null | { kind: 'leg' | 'return'; legIndex?: number }>(null);

  const canSearch =
    store.legs.every((l) => l.fromCityId && l.toCityId) &&
    (store.mode !== 'round-trip' || !!store.returnDate);

  const onSubmit = () => {
    if (!canSearch) return;
    store.pushRecent();
    router.push('/transit/results');
  };

  const handlePickSelect = (city: City) => {
    if (!picker) return;
    if (picker.kind === 'from') store.setLegFrom(picker.legIndex, city.id);
    else store.setLegTo(picker.legIndex, city.id);
    setPicker(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <GradientHero preset="brand" radius="blob">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=70' }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18 }}
            contentFit="cover"
          />
          <BusSilhouettes />
          <SafeAreaView edges={['top']}>
            <View style={{ padding: 24, paddingBottom: 60, gap: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                  style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.color.textInverse} />
                </Pressable>
                <Pressable
                  onPress={() => router.push('/(tabs)/tickets')}
                  hitSlop={8}
                  style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="ticket" size={18} color={theme.color.textInverse} />
                </Pressable>
              </View>

              <View>
                <Text variant="caption" style={{ color: '#FFFFFFAA' }}>Transport</Text>
                <Text variant="displayL" weight="bold" style={{ color: theme.color.textInverse, marginTop: 4 }}>
                  Où allez-vous{'\n'}aujourd'hui ?
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </GradientHero>

        <View style={{ paddingHorizontal: 20, marginTop: -44, gap: 14 }}>
          {/* Mode selector */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.color.card,
              borderRadius: theme.radius.pill,
              padding: 4,
              ...theme.shadow.sm,
            }}
          >
            {MODES.map((m) => {
              const active = store.mode === m.key;
              return (
                <Pressable
                  key={m.key}
                  onPress={() => store.setMode(m.key)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 10,
                    borderRadius: theme.radius.pill,
                    backgroundColor: active ? theme.color.primary : 'transparent',
                  }}
                >
                  <Ionicons
                    name={m.icon}
                    size={14}
                    color={active ? theme.color.textInverse : theme.color.textSecondary}
                  />
                  <Text
                    variant="caption"
                    weight="semiBold"
                    style={{ color: active ? theme.color.textInverse : theme.color.text }}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Legs */}
          {store.legs.map((leg, i) => (
            <LegCard
              key={i}
              leg={leg}
              index={i}
              showRemove={store.mode === 'multi' && i > 0}
              onPickFrom={() => setPicker({ kind: 'from', legIndex: i })}
              onPickTo={() => setPicker({ kind: 'to', legIndex: i })}
              onPickDate={() => setDatePicker({ kind: 'leg', legIndex: i })}
              onSwap={i === 0 ? () => store.swap() : undefined}
              onRemove={() => store.removeLeg(i)}
              labelPrefix={store.mode === 'multi' ? `Étape ${i + 1}` : undefined}
            />
          ))}

          {/* Add leg button (multi) */}
          {store.mode === 'multi' && store.legs.length < 5 ? (
            <Pressable
              onPress={() => store.addLeg()}
              style={{
                paddingVertical: 14,
                borderRadius: theme.radius.lg,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.color.border,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="add-circle" size={20} color={theme.color.primary} />
              <Text variant="bodyM" weight="semiBold" style={{ color: theme.color.primary }}>
                Ajouter une étape
              </Text>
            </Pressable>
          ) : null}

          {/* Return date (round-trip) */}
          {store.mode === 'round-trip' ? (
            <Card variant="default" radius="xl" padding={16}>
              <Pressable
                onPress={() => setDatePicker({ kind: 'return' })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <CircleIcon name="return-up-back" size={36} tone="brand" />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" tone="secondary" weight="semiBold" style={{ textTransform: 'uppercase' }}>
                    Date de retour
                  </Text>
                  <Text variant="bodyL" weight="semiBold" style={{ marginTop: 2 }}>
                    {store.returnDate
                      ? new Date(store.returnDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                      : 'Choisir la date'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
              </Pressable>
            </Card>
          ) : null}

          {/* Passengers */}
          <Card variant="default" radius="xl" padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <CircleIcon name="people" size={36} tone="brand" />
              <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }}>
                Passagers
              </Text>
              <Pressable
                onPress={() => store.setPassengers(store.passengers - 1)}
                disabled={store.passengers <= 1}
                hitSlop={8}
                style={stepperBtn(theme, store.passengers <= 1)}
              >
                <Ionicons name="remove" size={16} color={theme.color.text} />
              </Pressable>
              <Text variant="bodyL" weight="bold" style={{ minWidth: 24, textAlign: 'center' }}>
                {store.passengers}
              </Text>
              <Pressable
                onPress={() => store.setPassengers(store.passengers + 1)}
                disabled={store.passengers >= 9}
                hitSlop={8}
                style={stepperBtn(theme, store.passengers >= 9)}
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
                      store.setLegFrom(0, r.fromCityId);
                      store.setLegTo(0, r.toCityId);
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
        visible={picker?.kind === 'from'}
        title="Ville de départ"
        excludeId={picker ? store.legs[picker.legIndex]?.toCityId : undefined}
        onClose={() => setPicker(null)}
        onSelect={handlePickSelect}
      />
      <CityPickerModal
        visible={picker?.kind === 'to'}
        title="Ville de destination"
        excludeId={picker ? store.legs[picker.legIndex]?.fromCityId : undefined}
        onClose={() => setPicker(null)}
        onSelect={handlePickSelect}
      />

      <MiniDatePicker
        visible={!!datePicker}
        onClose={() => setDatePicker(null)}
        valueIso={
          datePicker?.kind === 'return'
            ? store.returnDate ?? undefined
            : datePicker
              ? store.legs[datePicker.legIndex ?? 0]?.date
              : undefined
        }
        minDateIso={
          datePicker?.kind === 'return'
            ? store.legs[0]?.date
            : datePicker?.legIndex && datePicker.legIndex > 0
              ? store.legs[datePicker.legIndex - 1]?.date
              : undefined
        }
        onSelect={(iso) => {
          if (!datePicker) return;
          if (datePicker.kind === 'return') store.setReturnDate(iso);
          else store.setLegDate(datePicker.legIndex ?? 0, iso);
        }}
        title={
          datePicker?.kind === 'return'
            ? 'Date de retour'
            : store.mode === 'multi'
              ? `Date — étape ${(datePicker?.legIndex ?? 0) + 1}`
              : "Date d'aller"
        }
      />
    </View>
  );
}

function LegCard({
  leg,
  index,
  showRemove,
  onPickFrom,
  onPickTo,
  onPickDate,
  onSwap,
  onRemove,
  labelPrefix,
}: {
  leg: TripLeg;
  index: number;
  showRemove: boolean;
  onPickFrom: () => void;
  onPickTo: () => void;
  onPickDate: () => void;
  onSwap?: () => void;
  onRemove: () => void;
  labelPrefix?: string;
}) {
  const theme = useTheme();
  const fromCity = leg.fromCityId ? getCity(leg.fromCityId) : undefined;
  const toCity = leg.toCityId ? getCity(leg.toCityId) : undefined;

  return (
    <Card variant="elevated" radius="xl" padding={16}>
      {labelPrefix ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Badge label={labelPrefix} tone="primary" />
          {showRemove ? (
            <Pressable onPress={onRemove} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={theme.color.danger} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <FieldRow
        icon="radio-button-on"
        iconColor={theme.color.primary}
        label="Départ"
        value={fromCity?.name ?? 'Sélectionner une ville'}
        onPress={onPickFrom}
        placeholder={!fromCity}
      />
      <View style={{ height: 1, backgroundColor: theme.color.divider, marginLeft: 40, marginVertical: 4 }} />
      <View style={{ position: 'relative' }}>
        <FieldRow
          icon="location"
          iconColor={theme.color.brand}
          label="Destination"
          value={toCity?.name ?? 'Sélectionner une ville'}
          onPress={onPickTo}
          placeholder={!toCity}
        />
        {onSwap ? (
          <Pressable
            onPress={onSwap}
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
        ) : null}
      </View>

      {/* Date inline */}
      <View style={{ height: 1, backgroundColor: theme.color.divider, marginLeft: 40, marginVertical: 4 }} />
      <Pressable onPress={onPickDate} style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.color.accent + '22', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="calendar" size={14} color={theme.color.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="secondary" weight="semiBold" style={{ textTransform: 'uppercase' }}>
            Date
          </Text>
          <Text variant="bodyL" weight="semiBold" style={{ marginTop: 2 }}>
            {new Date(leg.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
      </Pressable>
    </Card>
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
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: iconColor + '22', alignItems: 'center', justifyContent: 'center' }}>
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

function stepperBtn(theme: ReturnType<typeof useTheme>, disabled: boolean) {
  return {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.color.bgElevated,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: disabled ? 0.4 : 1,
  };
}

function BusSilhouettes() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 12, height: 80, opacity: 0.55 }}>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 28, height: 1.5, backgroundColor: 'rgba(255,255,255,0.35)' }} />
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
