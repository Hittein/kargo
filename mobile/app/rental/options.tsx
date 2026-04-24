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

export default function RentalOptions() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { quote, toggleOption, setChauffeur } = useRentalStore();
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
          Options
        </Text>
        <Badge label="L-05" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 180 }}>
        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Véhicule
          </Text>
          <Text variant="bodyL" weight="bold" style={{ marginTop: 4 }}>
            {rental ? `${rental.brand} ${rental.model} ${rental.year}` : '—'}
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
            {formatMRU(quote.basePerDay)} MRU × {quote.days} jour{quote.days > 1 ? 's' : ''}
          </Text>
        </Card>

        {rental?.chauffeurAvailable && rental.chauffeurPricePerDay ? (
          <OptionRow
            icon="person"
            title="Avec chauffeur"
            subtitle="Chauffeur expérimenté inclus"
            price={rental.chauffeurPricePerDay}
            active={quote.withChauffeur}
            onToggle={() => setChauffeur(!quote.withChauffeur, rental.chauffeurPricePerDay ?? 0)}
          />
        ) : null}

        {RENTAL_OPTIONS.filter((o) => o.key !== 'chauffeur').map((opt) => (
          <OptionRow
            key={opt.key}
            icon={opt.icon as React.ComponentProps<typeof Ionicons>['name']}
            title={opt.label}
            price={opt.pricePerDay}
            active={quote.selectedOptions.includes(opt.key)}
            onToggle={() => toggleOption(opt.key, opt.pricePerDay)}
          />
        ))}
      </ScrollView>

      <StickyCTA>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodyM" tone="secondary">
              Total estimé
            </Text>
            <Text variant="bodyL" weight="bold" style={{ color: theme.color.primary }}>
              {formatMRU(total)} MRU
            </Text>
          </View>
          <Button
            label="Continuer"
            onPress={() => router.push('/rental/kyc')}
            leading={<Ionicons name="arrow-forward" size={16} color={theme.color.textInverse} />}
          />
        </View>
      </StickyCTA>
    </SafeAreaView>
  );
}

function OptionRow({
  icon,
  title,
  subtitle,
  price,
  active,
  onToggle,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  price: number;
  active: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onToggle}>
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
              name={icon}
              size={18}
              color={active ? theme.color.textInverse : theme.color.text}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="caption" tone="secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="bodyM" weight="bold">
              +{formatMRU(price)} MRU
            </Text>
            <Text variant="caption" tone="secondary">
              / jour
            </Text>
          </View>
          <Ionicons
            name={active ? 'checkbox' : 'square-outline'}
            size={22}
            color={active ? theme.color.primary : theme.color.textSecondary}
          />
        </View>
      </Card>
    </Pressable>
  );
}
