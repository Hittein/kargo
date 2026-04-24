import type { CallDriver } from './driver';
import { MockCallDriver } from './driver-mock';
import { callsApi } from '@/lib/api';
import { useCallStore, type CallMode, type CallPeer } from '@/lib/stores/call';

let driverInstance: CallDriver | null = null;
let driverIsMock = false;

/**
 * Retourne le driver d'appel. Tente Agora natif d'abord ; si l'init throw
 * (module natif absent — OTA antérieur au rebuild), bascule sur un mock qui
 * garde l'UI fonctionnelle (sans audio).
 */
export async function getCallDriver(): Promise<CallDriver> {
  if (driverInstance) return driverInstance;
  try {
    // Chargement dynamique : si react-native-agora n'est pas dans le bundle
    // natif, require() throw → on tombe sur le mock.
    const mod = await import('./driver-agora');
    const d = new mod.AgoraCallDriver();
    await d.init();
    driverInstance = d;
    driverIsMock = false;
    return d;
  } catch (e) {
    if (__DEV__) console.warn('[call] falling back to mock driver:', e);
    const d = new MockCallDriver();
    await d.init();
    driverInstance = d;
    driverIsMock = true;
    return d;
  }
}

export function isCallDriverMock(): boolean {
  return driverIsMock;
}

/** Orchestration : point d'entrée pour démarrer un appel depuis une conversation. */
export async function startCall(params: {
  conversationId: string;
  peer: CallPeer;
  mode: CallMode;
}): Promise<void> {
  const store = useCallStore.getState();
  store.begin({ ...params, outgoing: true });

  try {
    const resp = await callsApi.issueToken({
      conversationId: params.conversationId,
      mode: params.mode,
    });
    const bundle = {
      appId: resp.appId,
      channelName: resp.channelName,
      uid: resp.uid,
      token: resp.token,
      mode: resp.mode,
      ttlSeconds: resp.ttlSeconds,
    };
    store.setBundle(bundle);
    const driver = await getCallDriver();
    await driver.join(bundle, params.mode);
    // onJoined arrivera via le driver event.
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : 'Impossible de démarrer l\'appel. Vérifiez votre connexion.';
    store.onError(msg);
  }
}

/** Terminate + release driver. */
export async function endCall(): Promise<void> {
  const store = useCallStore.getState();
  store.end();
  try {
    const driver = await getCallDriver();
    await driver.leave();
  } catch {
    /* ignore */
  }
  // Petit délai pour laisser l'UI afficher "Appel terminé" avant reset.
  setTimeout(() => useCallStore.getState().reset(), 800);
}

/** Wire store → driver pour mute/camera/speaker. À appeler depuis les boutons UI. */
export async function setMic(enabled: boolean) {
  const store = useCallStore.getState();
  store.toggleMic();
  try {
    const driver = await getCallDriver();
    await driver.setMicEnabled(enabled);
  } catch {}
}

export async function setCamera(enabled: boolean) {
  const store = useCallStore.getState();
  store.toggleCamera();
  try {
    const driver = await getCallDriver();
    await driver.setCameraEnabled(enabled);
  } catch {}
}

export async function setSpeaker(enabled: boolean) {
  const store = useCallStore.getState();
  store.toggleSpeaker();
  try {
    const driver = await getCallDriver();
    await driver.setSpeakerEnabled(enabled);
  } catch {}
}
