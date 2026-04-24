import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Input, Screen, SegmentedTabs, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';

type Slot = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; capturedAt: string | null };
type Phase = 'before' | 'after';

const initialSlots = (): Slot[] => [
  { id: 'front', label: 'Face avant', icon: 'car-sport', capturedAt: null },
  { id: 'rear', label: 'Face arrière', icon: 'car', capturedAt: null },
  { id: 'left', label: 'Côté gauche', icon: 'arrow-back', capturedAt: null },
  { id: 'right', label: 'Côté droit', icon: 'arrow-forward', capturedAt: null },
  { id: 'odo', label: 'Compteur km', icon: 'speedometer', capturedAt: null },
  { id: 'fuel', label: 'Jauge carburant', icon: 'water', capturedAt: null },
  { id: 'interior', label: 'Intérieur', icon: 'cog', capturedAt: null },
  { id: 'wheels', label: 'Pneus', icon: 'radio-button-on', capturedAt: null },
];

export default function RentalInspection() {
  const theme = useTheme();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('before');
  const [before, setBefore] = useState<Slot[]>(initialSlots());
  const [after, setAfter] = useState<Slot[]>(initialSlots());
  const [notes, setNotes] = useState('');
  const [signed, setSigned] = useState(false);

  const slots = phase === 'before' ? before : after;
  const setSlots = phase === 'before' ? setBefore : setAfter;

  const capture = (id: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, capturedAt: new Date().toISOString() } : s)));
  };

  const allCaptured = slots.every((s) => s.capturedAt);

  const sign = () => {
    if (!allCaptured) return;
    setSigned(true);
    Alert.alert(
      'État des lieux signé',
      'Photos horodatées, signature électronique enregistrée. Vous recevrez le PDF par email.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <Screen scroll>
      <BackHeader title="État des lieux" code="L-08" />
      <SegmentedTabs
        value={phase}
        onChange={(v) => setPhase(v as Phase)}
        items={[
          { key: 'before', label: `Avant (${before.filter((s) => s.capturedAt).length}/${before.length})` },
          { key: 'after', label: `Après (${after.filter((s) => s.capturedAt).length}/${after.length})` },
        ]}
      />

      <Card variant="sand">
        <Text variant="bodyM" tone="secondary">
          {phase === 'before'
            ? 'Photos horodatées avant la prise du véhicule. À faire en présence de l\'agence.'
            : 'Photos au retour du véhicule, comparaison automatique IA des dégâts.'}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {slots.map((s) => (
          <SlotCard key={s.id} slot={s} onCapture={() => capture(s.id)} />
        ))}
      </View>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Notes & remarques
        </Text>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="Rayure portière arrière droite, antenne manquante…"
          multiline
          numberOfLines={3}
        />
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Signature électronique
        </Text>
        <View
          style={{
            height: 120,
            borderRadius: theme.radius.lg,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: signed ? theme.color.success : theme.color.border,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: signed ? theme.color.bgElevated : 'transparent',
          }}
        >
          {signed ? (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle" size={32} color={theme.color.success} />
              <Text variant="bodyM" weight="semiBold">
                Signé le {new Date().toLocaleString('fr-FR')}
              </Text>
            </View>
          ) : (
            <Text variant="bodyM" tone="secondary">
              Tapez pour signer (simulation)
            </Text>
          )}
        </View>
      </Card>

      <Button
        label={phase === 'before' ? 'Valider état avant' : 'Clôturer & signer'}
        fullWidth
        disabled={!allCaptured || signed}
        onPress={sign}
      />
    </Screen>
  );
}

function SlotCard({ slot, onCapture }: { slot: Slot; onCapture: () => void }) {
  const theme = useTheme();
  const captured = !!slot.capturedAt;
  return (
    <Pressable
      onPress={onCapture}
      style={{
        width: '48%',
        padding: 14,
        backgroundColor: captured ? theme.color.success : theme.color.bgElevated,
        borderRadius: theme.radius.lg,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Ionicons name={slot.icon} size={20} color={captured ? theme.color.textInverse : theme.color.textSecondary} />
        {captured ? <Badge label="OK" tone="neutral" /> : null}
      </View>
      <Text variant="bodyM" weight="semiBold" style={{ color: captured ? theme.color.textInverse : theme.color.text }}>
        {slot.label}
      </Text>
      <Text variant="caption" style={{ color: captured ? theme.color.textInverse : theme.color.textSecondary, opacity: captured ? 0.85 : 1 }}>
        {captured ? new Date(slot.capturedAt!).toLocaleTimeString('fr-FR') : 'Tap pour capturer'}
      </Text>
    </Pressable>
  );
}
