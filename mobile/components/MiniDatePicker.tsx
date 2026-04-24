import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MiniDatePicker({
  visible,
  onClose,
  valueIso,
  onSelect,
  minDateIso,
  title = 'Choisir la date',
}: {
  visible: boolean;
  onClose: () => void;
  valueIso?: string;
  onSelect: (iso: string) => void;
  minDateIso?: string;
  title?: string;
}) {
  const theme = useTheme();
  const today = stripTime(new Date());
  const min = stripTime(minDateIso ? new Date(minDateIso) : today);
  const value = valueIso ? stripTime(new Date(valueIso)) : null;
  const [cursor, setCursor] = useState<Date>(startOfMonth(value ?? today));

  const first = startOfMonth(cursor);
  const last = endOfMonth(cursor);
  const firstWeekday = (first.getDay() + 6) % 7;
  const grid: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let day = 1; day <= last.getDate(); day++) {
    grid.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
  }
  while (grid.length % 7 !== 0) grid.push(null);

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.color.divider,
          }}
        >
          <Text variant="heading2" weight="bold">
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={theme.color.text} />
          </Pressable>
        </View>

        <View style={{ padding: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} hitSlop={8} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={20} color={theme.color.text} />
            </Pressable>
            <Text variant="bodyL" weight="semiBold" style={{ textTransform: 'capitalize' }}>
              {monthLabel}
            </Text>
            <Pressable onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} hitSlop={8} style={{ padding: 8 }}>
              <Ionicons name="chevron-forward" size={20} color={theme.color.text} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row' }}>
            {WEEKDAYS.map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                <Text variant="caption" tone="secondary" weight="semiBold">
                  {w}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {grid.map((d, i) => {
              if (!d) return <View key={`e-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
              const isPast = d < min;
              const isSelected = value && sameDay(d, value);
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => {
                    onSelect(d.toISOString());
                    onClose();
                  }}
                  disabled={isPast}
                  style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 3 }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? theme.color.primary : 'transparent',
                      opacity: isPast ? 0.3 : 1,
                    }}
                  >
                    <Text
                      variant="bodyM"
                      weight={isSelected ? 'bold' : 'regular'}
                      style={{ color: isSelected ? theme.color.textInverse : theme.color.text }}
                    >
                      {d.getDate()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Button label="Aujourd'hui" variant="ghost" onPress={() => { onSelect(today.toISOString()); onClose(); }} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
