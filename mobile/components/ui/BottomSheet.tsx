import { Modal, Pressable, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Hauteur max en fraction du viewport (0-1). Default 0.9 */
  maxHeightRatio?: number;
  style?: ViewStyle;
};

/**
 * Bottom sheet modal avec drag handle et backdrop cliquable (image 10).
 * Animation slide native RN, pas de gesture pour le moment — version
 * légère sans gesture-handler. Cliquer sur le backdrop ferme.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  maxHeightRatio = 0.9,
  style,
}: BottomSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.color.overlay, justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => undefined}
          style={[
            {
              backgroundColor: theme.color.card,
              borderTopLeftRadius: theme.radius.xxl,
              borderTopRightRadius: theme.radius.xxl,
              maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
              overflow: 'hidden',
            },
            style,
          ]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <View
                style={{
                  width: 48,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: theme.color.border,
                }}
              />
            </View>
            {title ? (
              <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
                <Text variant="heading2">{title}</Text>
              </View>
            ) : null}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: footer ? 0 : 20 }}>
              {children}
            </View>
            {footer ? (
              <View
                style={{
                  padding: 20,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: theme.color.divider,
                  gap: 8,
                }}
              >
                {footer}
              </View>
            ) : null}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
