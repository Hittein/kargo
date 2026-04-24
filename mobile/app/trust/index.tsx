import { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Card, Screen, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTrustStore } from '@/lib/stores/trust';
import { useAuthStore } from '@/lib/stores/auth';

const BADGE_LABELS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  phone: { label: 'Téléphone vérifié', icon: 'call' },
  email: { label: 'Email vérifié', icon: 'mail' },
  id: { label: "Pièce d'identité", icon: 'card' },
  license: { label: 'Permis vérifié', icon: 'car-sport' },
  selfie: { label: 'Selfie liveness', icon: 'happy' },
  garantie: { label: 'Garantie active', icon: 'shield-checkmark' },
};

export default function TrustHome() {
  const theme = useTheme();
  const router = useRouter();
  const trustScore = useTrustStore((s) => s.trustScore);
  const badges = useTrustStore((s) => s.badges);
  const docs = useTrustStore((s) => s.docs);
  const disputes = useTrustStore((s) => s.disputes);
  const garantieActive = useTrustStore((s) => s.garantieActive);
  const recompute = useTrustStore((s) => s.recompute);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    recompute();
  }, [recompute]);

  const tier = trustScore >= 80 ? 'Élite' : trustScore >= 60 ? 'Confirmé' : trustScore >= 40 ? 'Standard' : 'Débutant';
  const tierColor = trustScore >= 80 ? '#7C3AED' : trustScore >= 60 ? '#10B981' : trustScore >= 40 ? '#F7B500' : '#94A3B8';

  return (
    <Screen scroll>
      <BackHeader title="Kargo Trust" code="K-01" />

      <Card style={{ backgroundColor: tierColor, padding: 22 }}>
        <Text variant="caption" style={{ color: theme.color.textInverse, opacity: 0.85 }}>
          Score Kargo Trust
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <Text variant="displayL" weight="bold" style={{ color: theme.color.textInverse }}>
            {trustScore}
          </Text>
          <Text variant="bodyL" weight="semiBold" style={{ color: theme.color.textInverse, opacity: 0.85 }}>
            / 100
          </Text>
        </View>
        <Badge label={`Niveau ${tier}`} tone="neutral" style={{ marginTop: 8 }} />
      </Card>

      <Text variant="heading2">Vos badges</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(BADGE_LABELS).map(([key, meta]) => {
          const earned = badges.includes(key);
          return (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: earned ? theme.color.success : theme.color.bgElevated,
              }}
            >
              <Ionicons name={meta.icon} size={14} color={earned ? theme.color.textInverse : theme.color.textSecondary} />
              <Text variant="caption" weight="semiBold" style={{ color: earned ? theme.color.textInverse : theme.color.text }}>
                {meta.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text variant="heading2">Augmenter votre score</Text>
      <View style={{ gap: 8 }}>
        <ActionCard
          icon="card"
          title="Vérifier mon identité"
          desc="MRZ + selfie liveness · 90 secondes"
          done={user?.kycLevel ? user.kycLevel >= 2 : false}
          onPress={() => router.push('/trust/kyc')}
        />
        <ActionCard
          icon="document"
          title="Téléverser permis & RIB"
          desc={`${docs.length} document(s) en dossier`}
          done={docs.length >= 2}
          onPress={() => router.push('/settings/documents')}
        />
        <ActionCard
          icon="shield-checkmark"
          title="Activer la Garantie Kargo"
          desc="Couverture jusqu'à 500 000 MRU"
          done={garantieActive}
          onPress={() => router.push('/trust/garantie')}
        />
        <ActionCard
          icon="search"
          title="Demander une inspection véhicule"
          desc="Kargo Verified · 80 points"
          done={false}
          onPress={() => router.push('/trust/inspection')}
        />
      </View>

      <Text variant="heading2">Activité Trust</Text>
      <View style={{ gap: 8 }}>
        <ActionCard
          icon="alert-circle"
          title={`Litiges (${disputes.length})`}
          desc={
            disputes.length === 0
              ? 'Aucun litige en cours'
              : `${disputes.filter((d) => d.status !== 'resolved').length} ouverts`
          }
          done={false}
          onPress={() => router.push('/trust/disputes')}
        />
      </View>
    </Screen>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  done,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  done: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: done ? theme.color.success : theme.color.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={done ? 'checkmark' : icon}
            size={20}
            color={done ? theme.color.textInverse : theme.color.textSecondary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyM" weight="semiBold">
            {title}
          </Text>
          <Text variant="caption" tone="secondary">
            {desc}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.color.textSecondary} />
      </View>
    </Card>
  );
}
