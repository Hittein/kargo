import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTransitStore } from '@/lib/stores/transit';
import { BUS_SIZE_LABEL, COMPANIES, type BusSize, type TripFilters } from '@/lib/mocks/transit';

export default function TransitFilters() {
  const theme = useTheme();
  const router = useRouter();
  const filters = useTransitStore((s) => s.filters);
  const setFilters = useTransitStore((s) => s.setFilters);

  const [draft, setDraft] = useState<TripFilters>(filters);

  const update = (patch: Partial<TripFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const toggleCompany = (id: string) => {
    const set = new Set(draft.companyIds ?? []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update({ companyIds: Array.from(set) });
  };

  const toggleBusSize = (size: BusSize) => {
    update({ busSize: draft.busSize === size ? undefined : size });
  };

  const apply = () => {
    setFilters(draft);
    router.back();
  };
  const reset = () => setDraft({});

  const activeCount = countActive(draft);

  return (
    <Screen scroll>
      <BackHeader title="Filtres trajets" code="T-06" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {activeCount > 0 ? <Badge label={`${activeCount} actif${activeCount > 1 ? 's' : ''}`} tone="primary" /> : null}
        <Button label="Tout réinitialiser" variant="ghost" size="sm" onPress={reset} />
      </View>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Compagnies
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {COMPANIES.map((c) => {
            const active = (draft.companyIds ?? []).includes(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggleCompany(c.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: theme.radius.pill,
                  backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
                }}
              >
                <Text variant="caption" weight="semiBold" style={{ color: active ? theme.color.textInverse : theme.color.text }}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Taille du véhicule
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['small', 'medium', 'big'] as BusSize[]).map((size) => {
            const active = draft.busSize === size;
            return (
              <Pressable
                key={size}
                onPress={() => toggleBusSize(size)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: theme.radius.lg,
                  backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
                  alignItems: 'center',
                }}
              >
                <Text variant="bodyM" weight="semiBold" style={{ color: active ? theme.color.textInverse : theme.color.text }}>
                  {BUS_SIZE_LABEL[size]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Prix max (MRU)
        </Text>
        <Input
          keyboardType="number-pad"
          placeholder="Sans limite"
          value={draft.maxPrice ? String(draft.maxPrice) : ''}
          onChangeText={(v) => update({ maxPrice: v ? parseInt(v.replace(/\D/g, ''), 10) : undefined })}
        />
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          {[2000, 3500, 5000, 8000].map((v) => (
            <Pressable
              key={v}
              onPress={() => update({ maxPrice: v })}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.color.bgElevated,
              }}
            >
              <Text variant="caption">≤ {v.toLocaleString('fr-FR')}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Heure de départ
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Min"
              keyboardType="number-pad"
              placeholder="0"
              value={draft.minDepartHour !== undefined ? String(draft.minDepartHour) : ''}
              onChangeText={(v) =>
                update({ minDepartHour: v ? Math.max(0, Math.min(23, parseInt(v, 10))) : undefined })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Max"
              keyboardType="number-pad"
              placeholder="23"
              value={draft.maxDepartHour !== undefined ? String(draft.maxDepartHour) : ''}
              onChangeText={(v) =>
                update({ maxDepartHour: v ? Math.max(0, Math.min(23, parseInt(v, 10))) : undefined })
              }
            />
          </View>
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold">
              Trajet direct uniquement
            </Text>
            <Text variant="caption" tone="secondary">
              Sans escale ni rupture de charge.
            </Text>
          </View>
          <Switch
            value={draft.directOnly ?? false}
            onValueChange={(v) => update({ directOnly: v || undefined })}
          />
        </View>
      </Card>

      <Button label="Appliquer" fullWidth onPress={apply} />
    </Screen>
  );
}

function countActive(f: TripFilters): number {
  let n = 0;
  if (f.companyIds && f.companyIds.length) n++;
  if (f.maxPrice) n++;
  if (f.busSize) n++;
  if (f.minDepartHour !== undefined) n++;
  if (f.maxDepartHour !== undefined) n++;
  if (f.directOnly) n++;
  return n;
}
