import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Badge, Button, Card, StickyCTA, Text } from '@/components/ui';
import { SellStepper } from '@/components/SellStepper';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
import { useSellStore } from '@/lib/stores/sell';

const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=70',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=70',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=70',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=70',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=70',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=70',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=70',
  'https://images.unsplash.com/photo-1605515298946-d0573716f0bd?w=600&q=70',
];

const COACH_TIPS = [
  'Photo plein-cadre, voiture entière visible',
  'Lumière naturelle, pas en plein soleil',
  'Avant, arrière, côtés, intérieur, compteur',
  'Minimum 3 photos pour publier (6+ recommandé)',
];

export default function SellPhotos() {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const router = useRouter();
  const { draft, addPhoto, removePhoto, movePhotoFirst } = useSellStore();
  const canContinue = draft.photoUrls.length >= 3;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={theme.color.text} />
        </Pressable>
        <Text variant="heading2" weight="bold" style={{ flex: 1 }}>
          Photos
        </Text>
        <Badge label="A-10" tone="primary" />
      </View>

      <SellStepper current={4} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 160 }}>
        <Card variant="soft">
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Ionicons name="sparkles" size={20} color={theme.color.primary} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="bodyL" weight="bold">
                Photo Coach IA
              </Text>
              {COACH_TIPS.map((t) => (
                <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark" size={14} color={theme.color.success} />
                  <Text variant="caption" tone="secondary">
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text variant="bodyL" weight="bold">
              Mes photos
            </Text>
            <Badge
              label={`${draft.photoUrls.length}/20`}
              tone={draft.photoUrls.length >= 3 ? 'success' : 'neutral'}
            />
          </View>

          {draft.photoUrls.length === 0 ? (
            <Card style={{ alignItems: 'center', gap: 8, padding: 32 }}>
              <Ionicons name="images-outline" size={32} color={theme.color.textSecondary} />
              <Text variant="bodyM" tone="secondary">
                Aucune photo ajoutée
              </Text>
            </Card>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {draft.photoUrls.map((url, i) => (
                <View key={url} style={{ width: '31%', aspectRatio: 1 }}>
                  <Image
                    source={{ uri: url }}
                    style={{ width: '100%', height: '100%', borderRadius: 12 }}
                    contentFit="cover"
                    transition={150}
                  />
                  {i === 0 ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: theme.color.primary,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        variant="caption"
                        weight="bold"
                        style={{ color: theme.color.textInverse, fontSize: 10 }}
                      >
                        PRINCIPALE
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => movePhotoFirst(url)}
                      hitSlop={8}
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        variant="caption"
                        weight="bold"
                        style={{ color: '#fff', fontSize: 10 }}
                      >
                        Principale
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => removePhoto(url)}
                    hitSlop={8}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View>
          <Text variant="bodyL" weight="bold" style={{ marginBottom: 10 }}>
            Banque de photos (démo)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {STOCK_PHOTOS.map((url) => {
              const picked = draft.photoUrls.includes(url);
              return (
                <Pressable
                  key={url}
                  onPress={() => (picked ? removePhoto(url) : addPhoto(url))}
                  style={{ width: '31%', aspectRatio: 1, opacity: picked ? 0.35 : 1 }}
                >
                  <Image
                    source={{ uri: url }}
                    style={{ width: '100%', height: '100%', borderRadius: 12 }}
                    contentFit="cover"
                    transition={150}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 6,
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: picked ? theme.color.success : 'rgba(0,0,0,0.55)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={picked ? 'checkmark' : 'add'} size={16} color="#fff" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <StickyCTA>
        <Button
          label={canContinue ? 'Continuer' : `Ajoutez ${3 - draft.photoUrls.length} photo(s)`}
          disabled={!canContinue}
          onPress={() => router.push('/marketplace/sell/contact')}
        />
      </StickyCTA>
    </SafeAreaView>
  );
}
