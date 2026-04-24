import type { CallMode, CallTokenBundle } from '@/lib/stores/call';

/**
 * Abstraction d'un fournisseur d'appels RTC.
 * L'implémentation Agora est chargée à la demande (voir getCallDriver)
 * pour que l'OTA ne crash pas sur un build natif qui ne contient pas encore
 * react-native-agora.
 */
export interface CallDriver {
  /** Initialise l'engine si besoin. Appelé une fois au premier appel. */
  init(): Promise<void>;

  /** Rejoint un canal. Déclenche onJoined/onRemoteJoined côté store. */
  join(bundle: CallTokenBundle, mode: CallMode): Promise<void>;

  /** Quitte le canal courant et libère les ressources. */
  leave(): Promise<void>;

  setMicEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  setSpeakerEnabled(enabled: boolean): Promise<void>;
  switchCamera?(): Promise<void>;

  /** true si l'implémentation a accès au module natif (= build natif à jour). */
  isNativeAvailable(): boolean;
}
