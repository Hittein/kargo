import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, SegmentedTabs, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useTrustStore, type Dispute } from '@/lib/stores/trust';

type Tab = 'open' | 'resolved' | 'new';

export default function TrustDisputes() {
  const theme = useTheme();
  const disputes = useTrustStore((s) => s.disputes);
  const openDispute = useTrustStore((s) => s.openDispute);
  const postUpdate = useTrustStore((s) => s.postDisputeUpdate);
  const close = useTrustStore((s) => s.closeDispute);

  const [tab, setTab] = useState<Tab>('open');

  const open = disputes.filter((d) => d.status === 'open' || d.status === 'mediation');
  const resolved = disputes.filter((d) => d.status === 'resolved' || d.status === 'rejected');
  const list = tab === 'open' ? open : tab === 'resolved' ? resolved : [];

  return (
    <Screen scroll>
      <BackHeader title="Litiges & médiation" code="K-05" />
      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { key: 'open', label: `En cours (${open.length})` },
          { key: 'resolved', label: `Clôturés (${resolved.length})` },
          { key: 'new', label: 'Ouvrir' },
        ]}
      />

      {tab === 'new' && <NewDisputeForm onCreate={(d) => { openDispute(d); setTab('open'); }} />}

      {tab !== 'new' && (
        <View style={{ gap: 8 }}>
          {list.length === 0 ? (
            <Card variant="sand">
              <Text variant="bodyM" tone="secondary" align="center">
                Aucun litige.
              </Text>
            </Card>
          ) : (
            list.map((d) => (
              <DisputeCard
                key={d.id}
                dispute={d}
                onReply={(text) => postUpdate(d.id, text, 'you')}
                onResolve={() => close(d.id, 'resolved')}
              />
            ))
          )}
        </View>
      )}
    </Screen>
  );
}

function NewDisputeForm({ onCreate }: { onCreate: (d: Omit<Dispute, 'id' | 'createdAt' | 'status' | 'updates'>) => void }) {
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const valid = subject.trim().length > 5 && desc.trim().length > 20;

  const submit = () => {
    if (!valid) return;
    onCreate({
      subject: subject.trim(),
      context: { kind: 'rental', rentalId: 'r_demo' },
      amount: amount ? parseInt(amount.replace(/\D/g, ''), 10) : undefined,
      description: desc.trim(),
      evidence: [],
    });
    setSubject('');
    setDesc('');
    setAmount('');
  };

  return (
    <Card>
      <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
        Ouvrir un litige
      </Text>
      <Input label="Objet" value={subject} onChangeText={setSubject} placeholder="Caution non remboursée" />
      <Input
        label="Description (min 20 caractères)"
        value={desc}
        onChangeText={setDesc}
        placeholder="Décrivez les faits, la chronologie, ce que vous attendez…"
        multiline
        numberOfLines={4}
        containerStyle={{ marginTop: 12 }}
      />
      <Input
        label="Montant en jeu (MRU, optionnel)"
        keyboardType="number-pad"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/\D/g, ''))}
        containerStyle={{ marginTop: 12 }}
      />
      <Button
        label="Joindre une preuve (simulation)"
        variant="secondary"
        leading={<Ionicons name="attach" size={16} />}
        onPress={() => Alert.alert('Pièce jointe ajoutée (simulation)')}
        style={{ marginTop: 12 }}
      />
      <Button label="Ouvrir le litige" onPress={submit} disabled={!valid} style={{ marginTop: 12 }} />
    </Card>
  );
}

function DisputeCard({ dispute, onReply, onResolve }: { dispute: Dispute; onReply: (t: string) => void; onResolve: () => void }) {
  const theme = useTheme();
  const [reply, setReply] = useState('');

  const tone = dispute.status === 'resolved' ? 'success' : dispute.status === 'rejected' ? 'danger' : dispute.status === 'mediation' ? 'gold' : 'primary';

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="bodyL" weight="semiBold" style={{ flex: 1 }}>
          {dispute.subject}
        </Text>
        <Badge label={statusLabel(dispute.status)} tone={tone} />
      </View>
      <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>
        Ouvert le {new Date(dispute.createdAt).toLocaleDateString('fr-FR')}
        {dispute.amount ? ` · ${dispute.amount.toLocaleString('fr-FR')} MRU` : ''}
      </Text>
      <Text variant="bodyM" style={{ marginTop: 8 }}>
        {dispute.description}
      </Text>

      <View style={{ height: 1, backgroundColor: theme.color.divider, marginVertical: 12 }} />

      <View style={{ gap: 8 }}>
        {dispute.updates.map((u, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Ionicons
              name={u.from === 'kargo' ? 'shield' : u.from === 'you' ? 'person' : 'business'}
              size={16}
              color={theme.color.textSecondary}
              style={{ marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">
                {u.from === 'you' ? 'Vous' : u.from === 'kargo' ? 'Médiateur Kargo' : 'Partenaire'} · {new Date(u.at).toLocaleString('fr-FR')}
              </Text>
              <Text variant="bodyM">{u.text}</Text>
            </View>
          </View>
        ))}
      </View>

      {(dispute.status === 'open' || dispute.status === 'mediation') && (
        <View style={{ marginTop: 12 }}>
          <Input value={reply} onChangeText={setReply} placeholder="Ajouter un message…" />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button
              label="Envoyer"
              size="sm"
              onPress={() => {
                if (!reply.trim()) return;
                onReply(reply.trim());
                setReply('');
              }}
              disabled={!reply.trim()}
            />
            <Button label="Marquer résolu" size="sm" variant="ghost" onPress={onResolve} />
          </View>
        </View>
      )}
    </Card>
  );
}

function statusLabel(s: Dispute['status']) {
  return { open: 'Ouvert', mediation: 'Médiation', resolved: 'Résolu', rejected: 'Rejeté' }[s];
}
