import { useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import i18n, {
  Lang,
  RTL_LANGS,
  initialLang,
  loadStoredLang,
  setStoredLang,
} from './index';

function isRTL(lang: Lang) {
  return RTL_LANGS.includes(lang);
}

async function reloadApp() {
  try {
    const Updates = await import('expo-updates');
    await Updates.reloadAsync();
  } catch {
    // expo-updates not available in Expo Go dev — RTL change applies on next launch
  }
}

async function applyDirectionAndReload(lang: Lang) {
  const targetRTL = isRTL(lang);
  if (I18nManager.isRTL !== targetRTL) {
    I18nManager.allowRTL(targetRTL);
    I18nManager.forceRTL(targetRTL);
    await reloadApp();
  }
}

export function useChangeLanguage() {
  return useCallback(async (lang: Lang) => {
    await setStoredLang(lang);
    await i18n.changeLanguage(lang);
    await applyDirectionAndReload(lang);
  }, []);
}

export function I18nGate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      const stored = await loadStoredLang();
      const active = stored ?? initialLang;
      if (i18n.language !== active) {
        await i18n.changeLanguage(active);
      }
      const targetRTL = isRTL(active);
      if (I18nManager.isRTL !== targetRTL) {
        I18nManager.allowRTL(targetRTL);
        I18nManager.forceRTL(targetRTL);
      }
    })();
  }, []);
  return <>{children}</>;
}
