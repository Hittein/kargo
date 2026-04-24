import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTransitStore } from '@/lib/stores/transit';

const TIMES = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function TransitDate() {
  const theme = useTheme();
  const router = useRouter();
  const date = useTransitStore((s) => s.date);
  const setDate = useTransitStore((s) => s.setDate);
  const passengers = useTransitStore((s) => s.passengers);
  const setPassengers = useTransitStore((s) => s.setPassengers);

  const [time, setTime] = useState('08:00');
  const days = useMemo(() => buildDays(date), [date]);

  return (
    <Screen scroll>
      <BackHeader title="Date & passagers" code="T-04" />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <QuickDate
          label="Aujourd'hui"
          active={isSameDay(date, new Date())}
          onPress={() => setDate(new Date().toISOString())}
        />
        <QuickDate
          label="Demain"
          active={isSameDay(date, addDays(new Date(), 1))}
          onPress={() => setDate(addDays(new Date(), 1).toISOString())}
        />
        <QuickDate
          label="Après-demain"
          active={isSameDay(date, addDays(new Date(), 2))}
          onPress={() => setDate(addDays(new Date(), 2).toISOString())}
        />
      </View>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Choisir une date
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {days.map((d) => {
            const sel = isSameDay(date, d);
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => setDate(d.toISOString())}
                style={{
                  width: 56,
                  paddingVertical: 10,
                  borderRadius: theme.radius.lg,
                  backgroundColor: sel ? theme.color.primary : theme.color.bgElevated,
                  alignItems: 'center',
                }}
              >
                <Text variant="caption" style={{ color: sel ? theme.color.textInverse : theme.color.textSecondary }}>
                  {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </Text>
                <Text variant="bodyL" weight="bold" style={{ color: sel ? theme.color.textInverse : theme.color.text }}>
                  {d.getDate()}
                </Text>
                <Text variant="caption" style={{ color: sel ? theme.color.textInverse : theme.color.textSecondary }}>
                  {d.toLocaleDateString('fr-FR', { month: 'short' })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Plage horaire de départ
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TIMES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTime(t)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: time === t ? theme.color.primary : theme.color.bgElevated,
              }}
            >
              <Text variant="caption" weight="semiBold" style={{ color: time === t ? theme.color.textInverse : theme.color.text }}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold">
              Nombre de passagers
            </Text>
            <Text variant="caption" tone="secondary">
              Adulte, enfant, étudiant — précisé à l'étape suivante.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable
              onPress={() => setPassengers(passengers - 1)}
              disabled={passengers <= 1}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.color.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: passengers <= 1 ? 0.4 : 1,
              }}
            >
              <Ionicons name="remove" size={20} color={theme.color.text} />
            </Pressable>
            <Text variant="heading2">{passengers}</Text>
            <Pressable
              onPress={() => setPassengers(passengers + 1)}
              disabled={passengers >= 9}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.color.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: passengers >= 9 ? 0.4 : 1,
              }}
            >
              <Ionicons name="add" size={20} color={theme.color.textInverse} />
            </Pressable>
          </View>
        </View>
      </Card>

      <Badge label="Date sélectionnée" tone="neutral" />
      <Text variant="bodyL" weight="semiBold">
        {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {time} · {passengers} passager{passengers > 1 ? 's' : ''}
      </Text>

      <Button label="Voir les trajets" fullWidth onPress={() => router.push('/transit/results')} />
    </Screen>
  );
}

function QuickDate({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.radius.lg,
        backgroundColor: active ? theme.color.primary : theme.color.bgElevated,
        alignItems: 'center',
      }}
    >
      <Text variant="bodyM" weight="semiBold" style={{ color: active ? theme.color.textInverse : theme.color.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function buildDays(currentIso: string): Date[] {
  const start = new Date(currentIso);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 28 }, (_, i) => addDays(start, i));
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function isSameDay(aIso: string, b: Date): boolean {
  const a = new Date(aIso);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
