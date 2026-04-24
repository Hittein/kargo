import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/lib/stores/auth';
import { useTrustStore } from '@/lib/stores/trust';
import { useNotificationsStore } from '@/lib/stores/notifications';

type Item = {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const trustScore = useTrustStore((s) => s.trustScore);
  const unread = useNotificationsStore((s) => s.unreadCount());

  const ITEMS: Item[] = [
    { label: 'Mon profil', href: '/settings/profile', icon: 'person-circle' },
    { label: 'Wallet', href: '/wallet', icon: 'wallet' },
    { label: 'Kargo Trust', href: '/trust', icon: 'shield-checkmark', badge: `${trustScore}` },
    { label: 'Mes annonces', href: '/settings/my-listings', icon: 'pricetag' },
    { label: 'Mes recherches', href: '/marketplace/alerts', icon: 'bookmark' },
    { label: 'Mes locations', href: '/rental/my-rentals', icon: 'key' },
    { label: 'Mes billets', href: '/(tabs)/tickets', icon: 'ticket' },
    { label: 'Mes favoris', href: '/settings/favorites', icon: 'heart' },
    { label: 'Mes paiements', href: '/settings/payments', icon: 'time' },
    { label: 'Documents & KYC', href: '/settings/documents', icon: 'document' },
    { label: 'Mes avis', href: '/settings/reviews', icon: 'star' },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: 'notifications',
      badge: unread > 0 ? String(unread) : undefined,
    },
    { label: 'Préférences notifs', href: '/notifications/preferences', icon: 'options' },
    { label: 'Langue & région', href: '/settings/language', icon: 'language' },
    { label: 'Sécurité', href: '/settings/security', icon: 'lock-closed' },
    { label: 'Aide', href: '/support/help', icon: 'help-circle' },
    { label: 'Mentions légales', href: '/support/legal', icon: 'document-text' },
    { label: 'À propos', href: '/settings/about', icon: 'information-circle' },
  ];

  const initial = (user?.name || user?.phone || 'K').slice(0, 1).toUpperCase();

  const onSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Screen scroll>
      <Text variant="heading1">Profil</Text>
      <Card onPress={() => router.push('/settings/profile')}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.color.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="heading2" style={{ color: theme.color.textInverse }}>
              {initial}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyL" weight="semiBold">
              {user?.name || 'Mon profil'}
            </Text>
            <Text variant="caption" tone="secondary">
              {user?.phone ?? '—'} · Trust {trustScore}/100
            </Text>
          </View>
          {user?.kycLevel && user.kycLevel >= 1 ? (
            <Badge label="Vérifié" tone="success" />
          ) : (
            <Badge label="À vérifier" tone="gold" />
          )}
        </View>
      </Card>
      <View style={{ gap: 8 }}>
        {ITEMS.map((it) => (
          <Card key={it.href} onPress={() => router.push(it.href as never)} padding={14}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name={it.icon} size={20} color={theme.color.textSecondary} />
              <Text variant="bodyL" style={{ flex: 1 }}>
                {it.label}
              </Text>
              {it.badge ? <Badge label={it.badge} tone="primary" /> : null}
              <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
            </View>
          </Card>
        ))}
      </View>
      <Button label="Se déconnecter" variant="ghost" onPress={onSignOut} />
    </Screen>
  );
}
