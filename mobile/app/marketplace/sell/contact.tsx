import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Input, StickyCTA, Text } from '@/components/ui';
import { SellStepper } from '@/components/SellStepper';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { useSellStore, type ContactMethod } from '@/lib/stores/sell';

const METHODS: { key: ContactMethod; label: string; icon: string }[] = [
  { key: 'call', label: 'Appel', icon: 'call' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  { key: 'sms', label: 'SMS', icon: 'chatbubble-ellipses' },
  { key: 'chat', label: 'Chat Kargo', icon: 'chatbubbles' },
];

const HOURS = ['Toute la journée', 'Matin (8h-12h)', 'Après-midi (12h-18h)', 'Soir (18h-22h)'];

export default function SellContact() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, patch, toggleContactMethod } = useSellStore();

  const canContinue = !!draft.contactPhone && draft.contactMethods.length > 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Contact
        </Text>
        <Badge label="A-11" tone="primary" />
      </View>

      <SellStepper current={5} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 160 }}>
        <Input
          label="Numéro de téléphone"
          value={draft.contactPhone ?? ''}
          onChangeText={(v) => patch({ contactPhone: v.replace(/\s/g, '') })}
          placeholder="+222 41 23 45 67"
          keyboardType="phone-pad"
          leading={<Ionicons name="call" size={18} color={theme.color.textSecondary} />}
        />

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Modes de contact acceptés
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {METHODS.map((m) => {
              const active = draft.contactMethods.includes(m.key);
              return (
                <Pressable
                  key={m.key}
                  onPress={() => toggleContactMethod(m.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 10,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={m.icon as React.ComponentProps<typeof Ionicons>['name']}
                      size={16}
                      color={active ? theme.color.textInverse : theme.color.text}
                    />
                  </View>
                  <Text variant="bodyL" weight="semiBold" style={{ flex: 1 }}>
                    {m.label}
                  </Text>
                  <Ionicons
                    name={active ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={active ? theme.color.primary : theme.color.textSecondary}
                  />
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Disponibilité
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {HOURS.map((h) => (
              <Chip
                key={h}
                label={h}
                active={draft.availabilityHours === h}
                tone="primary"
                onPress={() => patch({ availabilityHours: h })}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      <StickyCTA>
        <Button
          label="Prévisualiser l'annonce"
          disabled={!canContinue}
          onPress={() => router.push('/marketplace/sell/publish')}
          leading={<Ionicons name="eye" size={16} color={theme.color.textInverse} />}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
