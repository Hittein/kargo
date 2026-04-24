import { I18nManager, StyleSheet, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

type Variant = 'displayXL' | 'displayL' | 'heading1' | 'heading2' | 'bodyL' | 'bodyM' | 'caption';
type Tone = 'default' | 'secondary' | 'inverse' | 'primary' | 'success' | 'danger';
type Weight = 'regular' | 'medium' | 'semiBold' | 'bold';

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  weight?: Weight;
  align?: TextStyle['textAlign'];
};

export function Text({
  variant = 'bodyL',
  tone = 'default',
  weight,
  align,
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isAR = i18n.language === 'ar';
  const variantStyle = theme.typography[variant];

  const family = (() => {
    const w = weight ?? inferWeight(variant);
    if (isAR) {
      return {
        regular: theme.fontFamily.arRegular,
        medium: theme.fontFamily.arMedium,
        semiBold: theme.fontFamily.arSemiBold,
        bold: theme.fontFamily.arBold,
      }[w];
    }
    return {
      regular: theme.fontFamily.sansRegular,
      medium: theme.fontFamily.sansMedium,
      semiBold: theme.fontFamily.sansSemiBold,
      bold: theme.fontFamily.sansBold,
    }[w];
  })();

  const color =
    tone === 'secondary'
      ? theme.color.textSecondary
      : tone === 'inverse'
        ? theme.color.textInverse
        : tone === 'primary'
          ? theme.color.primary
          : tone === 'success'
            ? theme.color.success
            : tone === 'danger'
              ? theme.color.danger
              : theme.color.text;

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: family,
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          color,
          textAlign: align ?? (I18nManager.isRTL ? 'right' : 'left'),
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

function inferWeight(variant: Variant): Weight {
  switch (variant) {
    case 'displayXL':
    case 'displayL':
    case 'heading1':
      return 'bold';
    case 'heading2':
      return 'medium';
    case 'caption':
      return 'medium';
    default:
      return 'regular';
  }
}

export const textStyles = StyleSheet.create({});
