import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export function Accordion({
  title,
  children,
  initiallyOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border }]}>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setOpen(o => !o);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.head}
      >
        <AppText variant="h3" style={styles.flex}>
          {title}
        </AppText>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: spacing.md,
  },
  body: { paddingBottom: spacing.lg },
  flex: { flex: 1 },
});
