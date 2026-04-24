// Stub de types. Metro résout driver-agora.native.ts (iOS/Android) ou
// driver-agora.web.ts (web) au bundle-time ; TypeScript voit les deux
// sources mais sans fichier non-préfixé il ne sait pas typer l'import.
// Ce .d.ts comble ce trou.
import type { CallDriver } from './driver';

export declare class AgoraCallDriver implements CallDriver {
  init(): Promise<void>;
  join(
    bundle: import('@/lib/stores/call').CallTokenBundle,
    mode: import('@/lib/stores/call').CallMode,
  ): Promise<void>;
  leave(): Promise<void>;
  setMicEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  setSpeakerEnabled(enabled: boolean): Promise<void>;
  switchCamera?(): Promise<void>;
  isNativeAvailable(): boolean;
}
