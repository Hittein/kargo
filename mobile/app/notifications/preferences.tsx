import { Pressable, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useNotificationsStore, type NotifCategory, type NotifPrefs } from '@/lib/stores/notifications';

const CATEGORIES: { key: NotifCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'message', label: 'Messages', icon: 'chatbubbles' },
  { key: 'transit', label: 'Transport', icon: 'bus' },
  { key: 'rental', label: 'Locations', icon: 'key' },
  { key: 'marketplace', label: 'Annonces', icon: 'pricetag' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet' },
  { key: 'trust', label: 'Trust', icon: 'shield-checkmark' },
  { key: 'promo', label: 'Promotions', icon: 'gift' },
  { key: 'system', label: 'Système', icon: 'information-circle' },
];

export default function NotificationsPreferences() {
  const theme = useTheme();
  const prefs = useNotificationsStore((s) => s.prefs);
  const setPushPref = useNotificationsStore((s) => s.setPushPref);
  const setEmailPref = useNotificationsStore((s) => s.setEmailPref);
  const setSmsPref = useNotificationsStore((s) => s.setSmsPref);
  const setSilent = useNotificationsStore((s) => s.setSilent);
  const setDigest = useNotificationsStore((s) => s.setDigest);

  return (
    <Screen scroll>
      <BackHeader title="Préférences notifs" code="M-04" />

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Fréquence
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['realtime', 'daily', 'weekly'] as NotifPrefs['digest'][]).map((d) => (
            <Pressable
              key={d}
              onPress={() => setDigest(d)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: theme.radius.lg,
                backgroundColor: prefs.digest === d ? theme.color.primary : theme.color.bgElevated,
                alignItems: 'center',
              }}
            >
              <Text variant="bodyM" weight="semiBold" style={{ color: prefs.digest === d ? theme.color.textInverse : theme.color.text }}>
                {digestLabel(d)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold">
              Mode silencieux
            </Text>
            <Text variant="caption" tone="secondary">
              Aucune notification entre {prefs.silentStart} et {prefs.silentEnd}.
            </Text>
          </View>
          <Switch value={prefs.silentEnabled} onValueChange={(v) => setSilent(v)} />
        </View>
        {prefs.silentEnabled ? (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Début"
                value={prefs.silentStart}
                onChangeText={(v) => setSilent(true, v, prefs.silentEnd)}
                placeholder="22:00"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Fin"
                value={prefs.silentEnd}
                onChangeText={(v) => setSilent(true, prefs.silentStart, v)}
                placeholder="07:00"
              />
            </View>
          </View>
        ) : null}
      </Card>

      <Text variant="heading2">Canaux par catégorie</Text>
      <Card>
        <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.color.divider }}>
          <View style={{ flex: 1 }} />
          <ChannelHeader label="Push" />
          <ChannelHeader label="SMS" />
          <ChannelHeader label="Email" />
        </View>
        {CATEGORIES.map((c) => (
          <View
            key={c.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: theme.color.divider,
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name={c.icon} size={18} color={theme.color.textSecondary} />
              <Text variant="bodyM">{c.label}</Text>
            </View>
            <SwitchCol value={prefs.push[c.key]} onChange={(v) => setPushPref(c.key, v)} />
            <SwitchCol value={prefs.sms[c.key]} onChange={(v) => setSmsPref(c.key, v)} />
            <SwitchCol value={prefs.email[c.key]} onChange={(v) => setEmailPref(c.key, v)} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function ChannelHeader({ label }: { label: string }) {
  return (
    <View style={{ width: 60, alignItems: 'center' }}>
      <Text variant="caption" tone="secondary" weight="semiBold">
        {label}
      </Text>
    </View>
  );
}

function SwitchCol({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ width: 60, alignItems: 'center' }}>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function digestLabel(d: NotifPrefs['digest']): string {
  return { realtime: 'Temps réel', daily: 'Récap quotidien', weekly: 'Récap hebdo' }[d];
}
