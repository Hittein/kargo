import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, Input, Screen, SegmentedTabs, Text } from '@/components/ui';
import { BackHeader } from '@/components/BackHeader';
import { useTheme } from '@/theme/ThemeProvider';
import { useReviewsStore, type Review } from '@/lib/stores/reviews';

type Tab = 'given' | 'received';

export default function MyReviews() {
  const theme = useTheme();
  const given = useReviewsStore((s) => s.given);
  const received = useReviewsStore((s) => s.received);
  const removeReview = useReviewsStore((s) => s.remove);
  const addReview = useReviewsStore((s) => s.add);
  const [tab, setTab] = useState<Tab>('given');

  const list = tab === 'given' ? given : received;

  const newReview = () =>
    Alert.prompt?.('Nouveau commentaire', 'Note de 1 à 5 ?', (answer) => {
      const rating = Math.max(1, Math.min(5, parseInt(answer ?? '5', 10))) as 1 | 2 | 3 | 4 | 5;
      addReview({
        kind: 'company',
        targetId: 'cmp_demo',
        targetName: 'Compagnie test',
        rating,
        comment: 'Avis ajouté depuis l\'app (simulation).',
      });
    });

  return (
    <Screen scroll>
      <BackHeader title="Mes avis" code="P-07" />
      <SegmentedTabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        items={[
          { key: 'given', label: `Donnés (${given.length})` },
          { key: 'received', label: `Reçus (${received.length})` },
        ]}
      />

      {tab === 'given' && (
        <ReviewForm onAdd={addReview} />
      )}

      <View style={{ gap: 8 }}>
        {list.length === 0 ? (
          <Card variant="sand">
            <Text variant="bodyM" tone="secondary" align="center">
              {tab === 'given' ? "Vous n'avez encore donné aucun avis." : "Vous n'avez encore reçu aucun avis."}
            </Text>
          </Card>
        ) : (
          list.map((r) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Badge label={kindLabel(r.kind)} tone="neutral" />
                  <Text variant="bodyM" weight="semiBold">
                    {r.targetName}
                  </Text>
                </View>
                <Stars rating={r.rating} />
              </View>
              <Text variant="bodyM">{r.comment}</Text>
              <Text variant="caption" tone="secondary" style={{ marginTop: 6 }}>
                {new Date(r.createdAt).toLocaleDateString('fr-FR')}
              </Text>
              {tab === 'given' ? (
                <View style={{ marginTop: 8 }}>
                  <Button
                    label="Supprimer"
                    variant="ghost"
                    size="sm"
                    onPress={() => removeReview(r.id)}
                  />
                </View>
              ) : null}
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

function ReviewForm({ onAdd }: { onAdd: (r: Omit<Review, 'id' | 'createdAt'>) => string }) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [kind, setKind] = useState<Review['kind']>('seller');

  const submit = () => {
    if (!name.trim() || !comment.trim()) return;
    onAdd({ kind, targetId: name.toLowerCase().replace(/\s/g, '_'), targetName: name.trim(), rating, comment: comment.trim() });
    setName('');
    setComment('');
  };

  return (
    <Card variant="sand">
      <Text variant="bodyL" weight="semiBold" style={{ marginBottom: 8 }}>
        Laisser un avis
      </Text>
      <View style={{ gap: 8 }}>
        <SegmentedTabs
          value={kind}
          onChange={(v) => setKind(v as Review['kind'])}
          items={[
            { key: 'seller', label: 'Vendeur' },
            { key: 'agency', label: 'Agence' },
            { key: 'company', label: 'Compagnie' },
            { key: 'trip', label: 'Trajet' },
          ]}
        />
        <Input label="Nom" value={name} onChangeText={setName} placeholder="Sahara Rent" />
        <Input
          label="Commentaire"
          value={comment}
          onChangeText={setComment}
          placeholder="Service impeccable…"
          multiline
        />
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <Pressable key={n} onPress={() => setRating(n)}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={28} color="#F7B500" />
            </Pressable>
          ))}
        </View>
        <Button label="Publier" onPress={submit} disabled={!name.trim() || !comment.trim()} />
      </View>
    </Card>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= rating ? 'star' : 'star-outline'} size={14} color="#F7B500" />
      ))}
    </View>
  );
}

function kindLabel(k: Review['kind']) {
  return { seller: 'Vendeur', agency: 'Agence', company: 'Compagnie', trip: 'Trajet' }[k];
}
