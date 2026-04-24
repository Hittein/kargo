import type { CallDriver } from './driver';

/**
 * Stub web : react-native-agora n'est pas disponible sur web. getCallDriver()
 * catch l'erreur et retombe sur le mock driver.
 */
export class AgoraCallDriver implements CallDriver {
  async init(): Promise<void> {
    throw new Error('agora_not_supported_on_web');
  }
  async join(): Promise<void> {
    throw new Error('agora_not_supported_on_web');
  }
  async leave(): Promise<void> {}
  async setMicEnabled(): Promise<void> {}
  async setCameraEnabled(): Promise<void> {}
  async setSpeakerEnabled(): Promise<void> {}
  isNativeAvailable(): boolean {
    return false;
  }
}
