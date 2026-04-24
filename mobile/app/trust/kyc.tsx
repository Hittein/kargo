import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card, Screen, Stepper, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTrustStore } from '@/lib/stores/trust';
import { useAuthStore } from '@/lib/stores/auth';

const STEP_LABELS = ['Pièce', 'Recto', 'Verso', 'Selfie', 'Vérification'];

export default function TrustKyc() {
  const theme = useTheme();
  const router = useRouter();
  const upload = useTrustStore((s) => s.uploadDoc);
  const setKycLevel = useAuthStore((s) => s.setKycLevel);
  const recompute = useTrustStore((s) => s.recompute);

  const [step, setStep] = useState(1);
  const [docKind, setDocKind] = useState<'CNI' | 'passport'>('CNI');
  const [scanned, setScanned] = useState({ recto: false, verso: false, selfie: false });
  const [verifying, setVerifying] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length));

  const captureRecto = () => {
    upload('id_front', `${docKind}_recto.jpg`);
    setScanned({ ...scanned, recto: true });
    setTimeout(next, 600);
  };
  const captureVerso = () => {
    upload('id_back', `${docKind}_verso.jpg`);
    setScanned({ ...scanned, verso: true });
    setTimeout(next, 600);
  };
  const captureSelfie = () => {
    upload('selfie', 'selfie_liveness.jpg');
    setScanned({ ...scanned, selfie: true });
    setTimeout(() => {
      setStep(5);
      setVerifying(true);
      setTimeout(() => {
        setKycLevel(2);
        recompute();
        setVerifying(false);
        Alert.alert('Identité vérifiée', 'Votre niveau Kargo Trust est désormais 2.', [
          { text: 'OK', onPress: () => router.replace('/trust') },
        ]);
      }, 2500);
    }, 600);
  };

  return (
    <Screen scroll>
      <BackHeader title="Vérification d'identité" code="K-02" />
      <Stepper current={step} total={STEP_LABELS.length} label={`Étape ${STEP_LABELS[step - 1]}`} />

      {step === 1 && (
        <Card>
          <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
            Quelle pièce utilisez-vous ?
          </Text>
          <View style={{ gap: 8 }}>
            <DocChoice
              icon="card"
              label="Carte nationale d'identité (CNI)"
              active={docKind === 'CNI'}
              onPress={() => setDocKind('CNI')}
            />
            <DocChoice
              icon="airplane"
              label="Passeport mauritanien"
              active={docKind === 'passport'}
              onPress={() => setDocKind('passport')}
            />
          </View>
          <Button label="Continuer" onPress={next} style={{ marginTop: 16 }} />
        </Card>
      )}

      {step === 2 && (
        <CaptureCard
          icon="camera"
          title="Photo recto"
          desc="Cadrez votre pièce dans le rectangle. La MRZ sera lue automatiquement."
          done={scanned.recto}
          onCapture={captureRecto}
        />
      )}
      {step === 3 && (
        <CaptureCard
          icon="camera-reverse"
          title="Photo verso"
          desc="Retournez votre pièce et capturez le verso."
          done={scanned.verso}
          onCapture={captureVerso}
        />
      )}
      {step === 4 && (
        <CaptureCard
          icon="happy"
          title="Selfie de vérification"
          desc="Tournez doucement la tête. Détection de vie en cours."
          done={scanned.selfie}
          onCapture={captureSelfie}
        />
      )}
      {step === 5 && (
        <Card variant="sand">
          <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
            <Ionicons
              name={verifying ? 'sync' : 'checkmark-circle'}
              size={48}
              color={verifying ? theme.color.textSecondary : theme.color.success}
            />
            <Text variant="bodyL" weight="semiBold">
              {verifying ? 'Vérification en cours…' : 'Identité validée'}
            </Text>
            <Text variant="caption" tone="secondary" align="center">
              Croisement MRZ + base civile + détection de vie. Résultat sous 30s.
            </Text>
          </View>
        </Card>
      )}

      <Card variant="sand">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="lock-closed" size={16} color={theme.color.textSecondary} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
            Vos pièces sont chiffrées de bout en bout. Conservées uniquement le temps de vérification.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function DocChoice({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Card
      padding={14}
      onPress={onPress}
      style={active ? { borderWidth: 2, borderColor: theme.color.primary } : undefined}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name={icon} size={22} color={active ? theme.color.primary : theme.color.textSecondary} />
        <Text variant="bodyM" weight="semiBold" style={{ flex: 1 }}>
          {label}
        </Text>
        {active ? <Badge label="Sélectionné" tone="primary" /> : null}
      </View>
    </Card>
  );
}

function CaptureCard({
  icon,
  title,
  desc,
  done,
  onCapture,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  done: boolean;
  onCapture: () => void;
}) {
  const theme = useTheme();
  return (
    <Card>
      <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: done ? theme.color.success : theme.color.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={done ? 'checkmark' : icon}
            size={36}
            color={done ? theme.color.textInverse : theme.color.textSecondary}
          />
        </View>
        <Text variant="bodyL" weight="semiBold">
          {title}
        </Text>
        <Text variant="caption" tone="secondary" align="center">
          {desc}
        </Text>
        <Button label={done ? 'Capturé' : 'Capturer (simulation)'} disabled={done} onPress={onCapture} />
      </View>
    </Card>
  );
}
