import { useState } from 'react';
import { View } from 'react-native';
import { Card, Screen, SegmentedTabs, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';

type Tab = 'cgu' | 'privacy' | 'cookies' | 'mentions';

const SECTIONS: Record<Tab, { title: string; paragraphs: string[] }> = {
  cgu: {
    title: 'Conditions générales d\'utilisation',
    paragraphs: [
      'Les présentes CGU régissent l\'utilisation de l\'application Kargo, éditée par Kargo SAS, immatriculée à Nouakchott.',
      'L\'utilisateur reconnaît que les services proposés (achat-vente, location, transport, wallet) sont fournis "en l\'état" et qu\'il est seul responsable des transactions qu\'il réalise.',
      'Kargo agit comme intermédiaire technique pour la marketplace et les paiements, et fournit certains services en propre (Trust, garantie, médiation).',
      'Toute fraude, fausse identité ou contournement des contrôles peut entraîner la suspension du compte sans préavis.',
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    paragraphs: [
      'Nous collectons les données strictement nécessaires : identité, contacts, données de transaction, géolocalisation pendant l\'usage actif.',
      'Vos pièces d\'identité et selfies sont chiffrés au repos (AES-256) et transitent en TLS 1.3. Conservation 5 ans après dernière activité conformément à la réglementation AML.',
      'Vos données ne sont jamais vendues. Elles peuvent être partagées avec les autorités sur réquisition légale.',
      'Vous disposez d\'un droit d\'accès, rectification, portabilité et suppression. Pour l\'exercer, écrivez à privacy@kargo.mr.',
    ],
  },
  cookies: {
    title: 'Cookies & traceurs',
    paragraphs: [
      'Notre application utilise des identifiants techniques uniquement (session, préférences) — aucun traceur publicitaire tiers n\'est embarqué.',
      'Les services analytiques sont anonymisés et hébergés en Europe.',
    ],
  },
  mentions: {
    title: 'Mentions légales',
    paragraphs: [
      'Éditeur : Kargo SAS — capital 100 000 000 MRU. Siège : Tevragh Zeina, Nouakchott. RC : 12345/2026.',
      'Directeur de la publication : Direction Générale.',
      'Hébergement : AWS Frankfurt (Allemagne).',
      'Médiateur : Comité Trust Kargo, joignable via Profil → Trust → Litiges.',
    ],
  },
};

export default function Legal() {
  const [tab, setTab] = useState<Tab>('cgu');
  const section = SECTIONS[tab];

  return (
    <Screen scroll>
      <BackHeader title="Mentions légales" code="P-09" />
      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { key: 'cgu', label: 'CGU' },
          { key: 'privacy', label: 'Confidentialité' },
          { key: 'cookies', label: 'Cookies' },
          { key: 'mentions', label: 'Mentions' },
        ]}
      />

      <Card>
        <Text variant="heading2">{section.title}</Text>
        <View style={{ gap: 12, marginTop: 12 }}>
          {section.paragraphs.map((p, i) => (
            <Text key={i} variant="bodyM" tone="secondary">
              {p}
            </Text>
          ))}
        </View>
      </Card>

      <Text variant="caption" tone="secondary" align="center" style={{ marginTop: 16 }}>
        Dernière mise à jour : avril 2026
      </Text>
    </Screen>
  );
}
