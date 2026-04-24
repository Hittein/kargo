import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Input, StickyCTA, Text } from '@/components/ui';
import { SellStepper } from '@/components/SellStepper';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { useSellStore } from '@/lib/stores/sell';

const CITIES = ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérate', 'Rosso', 'Kiffa'];

function estimatePrice(km?: number, year?: number): { low: number; high: number } | undefined {
  if (!km || !year) return undefined;
  const base = 2_500_000 - (2026 - year) * 120_000 - km * 3;
  const low = Math.max(100_000, Math.round(base * 0.9 / 10_000) * 10_000);
  const high = Math.max(200_000, Math.round(base * 1.1 / 10_000) * 10_000);
  return { low, high };
}

export default function SellPrice() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, patch } = useSellStore();

  const estimate = useMemo(() => estimatePrice(draft.km, draft.year), [draft.km, draft.year]);
  const canContinue = !!(draft.price && draft.city);

  const verdict = (() => {
    if (!estimate || !draft.price) return null;
    if (draft.price < estimate.low) return { text: 'Prix bas — vente rapide probable', tone: 'success' as const };
    if (draft.price > estimate.high) return { text: 'Prix au-dessus du marché', tone: 'danger' as const };
    return { text: 'Prix cohérent', tone: 'primary' as const };
  })();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Prix & localisation
        </Text>
        <Badge label="A-09" tone="primary" />
      </View>

      <SellStepper current={3} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 160 }}>
        {estimate ? (
          <Card variant="soft">
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Ionicons name="sparkles" size={20} color={theme.color.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">
                  Kargo Price Oracle
                </Text>
                <Text variant="bodyL" weight="semiBold">
                  {formatMRU(estimate.low)} – {formatMRU(estimate.high)} MRU
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                  Estimation basée sur modèle, année et kilométrage.
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Input
          label="Prix demandé (MRU)"
          value={draft.price?.toString() ?? ''}
          onChangeText={(v) => {
            const n = parseInt(v.replace(/\D/g, ''), 10);
            patch({ price: Number.isNaN(n) ? undefined : n });
          }}
          placeholder="ex. 2 450 000"
          keyboardType="number-pad"
          leading={<Ionicons name="pricetag" size={18} color={theme.color.textSecondary} />}
        />

        {verdict ? (
          <View style={{ flexDirection: 'row' }}>
            <Badge label={verdict.text} tone={verdict.tone} />
          </View>
        ) : null}

        <Pressable
          onPress={() => patch({ negotiable: !draft.negotiable })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}
        >
          <Ionicons
            name={draft.negotiable ? 'checkbox' : 'square-outline'}
            size={22}
            color={draft.negotiable ? theme.color.primary : theme.color.textSecondary}
          />
          <Text variant="bodyM" style={{ flex: 1 }}>
            Prix négociable
          </Text>
        </Pressable>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Ville
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {CITIES.map((c) => (
              <Chip
                key={c}
                label={c}
                active={draft.city === c}
                tone="primary"
                onPress={() => patch({ city: c })}
              />
            ))}
          </View>
        </Card>

        <Input
          label="Quartier / district (optionnel)"
          value={draft.district ?? ''}
          onChangeText={(v) => patch({ district: v })}
          placeholder="ex. Tevragh Zeina"
          leading={<Ionicons name="location" size={18} color={theme.color.textSecondary} />}
        />
      </ScrollView>

      <StickyCTA>
        <Button
          label="Continuer"
          disabled={!canContinue}
          onPress={() => router.push('/marketplace/sell/photos')}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
