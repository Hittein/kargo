import type { CallDriver } from './driver';
import type { CallMode, CallTokenBundle } from '@/lib/stores/call';
import { useCallStore } from '@/lib/stores/call';

/**
 * Driver fallback quand react-native-agora n'est pas présent dans le build natif
 * (typiquement : OTA reçue avant le prochain rebuild TestFlight).
 *
 * Simule un join instantané + ne produit aucun son. Sert à vérifier toute l'UI
 * (écran d'appel, floating bubble, statut, chat pendant l'appel) sans crasher.
 * Ne publie ni n'entend aucun audio réel.
 */
export class MockCallDriver implements CallDriver {
  private joined = false;

  async init(): Promise<void> {
    if (__DEV__) {
      console.warn(
        '[call] MockCallDriver active — native Agora module not bundled. Voice will NOT work until next native rebuild.',
      );
    }
  }

  async join(_bundle: CallTokenBundle, _mode: CallMode): Promise<void> {
    this.joined = true;
    setTimeout(() => {
      useCallStore.getState().onJoined();
    }, 300);
  }

  async leave(): Promise<void> {
    this.joined = false;
  }

  async setMicEnabled(_enabled: boolean): Promise<void> {}
  async setCameraEnabled(_enabled: boolean): Promise<void> {}
  async setSpeakerEnabled(_enabled: boolean): Promise<void> {}
  async switchCamera(): Promise<void> {}

  isNativeAvailable(): boolean {
    return false;
  }
}
