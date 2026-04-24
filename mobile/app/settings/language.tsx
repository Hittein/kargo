import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { Lang, SUPPORTED_LANGS } from '@/i18n';
import { useChangeLanguage } from '@/i18n/I18nProvider';

const META: Record<Lang, { native: string; latin: string }> = {
  fr: { native: 'Français', latin: 'French' },
  ar: { native: 'العربية', latin: 'Arabic' },
};

export default function LanguageScreen() {
  const theme = useTheme();
  const { i18n, t } = useTranslation();
  const change = useChangeLanguage();

  const handleSelect = (lang: Lang) => {
    if (lang === i18n.language) return;
    Alert.alert(
      t('settings.language'),
      lang === 'ar'
        ? 'L\'application va redémarrer pour appliquer la mise en page RTL.'
        : 'L\'application va redémarrer pour appliquer la mise en page LTR.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => change(lang) },
      ],
    );
  };

  return (
    <Screen scroll>
      <Text variant="caption" tone="secondary">
        P-05 · Paramètres
      </Text>
      <Text variant="heading1">{t('settings.language')}</Text>
      <View style={{ gap: 8 }}>
        {SUPPORTED_LANGS.map((lang) => {
          const active = i18n.language === lang;
          return (
            <Card
              key={lang}
              padding={16}
              onPress={() => handleSelect(lang)}
              style={
                active
                  ? { borderWidth: 2, borderColor: theme.color.primary }
                  : undefined
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyL" weight="semiBold">
                    {META[lang].native}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {META[lang].latin} · {lang === 'ar' ? 'RTL' : 'LTR'}
                  </Text>
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={22} color={theme.color.primary} />
                ) : null}
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
