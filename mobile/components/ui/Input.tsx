import { useState } from 'react';
import { I18nManager, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'pill';
};

export function Input({
  label,
  error,
  hint,
  leading,
  trailing,
  containerStyle,
  variant = 'pill',
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const isPill = variant === 'pill';
  const borderColor = error
    ? theme.color.danger
    : focused
      ? theme.color.text
      : 'transparent';

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="caption" tone="secondary" style={{ marginBottom: 8, marginLeft: 4 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: isPill ? 56 : 52,
          paddingHorizontal: 18,
          backgroundColor: theme.color.bgElevated,
          borderRadius: isPill ? theme.radius.pill : theme.radius.md,
          borderWidth: focused || error ? 2 : 0,
          borderColor,
        }}
      >
        {leading}
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.color.textSecondary}
          style={[
            {
              flex: 1,
              color: theme.color.text,
              fontFamily: theme.fontFamily.sansRegular,
              fontSize: 15,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            },
            style,
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: 6, marginLeft: 4 }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="secondary" style={{ marginTop: 6, marginLeft: 4 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
