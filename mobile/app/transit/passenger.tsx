import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Chip, Input, Screen, StickyCTA, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { CATEGORY_LABELS, type PassengerCategory, useBookingStore } from '@/lib/stores/booking';

const CATEGORIES: PassengerCategory[] = ['adult', 'student', 'child'];

export default function TransitPassenger() {
  const theme = useTheme();
  const router = useRouter();
  const { passengers, setPassenger } = useBookingStore();

  if (passengers.length === 0) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="people" size={40} color={theme.color.textSecondary} />
          <Text variant="heading2">Aucun siège sélectionné</Text>
          <Button label="Retour aux sièges" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const complete = passengers.every((p) => p.name.trim().length >= 2 && /^\+?\d{7,}$/.test(p.phone));

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentStyle={{ paddingBottom: 140 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} onPress={() => router.back()} />
          <Badge label="T-09" tone="neutral" />
        </View>
        <Text variant="heading1">Informations passagers</Text>
        <Text variant="bodyM" tone="secondary">
          Ces infos figurent sur le billet et sont contrôlées à l'embarquement.
        </Text>

        {passengers.map((p, idx) => (
          <Card key={p.seatLabel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: theme.color.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="caption" weight="bold" style={{ color: theme.color.textInverse }}>
                  {p.seatLabel}
                </Text>
              </View>
              <Text variant="bodyL" weight="semiBold" style={{ flex: 1 }}>
                Passager {idx + 1}
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <Input
                label="Nom et prénom"
                value={p.name}
                onChangeText={(v) => setPassenger(idx, { name: v })}
                placeholder="Ex. Fatimata Kane"
                autoCapitalize="words"
              />
              <Input
                label="Téléphone"
                value={p.phone}
                onChangeText={(v) => setPassenger(idx, { phone: v })}
                placeholder="+222 XX XX XX XX"
                keyboardType="phone-pad"
              />
              <View>
                <Text variant="caption" tone="secondary" style={{ marginBottom: 6 }}>
                  Catégorie tarifaire
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map((c) => (
                    <Chip
                      key={c}
                      label={
                        CATEGORY_LABELS[c].discount > 0
                          ? `${CATEGORY_LABELS[c].label} · −${CATEGORY_LABELS[c].discount * 100}%`
                          : CATEGORY_LABELS[c].label
                      }
                      active={p.category === c}
                      onPress={() => setPassenger(idx, { category: c })}
                      tone="primary"
                    />
                  ))}
                </View>
              </View>
            </View>
          </Card>
        ))}
      </Screen>

      <StickyCTA>
        <Button
          label="Continuer vers le résumé"
          fullWidth
          disabled={!complete}
          leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
          onPress={() => router.push('/transit/review')}
        />
      </StickyCTA>
    </View>
  );
}
