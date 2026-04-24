import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

export const SUPPORTED_LANGS = ['fr', 'ar'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const RTL_LANGS: readonly Lang[] = ['ar'];

const STORAGE_KEY = 'kargo:lang';

let cachedLang: Lang | null = null;

export function getCachedLang(): Lang | null {
  return cachedLang;
}

export async function loadStoredLang(): Promise<Lang | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
      cachedLang = stored as Lang;
      return cachedLang;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function setStoredLang(lang: Lang) {
  cachedLang = lang;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

function detectDeviceLang(): Lang {
  const deviceLang = getLocales()[0]?.languageCode ?? 'fr';
  return (SUPPORTED_LANGS as readonly string[]).includes(deviceLang)
    ? (deviceLang as Lang)
    : 'fr';
}

export const initialLang: Lang = detectDeviceLang();

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: initialLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  returnNull: false,
});

export default i18n;
