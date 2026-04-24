import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import {
  formatCallDuration,
  useCallStore,
  type CallMode,
} from '@/lib/stores/call';
import { endCall, isCallDriverMock, setCamera, setMic, setSpeaker } from '@/lib/call';

export default function CallScreen() {
  const theme = useTheme();
  const router = useRouter();
  const store = useCallStore();
  const [, forceTick] = useState(0);

  // Tick pour rafraîchir le chrono.
  useEffect(() => {
    if (store.status !== 'active') return;
    const handle = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(handle);
  }, [store.status]);

  useEffect(() => {
    if (store.status === 'idle') {
      // Plus d'appel → retour en arrière.
      router.back();
    }
  }, [store.status, router]);

  const { peer, mode, status, micEnabled, cameraEnabled, speakerOn, error } = store;

  const statusLabel = (() => {
    if (status === 'connecting') return 'Appel en cours…';
    if (status === 'active') return formatCallDuration(store.connectedAt ?? store.startedAt);
    if (status === 'ended') return 'Appel terminé';
    return '';
  })();

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220' }}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header avec minimize */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 8,
          }}
        >
          <Pressable
            onPress={() => {
              useCallStore.getState().setExpanded(false);
              router.back();
            }}
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text
              variant="caption"
              weight="semiBold"
              style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}
            >
              {mode === 'video' ? 'APPEL VIDÉO' : 'APPEL AUDIO'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Peer info */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              variant="heading1"
              weight="bold"
              style={{ color: '#fff', fontSize: 44 }}
            >
              {(peer?.name || '?').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text variant="heading1" weight="bold" style={{ color: '#fff' }}>
            {peer?.name || 'Inconnu'}
          </Text>
          <Text
            variant="bodyM"
            style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 0.3 }}
          >
            {statusLabel}
          </Text>
          {error ? (
            <Text variant="caption" style={{ color: '#F87171', marginTop: 4 }}>
              {error}
            </Text>
          ) : null}
          {isCallDriverMock() ? (
            <View
              style={{
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: 'rgba(251,191,36,0.15)',
                borderRadius: 6,
              }}
            >
              <Text variant="caption" style={{ color: '#FBBF24' }}>
                Mode démo (audio indisponible sur ce build)
              </Text>
            </View>
          ) : null}
        </View>

        {/* Controls */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 24,
          }}
        >
          <IconCircle
            icon={micEnabled ? 'mic' : 'mic-off'}
            active={!micEnabled}
            onPress={() => setMic(!micEnabled)}
          />
          <IconCircle
            icon={cameraEnabled ? 'videocam' : 'videocam-off'}
            active={!cameraEnabled}
            onPress={() => setCamera(!cameraEnabled)}
          />
          <IconCircle
            icon={speakerOn ? 'volume-high' : 'volume-medium'}
            active={speakerOn}
            onPress={() => setSpeaker(!speakerOn)}
          />
          <IconCircle
            icon={mode === 'video' ? 'call' : 'videocam'}
            onPress={() => useCallStore.getState().switchMode(mode === 'video' ? 'audio' : 'video')}
          />
          <Pressable
            onPress={() => endCall()}
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: '#DC2626',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#DC2626',
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function IconCircle({
  icon,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={22} color={active ? '#0B1220' : '#fff'} />
    </Pressable>
  );
}
