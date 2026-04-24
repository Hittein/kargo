import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, View, ViewStyle, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export type VehiclePhotoCarouselProps = {
  photos: string[];
  height?: number;
  borderRadius?: number;
  totalCount?: number;
  style?: ViewStyle;
  /** Called on tap (not swipe). If omitted, photos are not pressable. */
  onPress?: () => void;
};

export function VehiclePhotoCarousel({
  photos,
  height = 220,
  borderRadius = 16,
  totalCount,
  style,
  onPress,
}: VehiclePhotoCarouselProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const listRef = useRef<ScrollView>(null);
  const total = totalCount ?? photos.length;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!width) return;
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      if (next !== index) setIndex(next);
    },
    [index, width],
  );

  if (photos.length === 0) {
    return (
      <View
        style={[
          {
            height,
            borderRadius,
            backgroundColor: theme.color.bgElevated,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Ionicons name="car-sport" size={32} color={theme.color.textSecondary} />
      </View>
    );
  }

  return (
    <View
      style={[{ height, borderRadius, overflow: 'hidden', backgroundColor: theme.color.bgElevated }, style]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <ScrollView
          ref={listRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          nestedScrollEnabled
        >
          {photos.map((uri, i) => (
            <Pressable key={`${i}-${uri}`} onPress={onPress} disabled={!onPress}>
              <Image
                source={{ uri }}
                style={{ width, height }}
                contentFit="cover"
                transition={150}
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 12,
          bottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(0,0,0,0.55)',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        }}
      >
        <Ionicons name="image" size={12} color="#fff" />
        <Text variant="caption" style={{ color: '#fff', fontVariant: ['tabular-nums'] }}>
          {index + 1} / {total}
        </Text>
      </View>

      {photos.length > 1 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {photos.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 18 : 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
