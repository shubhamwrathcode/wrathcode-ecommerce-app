import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

interface Props {
  icon: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'default' | 'error';
  compact?: boolean;
}

/** Illustrated empty / error state with an action (section 9). */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  tone = 'default',
  compact,
}: Props) {
  const { colors } = useTheme();
  const tint = tone === 'error' ? colors.danger : colors.primary;
  const soft = tone === 'error' ? colors.dangerSoft : colors.primarySoft;
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={[styles.halo, { backgroundColor: soft }]}>
        <View style={[styles.inner, { backgroundColor: colors.surface }]}>
          <Icon name={icon} size={44} color={tint} />
        </View>
        <View
          style={[styles.spark, styles.s1, { backgroundColor: colors.accent }]}
        />
        <View style={[styles.spark, styles.s2, { backgroundColor: tint }]} />
      </View>
      <AppText variant="h2" align="center" style={styles.title}>
        {title}
      </AppText>
      {body ? (
        <AppText color="textSecondary" align="center" style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          fullWidth={false}
          style={styles.btn}
        />
      ) : null}
    </View>
  );
}

export function ErrorState({
  onRetry,
  message,
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      tone="error"
      title={message ?? 'Something went wrong'}
      body="Please try again."
      actionLabel="Retry"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  compact: { flex: 0, paddingVertical: spacing.xxl },
  halo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: { position: 'absolute', borderRadius: 99 },
  s1: { width: 14, height: 14, top: 14, right: 18 },
  s2: { width: 9, height: 9, bottom: 18, left: 16, opacity: 0.6 },
  title: { marginTop: spacing.xl },
  body: { marginTop: spacing.sm, maxWidth: 300 },
  btn: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
  },
});
