import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { radius, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export function Card({
  children,
  style,
  onPress,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
}) {
  const { colors } = useTheme();
  const s = [
    styles.card,
    padded && styles.padded,
    { backgroundColor: colors.surface, borderColor: colors.border },
    style,
  ];
  return onPress ? (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={s}>{children}</View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  subtitle,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  subtitle?: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.flex}>
        <AppText variant="h2" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <AppText variant="label" color="accent">
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Settings/account style navigable row. */
export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  danger,
  chevron = true,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  chevron?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceAlt : colors.surface },
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={21}
          color={danger ? colors.danger : colors.primary}
        />
      ) : null}
      <View style={styles.flex}>
        <AppText color={danger ? 'danger' : 'text'}>{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {onPress && chevron ? (
        <Icon name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export function RadioRow({
  selected,
  onPress,
  title,
  subtitle,
  right,
  disabled,
  children,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      style={[styles.radioRow, { opacity: disabled ? 0.5 : 1 }]}
    >
      <Icon
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? colors.accent : colors.textMuted}
      />
      <View style={styles.flex}>
        <AppText weight={selected ? '600' : '400'}>{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </View>
      {right}
    </Pressable>
  );
}

export function CheckboxRow({
  checked,
  onPress,
  label,
  count,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  count?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.checkRow}
    >
      <Icon
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? colors.primary : colors.textMuted}
      />
      <AppText style={styles.flex}>{label}</AppText>
      {count != null ? (
        <AppText variant="caption" color="textMuted">
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}

export function InfoBanner({
  icon = 'information-circle-outline',
  text,
  tone = 'info',
}: {
  icon?: string;
  text: string;
  tone?: 'info' | 'warning' | 'success' | 'danger';
}) {
  const { colors } = useTheme();
  const map = {
    info: [colors.primarySoft, colors.primary],
    warning: [colors.warningSoft, colors.warning],
    success: [colors.successSoft, colors.success],
    danger: [colors.dangerSoft, colors.danger],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Icon name={icon} size={18} color={fg} />
      <AppText variant="bodySm" color={fg} style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  padded: { padding: spacing.lg },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
