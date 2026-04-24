import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Input, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';

const FAQ = [
  {
    cat: 'Compte',
    items: [
      { q: 'Comment vérifier mon identité ?', a: 'Allez dans Profil → Documents & KYC, puis téléversez votre pièce et faites un selfie de vie.' },
      { q: 'Puis-je changer mon numéro ?', a: 'Oui, depuis Profil → Mon profil. Un nouvel OTP sera envoyé sur le nouveau numéro.' },
    ],
  },
  {
    cat: 'Paiement',
    items: [
      { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Bankily, Masrvi, Sedad, Wallety, carte bancaire, et le wallet Kargo.' },
      { q: 'Comment être remboursé ?', a: 'Les remboursements sont automatiques sous 7 jours sur le moyen de paiement utilisé.' },
    ],
  },
  {
    cat: 'Transport',
    items: [
      { q: 'Comment annuler un billet ?', a: 'Mes billets → Détail → Annuler. Les frais varient selon la compagnie et le délai.' },
      { q: 'Mon billet est-il valable hors ligne ?', a: 'Oui, le QR est stocké localement et utilisable sans réseau.' },
    ],
  },
  {
    cat: 'Location',
    items: [
      { q: 'Puis-je annuler une location ?', a: "Annulation gratuite jusqu'à 24 h avant la prise du véhicule." },
      { q: 'Comment fonctionne la caution ?', a: 'La caution est gelée sur votre wallet à la prise et libérée à la restitution si pas de dégâts.' },
    ],
  },
  {
    cat: 'Trust & litiges',
    items: [
      { q: 'Comment ouvrir un litige ?', a: 'Profil → Trust → Litiges → Ouvrir.' },
      { q: 'Que couvre la Garantie Kargo ?', a: 'Vice caché 12 mois, médiation prioritaire, assistance routière.' },
    ],
  },
];

export default function Help() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.map((cat) => ({
      ...cat,
      items: cat.items.filter((it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)),
    })).filter((c) => c.items.length > 0);
  }, [query]);

  return (
    <Screen scroll>
      <BackHeader title="Centre d'aide" code="P-06" />

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher une question…"
        leading={<Ionicons name="search" size={18} color={theme.color.textSecondary} />}
      />

      <Card padding={14} onPress={() => router.push('/support/contact')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ionicons name="chatbubbles" size={22} color={theme.color.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyM" weight="semiBold">
              Discuter avec un humain
            </Text>
            <Text variant="caption" tone="secondary">
              Réponse en moins de 5 min en heures ouvrées
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
        </View>
      </Card>

      {filtered.map((cat) => (
        <View key={cat.cat} style={{ gap: 8 }}>
          <Text variant="heading2">{cat.cat}</Text>
          {cat.items.map((it) => {
            const expanded = open === `${cat.cat}_${it.q}`;
            return (
              <Card key={it.q} padding={14} onPress={() => setOpen(expanded ? null : `${cat.cat}_${it.q}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }}>
                    {it.q}
                  </Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.color.textSecondary} />
                </View>
                {expanded ? (
                  <Text variant="bodyM" tone="secondary" style={{ marginTop: 8 }}>
                    {it.a}
                  </Text>
                ) : null}
              </Card>
            );
          })}
        </View>
      ))}

      {filtered.length === 0 ? (
        <Card variant="sand">
          <Text variant="bodyM" tone="secondary" align="center">
            Aucune question trouvée. Essayez un autre mot-clé ou contactez-nous.
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
