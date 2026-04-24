import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  code?: string;
  trailing?: React.ReactNode;
};

export function BackHeader({ title, code, trailing }: Props) {
  const router = useRouter();
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {router.canGoBack() ? (
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={theme.color.text} />
        </Pressable>
      ) : null}
      <Text variant="heading1" style={{ flex: 1 }}>
        {title}
      </Text>
      {trailing}
      {code ? <Badge label={code} tone="neutral" /> : null}
    </View>
  );
}
