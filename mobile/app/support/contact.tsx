import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useMessagingStore } from '@/lib/stores/messaging';

const TOPICS = ['Compte & connexion', 'Paiement', 'Billet de transport', 'Location', 'Annonce', 'Litige', 'Autre'];

export default function Contact() {
  const theme = useTheme();
  const router = useRouter();
  const ensure = useMessagingStore((s) => s.ensureThread);
  const send = useMessagingStore((s) => s.send);

  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!message.trim()) return;
    const id = ensure({ kind: 'support' }, 'Support Kargo');
    send(id, `[${topic}] ${message.trim()}`);
    Alert.alert('Message envoyé', 'Notre équipe vous répond dans les meilleurs délais.', [
      { text: 'Voir la conversation', onPress: () => router.replace(`/chat/${id}`) },
      { text: 'OK', style: 'cancel' },
    ]);
    setMessage('');
  };

  return (
    <Screen scroll>
      <BackHeader title="Contacter le support" code="P-06" />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <ContactTile
          icon="call"
          label="Appeler"
          desc="+222 45 25 25 25"
          onPress={() => Linking.openURL('tel:+22245252525').catch(() => {})}
        />
        <ContactTile
          icon="logo-whatsapp"
          label="WhatsApp"
          desc="Lun–Sam · 8h–22h"
          onPress={() => Linking.openURL('https://wa.me/22245252525').catch(() => {})}
        />
        <ContactTile
          icon="mail"
          label="Email"
          desc="support@kargo.mr"
          onPress={() => Linking.openURL('mailto:support@kargo.mr').catch(() => {})}
        />
      </View>

      <Card>
        <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
          Décrire votre problème
        </Text>
        <Text variant="caption" tone="secondary" style={{ marginBottom: 8 }}>
          Sujet
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {TOPICS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTopic(t)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: topic === t ? theme.color.primary : theme.color.bgElevated,
              }}
            >
              <Text variant="caption" weight="semiBold" style={{ color: topic === t ? theme.color.textInverse : theme.color.text }}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="Expliquez votre demande, joignez les références si possible…"
          multiline
          numberOfLines={5}
          containerStyle={{ marginTop: 12 }}
        />
        <Button label="Envoyer" onPress={submit} disabled={!message.trim()} style={{ marginTop: 12 }} />
      </Card>

      <Card variant="sand">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="time" size={16} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            Délai de réponse moyen : 12 minutes en heures ouvrées, 4 h en dehors.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function ContactTile({ icon, label, desc, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        padding: 14,
        backgroundColor: theme.color.card,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Ionicons name={icon} size={26} color={theme.color.primary} />
      <Text variant="bodyM" weight="semiBold">
        {label}
      </Text>
      <Text variant="caption" tone="secondary" align="center">
        {desc}
      </Text>
    </Pressable>
  );
}
