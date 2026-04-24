import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTrustStore, type KycDoc } from '@/lib/stores/trust';

const DOC_TYPES: { kind: KycDoc['kind']; label: string; help: string }[] = [
  { kind: 'id_front', label: "Pièce d'identité (recto)", help: 'Carte nationale ou passeport.' },
  { kind: 'id_back', label: "Pièce d'identité (verso)", help: 'Recto/verso identique au type au-dessus.' },
  { kind: 'license', label: 'Permis de conduire', help: 'Requis pour la location.' },
  { kind: 'selfie', label: 'Selfie de vérification', help: 'Avec détection de vie.' },
  { kind: 'address', label: 'Justificatif de domicile', help: 'Facture < 3 mois.' },
  { kind: 'rib', label: 'RIB / coordonnées bancaires', help: 'Pour remboursements.' },
];

export default function MyDocuments() {
  const theme = useTheme();
  const docs = useTrustStore((s) => s.docs);
  const upload = useTrustStore((s) => s.uploadDoc);
  const remove = useTrustStore((s) => s.removeDoc);

  const handleUpload = (kind: KycDoc['kind'], label: string) => {
    Alert.alert('Sélection (simulation)', `${label}\nQuel type de fichier ?`, [
      { text: 'Photo', onPress: () => upload(kind, `${kind}_camera.jpg`) },
      { text: 'Galerie', onPress: () => upload(kind, `${kind}_gallery.jpg`) },
      { text: 'PDF', onPress: () => upload(kind, `${kind}_doc.pdf`) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  return (
    <Screen scroll>
      <BackHeader title="Documents & KYC" code="P-04" />
      <Card variant="sand">
        <Text variant="bodyM" tone="secondary">
          Vos pièces sont stockées chiffrées. Elles servent à vérifier votre identité (KYC), valider une location,
          ou résoudre un litige.
        </Text>
      </Card>

      {DOC_TYPES.map((d) => {
        const uploaded = docs.find((x) => x.kind === d.kind);
        return (
          <Card key={d.kind}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="document" size={22} color={theme.color.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyM" weight="semiBold">
                  {d.label}
                </Text>
                <Text variant="caption" tone="secondary">
                  {d.help}
                </Text>
                {uploaded ? (
                  <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
                    {uploaded.fileName} · ajouté {new Date(uploaded.uploadedAt).toLocaleDateString('fr-FR')}
                  </Text>
                ) : null}
              </View>
              {uploaded ? <StatusBadge status={uploaded.status} /> : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                label={uploaded ? 'Remplacer' : 'Téléverser'}
                variant={uploaded ? 'secondary' : 'primary'}
                size="sm"
                onPress={() => handleUpload(d.kind, d.label)}
              />
              {uploaded ? (
                <Button
                  label="Supprimer"
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    Alert.alert('Supprimer ?', 'Le document sera retiré de votre dossier.', [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Supprimer', style: 'destructive', onPress: () => remove(uploaded.id) },
                    ])
                  }
                />
              ) : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

function StatusBadge({ status }: { status: KycDoc['status'] }) {
  if (status === 'approved') return <Badge label="Validé" tone="success" />;
  if (status === 'rejected') return <Badge label="Refusé" tone="danger" />;
  return <Badge label="En cours" tone="gold" />;
}
