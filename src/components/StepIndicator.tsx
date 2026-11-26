import React from 'react';
import { StyleSheet, View } from 'react-native';
import { gradients, linear, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** Address > Delivery > Payment > Review (CO-01). */
export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
      accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${
        steps[current]
      }`}
    >
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const tint = done || active ? colors.primary : colors.textMuted;
        return (
          <React.Fragment key={s}>
            <View style={styles.step}>
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: tint,
                    backgroundColor: done
                      ? colors.primary
                      : active
                      ? colors.primarySoft
                      : 'transparent',
                  },
                  done && [styles.noBorder, linear(gradients.brand, 135)],
                ]}
              >
                {done ? (
                  <Icon
                    name="checkmark"
                    size={13}
                    color={colors.textOnPrimary}
                  />
                ) : (
                  <AppText variant="caption" color={tint} weight="700">
                    {i + 1}
                  </AppText>
                )}
              </View>
              <AppText
                variant="caption"
                color={active ? 'primary' : 'textMuted'}
                weight={active ? '700' : '500'}
              >
                {s}
              </AppText>
            </View>
            {i < steps.length - 1 ? (
              <View
                style={[
                  styles.line,
                  { backgroundColor: done ? colors.primary : colors.border },
                  done && linear(gradients.brand, 90),
                ]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  noBorder: { borderColor: 'transparent' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  step: { alignItems: 'center', gap: spacing.xs, width: 58 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, height: 2, marginTop: 11, borderRadius: 1 },
});
