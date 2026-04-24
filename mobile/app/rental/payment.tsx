import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, StickyCTA, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { formatMRU } from '@/lib/format';
import { getRentalById, RENTAL_OPTIONS } from '@/lib/mocks/rentals';
import { quoteTotal, useRentalStore } from '@/lib/stores/rental';

type PayMethod = 'bankily' | 'masrvi' | 'sedad' | 'wallet' | 'cash';

const METHODS: { key: PayMethod; label: string; icon: string; note?: string }[] = [
  { key: 'bankily', label: 'Bankily', icon: 'card', note: 'Mobile money BDM' },
  { key: 'masrvi', label: 'Masrvi', icon: 'card', note: 'BPM' },
  { key: 'sedad', label: 'Sedad', icon: 'card' },
  { key: 'wallet', label: 'Kargo Wallet', icon: 'wallet', note: 'Solde 128 500 MRU' },
  { key: 'cash', label: 'Payer à l’agence', icon: 'cash', note: 'Uniquement si caution bloquée' },
];

export default function RentalPayment() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { quote, search, kycDone } = useRentalStore();
  const [method, setMethod] = useState<PayMethod>('bankily');
  const rental = quote.listingId ? getRentalById(quote.listingId) : undefined;

  const total = quoteTotal(quote);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Réservation
        </Text>
        <Badge label="L-07" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 180 }}>
        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Récapitulatif
          </Text>
          <Text variant="bodyL" weight="bold" style={{ marginTop: 4 }}>
            {rental ? `${rental.brand} ${rental.model} ${rental.year}` : '—'}
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
            {search.startDate} → {search.endDate} · {search.city ?? '—'}
          </Text>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.color.border,
              marginTop: 12,
              paddingTop: 12,
              gap: 6,
            }}
          >
            <Line
              label={`Location ${quote.days} j × ${formatMRU(quote.basePerDay)}`}
              value={formatMRU(quote.basePerDay * quote.days)}
            />
            {quote.withChauffeur ? (
              <Line
                label={`Chauffeur ${quote.days} j × ${formatMRU(quote.chauffeurPerDay)}`}
                value={formatMRU(quote.chauffeurPerDay * quote.days)}
              />
            ) : null}
            {quote.selectedOptions.map((k) => {
              const opt = RENTAL_OPTIONS.find((o) => o.key === k);
              if (!opt) return null;
              return (
                <Line
                  key={k}
                  label={`${opt.label} × ${quote.days} j`}
                  value={formatMRU(opt.pricePerDay * quote.days)}
                />
              );
            })}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: theme.color.border,
              }}
            >
              <Text variant="bodyL" weight="bold">
                Total
              </Text>
              <Text variant="bodyL" weight="bold" style={{ color: theme.color.primary }}>
                {formatMRU(total)} MRU
              </Text>
            </View>
            {rental ? (
              <Text variant="caption" tone="secondary">
                + Caution bloquée {formatMRU(rental.depositMRU)} MRU (libérée au retour)
              </Text>
            ) : null}
          </View>
        </Card>

        <View>
          <Text variant="bodyL" weight="bold" style={{ marginBottom: 10 }}>
            Moyen de paiement
          </Text>
          <View style={{ gap: 10 }}>
            {METHODS.map((m) => {
              const active = method === m.key;
              return (
                <Pressable key={m.key} onPress={() => setMethod(m.key)}>
                  <Card
                    style={{
                      borderWidth: 2,
                      borderColor: active ? theme.color.primary : theme.color.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={m.icon as React.ComponentProps<typeof Ionicons>['name']}
                          size={18}
                          color={active ? theme.color.textInverse : theme.color.text}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyL" weight="semiBold">
                          {m.label}
                        </Text>
                        {m.note ? (
                          <Text variant="caption" tone="secondary">
                            {m.note}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color={active ? theme.color.primary : theme.color.textSecondary}
                      />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>

        {!kycDone ? (
          <Card variant="soft">
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Ionicons name="warning" size={20} color={theme.color.danger} />
              <Text variant="bodyM" tone="secondary" style={{ flex: 1 }}>
                KYC non validé. Revenez à l'étape précédente.
              </Text>
            </View>
          </Card>
        ) : null}
      </ScrollView>

      <StickyCTA>
        <Button
          label={`Confirmer — ${formatMRU(total)} MRU`}
          disabled={!kycDone}
          onPress={() => router.push('/rental/contract')}
          leading={<Ionicons name="lock-closed" size={16} color={theme.color.textInverse} />}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="caption" weight="semiBold">
        {value} MRU
      </Text>
    </View>
  );
}
