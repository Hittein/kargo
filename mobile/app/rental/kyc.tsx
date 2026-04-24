import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, StickyCTA, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { useRentalStore } from '@/lib/stores/rental';

type Step = 'id' | 'license' | 'selfie';

const STEPS: { key: Step; title: string; subtitle: string; icon: string }[] = [
  { key: 'id', title: 'Pièce d’identité', subtitle: 'CNI ou passeport recto/verso', icon: 'card' },
  {
    key: 'license',
    title: 'Permis de conduire',
    subtitle: 'Valide, en Mauritanie ou international',
    icon: 'document-text',
  },
  {
    key: 'selfie',
    title: 'Selfie de vérification',
    subtitle: 'Liveness — clignez des yeux',
    icon: 'happy',
  },
];

export default function RentalKyc() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { setKycDone } = useRentalStore();

  const [completed, setCompleted] = useState<Record<Step, boolean>>({
    id: false,
    license: false,
    selfie: false,
  });

  const allDone = completed.id && completed.license && completed.selfie;
  const count = Object.values(completed).filter(Boolean).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Vérification express
        </Text>
        <Badge label="L-06" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 180 }}>
        <Card variant="soft">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.color.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="shield-checkmark" size={22} color={theme.color.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyL" weight="bold">
                Vérification KYC — {count}/3
              </Text>
              <Text variant="caption" tone="secondary">
                Conforme loi MR · 90 secondes en moyenne
              </Text>
            </View>
          </View>
        </Card>

        {STEPS.map((s) => {
          const done = completed[s.key];
          return (
            <Pressable
              key={s.key}
              onPress={() => setCompleted((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
            >
              <Card
                style={{
                  borderWidth: 2,
                  borderColor: done ? theme.color.success : theme.color.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: done ? theme.color.success : theme.color.bgElevated,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={done ? 'checkmark' : (s.icon as React.ComponentProps<typeof Ionicons>['name'])}
                      size={20}
                      color={done ? theme.color.textInverse : theme.color.text}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyL" weight="semiBold">
                      {s.title}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {done ? 'Validé par OCR + IA' : s.subtitle}
                    </Text>
                  </View>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'camera'}
                    size={22}
                    color={done ? theme.color.success : theme.color.textSecondary}
                  />
                </View>
              </Card>
            </Pressable>
          );
        })}

        <Text variant="caption" tone="secondary" align="center" style={{ marginTop: 8 }}>
          Simulateur : appuyez sur chaque étape pour la valider.
        </Text>
      </ScrollView>

      <StickyCTA>
        <Button
          label={allDone ? 'Continuer vers le paiement' : `Complétez ${3 - count} étape${3 - count > 1 ? 's' : ''}`}
          disabled={!allDone}
          onPress={() => {
            setKycDone(true);
            router.push('/rental/payment');
          }}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
