import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  closeIcon?: boolean;
  transparent?: boolean;
}

export function Header({
  title,
  subtitle,
  back = true,
  onBack,
  right,
  closeIcon,
  transparent,
}: Props) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: transparent ? 'transparent' : colors.surface,
          borderBottomColor: transparent ? 'transparent' : colors.border,
        },
      ]}
    >
      {back ? (
        <IconButton
          name={closeIcon ? 'close' : 'arrow-back'}
          accessibilityLabel="Go back"
          onPress={
            onBack ?? (() => navigation.canGoBack() && navigation.goBack())
          }
        />
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.titles}>
        {title ? (
          <AppText variant="h2" numberOfLines={1} accessibilityRole="header">
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  spacer: { width: spacing.md },
  titles: { flex: 1, paddingHorizontal: spacing.xs },
  right: { flexDirection: 'row', alignItems: 'center' },
});
