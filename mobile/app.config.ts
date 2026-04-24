import { ExpoConfig, ConfigContext } from 'expo/config';

// EAS project — set par `eas init` le 2026-04-24, override possible via env.
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID || '8baafdc5-34ca-4da3-86ab-9b1ca8456299';
const UPDATES_URL = `https://u.expo.dev/${EAS_PROJECT_ID}`;

// Agora App ID — public côté mobile (identifie le projet, pas secret).
// Le App Certificate reste exclusivement côté backend Render pour signer les tokens.
const AGORA_APP_ID =
  process.env.EXPO_PUBLIC_AGORA_APP_ID || 'c70d96373a9f45269b6fc4837b11cc0a';

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
      NSMicrophoneUsageDescription:
        'Kargo utilise le micro pour les appels audio avec les vendeurs et locataires.',
      // Background modes nécessaires pour que l'appel Agora survive au lock écran / app en arrière-plan.
      UIBackgroundModes: ['audio', 'voip'],
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
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MICROPHONE',
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
  updates: {
    url: UPDATES_URL,
    fallbackToCacheTimeout: 0,
  },
  extra: {
    router: { origin: false },
    eas: { projectId: EAS_PROJECT_ID },
    agoraAppId: AGORA_APP_ID,
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
