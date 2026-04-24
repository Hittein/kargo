import { ExpoConfig, ConfigContext } from 'expo/config';

// EAS project + updates URL — to be filled in after `eas init` (see RUNBOOK).
// Until then, OTA is inactive but the app still ships from the bundled JS.
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID || '';
const UPDATES_URL = EAS_PROJECT_ID ? `https://u.expo.dev/${EAS_PROJECT_ID}` : undefined;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Kargo',
  slug: 'kargo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'kargo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  primaryColor: '#FF6B35',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.kargo.client',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      NSCameraUsageDescription:
        "Kargo a besoin de la caméra pour scanner le VIN, prendre des photos d'annonces et lire les QR codes.",
      NSPhotoLibraryUsageDescription:
        "Kargo accède à vos photos pour les annonces véhicule et les états des lieux de location.",
      NSLocationWhenInUseUsageDescription:
        'Kargo utilise votre position pour afficher les annonces et trajets près de vous.',
      NSFaceIDUsageDescription:
        'Kargo utilise Face ID pour sécuriser votre wallet et valider les paiements.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.kargo.client',
    adaptiveIcon: {
      backgroundColor: '#0A1628',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
      'android.permission.NFC',
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0A1628',
        dark: { backgroundColor: '#0A1628' },
      },
    ],
    'expo-secure-store',
    [
      'expo-build-properties',
      {
        ios: { deploymentTarget: '16.0' },
        android: { minSdkVersion: 24 },
      },
    ],
  ],
  // OTA: appVersion policy means every JS-only update of the same `version`
  // (here 1.0.0) ships via `eas update --branch production` without a rebuild.
  // Bumping `version` here triggers a new native build + a new TestFlight submit.
  runtimeVersion: { policy: 'appVersion' },
  updates: UPDATES_URL
    ? {
        url: UPDATES_URL,
        fallbackToCacheTimeout: 0,
      }
    : undefined,
  extra: {
    router: { origin: false },
    eas: EAS_PROJECT_ID ? { projectId: EAS_PROJECT_ID } : undefined,
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
