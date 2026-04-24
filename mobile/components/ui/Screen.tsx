import { ScrollView, ScrollViewProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, useThemeScheme } from '@/theme/ThemeProvider';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  scrollProps?: ScrollViewProps;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
  scrollProps,
}: ScreenProps) {
  const theme = useTheme();
  const scheme = useThemeScheme();
  const padding = padded ? { padding: theme.spacing['5'] } : null;

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: theme.color.bg }, style]}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          {...scrollProps}
          contentContainerStyle={[
            padding,
            { gap: theme.spacing['4'] },
            contentStyle,
            scrollProps?.contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
