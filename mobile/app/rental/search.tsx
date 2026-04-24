import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, Chip, Text } from '@/components/ui';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { RENTAL_CATEGORY_LABEL, type RentalCategory } from '@/lib/mocks/rentals';
import { useRentalStore } from '@/lib/stores/rental';

const CITIES = ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérate', 'Rosso', 'Kaédi'];

const CATEGORIES: RentalCategory[] = [
  'economique',
  'standard',
  'premium',
  '4x4',
  'utilitaire',
];

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function RentalSearch() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { search, setSearch } = useRentalStore();

  const canSearch = Boolean(search.city);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Louer une voiture
        </Text>
        <Badge label="L-01" tone="primary" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Ville de retrait
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {CITIES.map((c) => (
              <Chip
                key={c}
                label={c}
                active={search.city === c}
                tone="primary"
                onPress={() => setSearch({ city: c })}
              />
            ))}
          </View>
        </Card>

        <DateRangeCard
          startISO={search.startDate}
          endISO={search.endDate}
          onChange={(s, e) => setSearch({ startDate: s || undefined, endDate: e || undefined })}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 }}>
          <Ionicons name="information-circle" size={14} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            Tape une date pour le retrait, puis une autre pour le retour. La durée se calcule automatiquement.
          </Text>
        </View>

        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Catégorie (optionnel)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <Chip
              label="Toutes"
              active={!search.category}
              onPress={() => setSearch({ category: undefined })}
            />
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={RENTAL_CATEGORY_LABEL[c]}
                active={search.category === c}
                tone="primary"
                onPress={() => setSearch({ category: c })}
              />
            ))}
          </View>
        </Card>

        <Button
          label="Rechercher les voitures"
          disabled={!canSearch}
          onPress={() => router.push('/rental/results')}
          leading={<Ionicons name="search" size={16} color={theme.color.textInverse} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function DateRangeCard({
  startISO,
  endISO,
  onChange,
}: {
  startISO?: string;
  endISO?: string;
  onChange: (start: string, end: string) => void;
}) {
  const theme = useTheme();
  const today = stripTime(new Date());

  const start = startISO ? stripTime(new Date(startISO)) : null;
  const end = endISO ? stripTime(new Date(endISO)) : null;

  const [cursor, setCursor] = useState<Date>(startOfMonth(start ?? today));
  const [pickingEnd, setPickingEnd] = useState<boolean>(Boolean(start && !end));

  const days = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000)) : 0;

  const onPick = (d: Date) => {
    if (d < today) return;
    const iso = toISO(d);
    if (!start || pickingEnd === false) {
      // Démarre une nouvelle plage
      onChange(iso, '');
      setPickingEnd(true);
      return;
    }
    if (pickingEnd) {
      if (d <= start) {
        // si l'utilisateur clique avant le début, on inverse (le nouveau devient début)
        onChange(iso, toISO(start));
        setPickingEnd(false);
        return;
      }
      onChange(toISO(start), iso);
      setPickingEnd(false);
    }
  };

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  // Construit la grille du mois (semaines lundi-dimanche)
  const first = startOfMonth(cursor);
  const last = endOfMonth(cursor);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = lundi
  const grid: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let day = 1; day <= last.getDate(); day++) {
    grid.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
  }
  while (grid.length % 7 !== 0) grid.push(null);

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <Card variant="sand">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text variant="caption" tone="secondary">
            Plage de location
          </Text>
          <Text variant="bodyL" weight="semiBold" style={{ marginTop: 2 }}>
            {start ? fmtDate(toISO(start)) : '—'}
            {'  →  '}
            {end ? fmtDate(toISO(end)) : pickingEnd ? 'Choisir le retour' : '—'}
          </Text>
        </View>
        <Badge label={days > 0 ? `${days} jour${days > 1 ? 's' : ''}` : '—'} tone={days > 0 ? 'primary' : 'neutral'} />
      </View>

      <View style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={goPrev} hitSlop={8} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={18} color={theme.color.text} />
        </Pressable>
        <Text variant="bodyM" weight="semiBold" style={{ textTransform: 'capitalize' }}>
          {monthLabel}
        </Text>
        <Pressable onPress={goNext} hitSlop={8} style={{ padding: 8 }}>
          <Ionicons name="chevron-forward" size={18} color={theme.color.text} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {WEEKDAY_LABELS.map((w, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
            <Text variant="caption" tone="secondary" weight="semiBold">
              {w}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {grid.map((d, i) => {
          if (!d) return <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const isPast = d < today;
          const isStart = start && sameDay(d, start);
          const isEnd = end && sameDay(d, end);
          const isInRange = start && end && d > start && d < end;
          const isSelected = isStart || isEnd;

          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => onPick(d)}
              disabled={isPast}
              style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected
                    ? theme.color.primary
                    : isInRange
                      ? theme.color.primary + '33'
                      : 'transparent',
                  opacity: isPast ? 0.3 : 1,
                }}
              >
                <Text
                  variant="bodyM"
                  weight={isSelected ? 'bold' : 'regular'}
                  style={{
                    color: isSelected ? theme.color.textInverse : theme.color.text,
                  }}
                >
                  {d.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <Chip
          label="Aujourd'hui"
          onPress={() => {
            onChange(toISO(today), toISO(addDays(today, 3)));
            setCursor(startOfMonth(today));
            setPickingEnd(false);
          }}
        />
        <Chip
          label="Ce week-end"
          onPress={() => {
            const sat = addDays(today, (6 - today.getDay() + 7) % 7 || 7);
            onChange(toISO(sat), toISO(addDays(sat, 2)));
            setCursor(startOfMonth(sat));
            setPickingEnd(false);
          }}
        />
        {[1, 3, 7, 14].map((n) => (
          <Chip
            key={n}
            label={`+${n} j`}
            onPress={() => {
              const s = start ?? today;
              onChange(toISO(s), toISO(addDays(s, n)));
              setPickingEnd(false);
            }}
          />
        ))}
        {start || end ? (
          <Chip
            label="Effacer"
            onPress={() => {
              onChange('', '');
              setPickingEnd(false);
            }}
          />
        ) : null}
      </View>
    </Card>
  );
}
