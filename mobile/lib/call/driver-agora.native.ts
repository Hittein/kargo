import type { CallDriver } from './driver';
import type { CallMode, CallTokenBundle } from '@/lib/stores/call';
import { useCallStore } from '@/lib/stores/call';

/**
 * Driver Agora réel. Utilise `react-native-agora` v4.
 *
 * Le module est chargé via require() dans init() pour qu'une simple import de
 * ce fichier ne fasse pas crasher le bundle sur un build natif où le module
 * n'est pas présent.
 *
 * Pattern : getCallDriver() tente Agora en premier ; si init() throw, on bascule
 * sur MockCallDriver.
 */
export class AgoraCallDriver implements CallDriver {
  // Typed as any parce que react-native-agora est require()-ed à la demande.
  // On garde l'instance et le module dans la classe.
  private engine: any = null;
  private rn: any = null;
  private mod: any = null;
  private joined = false;
  private currentUid: number | null = null;

  async init(): Promise<void> {
    if (this.engine) return;
    // require() dynamique — évite un crash du bundle si le module natif n'est pas là.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    this.mod = require('react-native-agora');
    this.engine = this.mod.createAgoraRtcEngine();

    const extra = (await import('expo-constants')).default.expoConfig?.extra as
      | { agoraAppId?: string }
      | undefined;
    const appId = extra?.agoraAppId || '';
    if (!appId) throw new Error('Agora appId missing in expoConfig.extra.agoraAppId');

    this.engine.initialize({
      appId,
      channelProfile: this.mod.ChannelProfileType.ChannelProfileCommunication1v1,
    });
    this.engine.enableAudio();
    this.engine.registerEventHandler({
      onJoinChannelSuccess: (_connection: unknown, _elapsed: number) => {
        useCallStore.getState().onJoined();
      },
      onUserJoined: (_connection: unknown, remoteUid: number, _elapsed: number) => {
        useCallStore.getState().onRemoteJoined(remoteUid);
      },
      onUserOffline: (_connection: unknown, remoteUid: number, _reason: unknown) => {
        useCallStore.getState().onRemoteLeft(remoteUid);
      },
      onUserMuteAudio: (_connection: unknown, remoteUid: number, muted: boolean) => {
        useCallStore.getState().onRemoteAudio(remoteUid, !muted);
      },
      onUserMuteVideo: (_connection: unknown, remoteUid: number, muted: boolean) => {
        useCallStore.getState().onRemoteVideo(remoteUid, !muted);
      },
      onError: (err: number, msg: string) => {
        if (__DEV__) console.warn('[agora] onError', err, msg);
      },
    });
  }

  async join(bundle: CallTokenBundle, mode: CallMode): Promise<void> {
    await this.init();
    if (!this.engine || !this.mod) throw new Error('engine_not_initialized');

    if (mode === 'video') {
      this.engine.enableVideo();
      this.engine.startPreview();
    } else {
      this.engine.disableVideo();
    }

    this.currentUid = bundle.uid;
    this.engine.joinChannel(bundle.token, bundle.channelName, bundle.uid, {
      channelProfile: this.mod.ChannelProfileType.ChannelProfileCommunication1v1,
      clientRoleType: this.mod.ClientRoleType.ClientRoleBroadcaster,
      publishMicrophoneTrack: true,
      publishCameraTrack: mode === 'video',
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
    });
    this.joined = true;
  }

  async leave(): Promise<void> {
    if (!this.engine) return;
    try {
      if (this.joined) this.engine.leaveChannel();
    } catch {
      /* ignore */
    }
    try {
      this.engine.stopPreview();
    } catch {
      /* ignore */
    }
    this.joined = false;
  }

  async setMicEnabled(enabled: boolean): Promise<void> {
    if (!this.engine) return;
    this.engine.muteLocalAudioStream(!enabled);
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    if (!this.engine) return;
    if (enabled) {
      this.engine.enableVideo();
      this.engine.startPreview();
      this.engine.muteLocalVideoStream(false);
    } else {
      this.engine.muteLocalVideoStream(true);
    }
  }

  async setSpeakerEnabled(enabled: boolean): Promise<void> {
    if (!this.engine) return;
    this.engine.setEnableSpeakerphone(enabled);
  }

  async switchCamera(): Promise<void> {
    if (!this.engine) return;
    this.engine.switchCamera();
  }

  isNativeAvailable(): boolean {
    return !!this.engine;
  }
}
