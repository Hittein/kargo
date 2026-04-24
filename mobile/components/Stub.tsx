import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { SCREENS, ScreenCode } from '@/lib/screen-codes';

type StubProps = {
  /** Codified screen ID per cahier v4.0 §11 (e.g. "T-12", "A-03"). When set, title/module/description are pulled from the registry. */
  code?: ScreenCode;
  /** Override registry title. */
  title?: string;
  /** Override registry description. */
  description?: string;
  /** Override registry module. */
  module?: string;
  children?: React.ReactNode;
};

export function Stub({ code, title, description, module, children }: StubProps) {
  const router = useRouter();
  const meta = code ? SCREENS[code] : undefined;
  const finalTitle = title ?? meta?.title ?? 'Écran';
  const finalDescription = description ?? meta?.description;
  const finalModule = module ?? meta?.module;

  return (
    <Screen scroll>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {code ? <Badge label={code} tone="primary" /> : null}
          {finalModule ? <Badge label={finalModule} tone="neutral" /> : null}
        </View>
        <Text variant="heading1">{finalTitle}</Text>
        {finalDescription ? (
          <Text variant="bodyM" tone="secondary">
            {finalDescription}
          </Text>
        ) : null}
        <Card variant="sand">
          <Text variant="caption" tone="secondary">
            Phase 0 — écran à implémenter dans la phase produit correspondante (cf. cahier des charges v4.0 §11).
          </Text>
        </Card>
        {children}
        {router.canGoBack() ? (
          <Button label="Retour" variant="secondary" onPress={() => router.back()} />
        ) : null}
      </View>
    </Screen>
  );
}
