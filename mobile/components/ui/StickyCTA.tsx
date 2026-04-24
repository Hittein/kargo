import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

export function StickyCTA({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['3'],
          paddingBottom: insets.bottom + theme.spacing['3'],
          backgroundColor: theme.color.bg,
          borderTopWidth: 1,
          borderTopColor: theme.color.divider,
          gap: theme.spacing['3'],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
