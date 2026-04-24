import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Input, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useMessagingStore, type ChatMessage, type MessageContext } from '@/lib/stores/messaging';
import { conversationsApi } from '@/lib/api';
import { formatRelativeDate } from '@/lib/format';
import { startCall } from '@/lib/call';

const POLL_INTERVAL_MS = 5000;

const TEMPLATES = [
  'La voiture est-elle encore disponible ?',
  'Quel est le prix le plus bas ?',
  'On peut se voir demain ?',
  'Merci !',
];

export default function ChatThread() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = useMessagingStore((s) => s.threads.find((t) => t.id === id));
  const messages = useMessagingStore((s) => s.messages[id ?? ''] ?? []);
  const send = useMessagingStore((s) => s.send);
  const markRead = useMessagingStore((s) => s.markRead);
  const syncFromBackend = useMessagingStore((s) => s.syncFromBackend);

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Sync initiale + polling 5s pour voir les nouveaux messages du partenaire.
  useEffect(() => {
    if (!id) return;
    syncFromBackend(id);
    markRead(id);
    const handle = setInterval(() => {
      if (!id) return;
      conversationsApi
        .listMessages(id)
        .then((msgs) => {
          useMessagingStore.setState((s) => ({
            messages: {
              ...s.messages,
              [id]: msgs.map((m) => ({
                id: m.id,
                threadId: m.conversationId,
                fromMe: m.fromMe,
                text: m.text,
                createdAt: m.createdAt,
                read: m.readAt != null,
              })),
            },
          }));
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(handle);
  }, [id, markRead, syncFromBackend]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  if (!thread) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
        <View style={{ padding: 20, gap: 10 }}>
          <Text variant="bodyM">Conversation introuvable ou non chargée.</Text>
          <Text variant="caption" tone="secondary">
            Réessayez depuis la liste des messages.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const submit = () => {
    if (!input.trim() || !id) return;
    send(id, input.trim());
    setInput('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.color.divider,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} />
        </Pressable>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: theme.color.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="bodyM" weight="bold" style={{ color: theme.color.textInverse }}>
            {thread.partnerName.slice(0, 1)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyM" weight="semiBold">
              {thread.partnerName}
            </Text>
            {thread.partnerVerified ? <Ionicons name="shield-checkmark" size={14} color={theme.color.success} /> : null}
          </View>
          <Text variant="caption" tone="secondary">
            {ctxLabel(thread.context)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (!id) return;
            startCall({
              conversationId: id,
              peer: {
                id: thread.id,
                name: thread.partnerName,
                avatarUrl: thread.partnerAvatarUrl,
              },
              mode: 'audio',
            });
            router.push(`/call/${id}` as never);
          }}
          hitSlop={8}
          style={{ padding: 6 }}
        >
          <Ionicons name="call" size={22} color={theme.color.primary} />
        </Pressable>
        <Pressable
          onPress={() => {
            if (!id) return;
            startCall({
              conversationId: id,
              peer: {
                id: thread.id,
                name: thread.partnerName,
                avatarUrl: thread.partnerAvatarUrl,
              },
              mode: 'video',
            });
            router.push(`/call/${id}` as never);
          }}
          hitSlop={8}
          style={{ padding: 6 }}
        >
          <Ionicons name="videocam" size={22} color={theme.color.primary} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => <Bubble message={item} />}
        ListEmptyComponent={
          <Card variant="sand">
            <Text variant="bodyM" tone="secondary" align="center">
              Démarrez la conversation.
            </Text>
          </Card>
        }
      />

      <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {TEMPLATES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setInput(t)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.color.bgElevated,
              }}
            >
              <Text variant="caption">{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: theme.color.divider,
          backgroundColor: theme.color.card,
        }}
      >
        <Pressable onPress={() => {}}>
          <Ionicons name="attach" size={22} color={theme.color.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Input value={input} onChangeText={setInput} placeholder="Écrire un message…" />
        </View>
        <Pressable
          onPress={submit}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: input.trim() ? theme.color.primary : theme.color.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={18} color={input.trim() ? theme.color.textInverse : theme.color.textSecondary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const theme = useTheme();
  const fromMe = message.fromMe;
  return (
    <View style={{ alignItems: fromMe ? 'flex-end' : 'flex-start' }}>
      <View
        style={{
          maxWidth: '78%',
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: fromMe ? theme.color.primary : theme.color.card,
          borderRadius: 18,
          borderBottomRightRadius: fromMe ? 4 : 18,
          borderBottomLeftRadius: fromMe ? 18 : 4,
        }}
      >
        <Text variant="bodyM" style={{ color: fromMe ? theme.color.textInverse : theme.color.text }}>
          {message.text}
        </Text>
      </View>
      <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
        {formatRelativeDate(message.createdAt)}
      </Text>
    </View>
  );
}

function ctxLabel(ctx: MessageContext) {
  return { listing: 'Annonce', rental: 'Location', trip: 'Trajet', support: 'Support' }[ctx.kind];
}
