import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCallDuration, useCallStore } from '@/lib/stores/call';
import { endCall, setMic } from '@/lib/call';

/**
 * Overlay global monté au-dessus du Stack expo-router.
 *
 * Comportement :
 *  - status ∈ {idle, ended} → rend null.
 *  - On est sur /call/[conversationId] → rend null (l'écran plein prend le relais).
 *  - Sinon → petite barre de statut fixe en haut ("Appel en cours · mm:ss · tap pour rouvrir")
 *    + mini bubble en bas à droite (raccrocher rapide + mute).
 */
export function CallOverlay() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const status = useCallStore((s) => s.status);
  const peer = useCallStore((s) => s.peer);
  const conversationId = useCallStore((s) => s.conversationId);
  const connectedAt = useCallStore((s) => s.connectedAt);
  const startedAt = useCallStore((s) => s.startedAt);
  const micEnabled = useCallStore((s) => s.micEnabled);

  const [, tick] = useState(0);
  useEffect(() => {
    if (status !== 'active') return;
    const h = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(h);
  }, [status]);

  if (status === 'idle' || status === 'ended') return null;

  // Si on est sur l'écran d'appel plein, overlay OFF.
  const onCallScreen = segments[0] === 'call';
  if (onCallScreen) return null;

  const label =
    status === 'connecting'
      ? 'Appel en cours…'
      : formatCallDuration(connectedAt ?? startedAt);

  const openFullScreen = () => {
    if (!conversationId) return;
    useCallStore.getState().setExpanded(true);
    router.push(`/call/${conversationId}` as never);
  };

  return (
    <>
      {/* Top status bar fixe */}
      <Pressable
        onPress={openFullScreen}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#10B981',
          paddingTop: 44,
          paddingBottom: 6,
          paddingHorizontal: 16,
          zIndex: 9998,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Ionicons name="call" size={14} color="#fff" />
        <Text variant="caption" weight="semiBold" style={{ color: '#fff', flex: 1 }}>
          Appel en cours · {peer?.name ?? ''} · {label}
        </Text>
        <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Tap pour rouvrir
        </Text>
      </Pressable>

      {/* Floating bubble en bas à droite : raccrocher + mute rapide */}
      <View
        style={{
          position: 'absolute',
          right: 14,
          bottom: 100,
          zIndex: 9999,
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
        }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={openFullScreen}
          style={({ pressed }) => ({
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#0B1220',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 6,
            opacity: pressed ? 0.85 : 1,
            borderWidth: 2,
            borderColor: '#10B981',
          })}
        >
          <Text variant="bodyM" weight="bold" style={{ color: '#fff', fontSize: 18 }}>
            {(peer?.name || '?').slice(0, 1).toUpperCase()}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pressable
            onPress={() => setMic(!micEnabled)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: micEnabled ? '#0B1220' : '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.color.border,
            }}
          >
            <Ionicons
              name={micEnabled ? 'mic' : 'mic-off'}
              size={16}
              color={micEnabled ? '#fff' : '#0B1220'}
            />
          </Pressable>
          <Pressable
            onPress={() => endCall()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#DC2626',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="call"
              size={14}
              color="#fff"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
}
