import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, spacing, useTheme } from '@/theme';
import { formatCountdown, msUntilMidnight } from '@/utils/date';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** Counts down to local midnight (HM-05). */
export function CountdownTimer() {
  const { colors } = useTheme();
  const [ms, setMs] = useState(msUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  const [h, m, s] = formatCountdown(ms).split(':');
  return (
    <View
      style={styles.row}
      accessibilityLabel={`Ends in ${h} hours ${m} minutes`}
    >
      <Icon name="time-outline" size={16} color={colors.danger} />
      {[h, m, s].map((v, i) => (
        <React.Fragment key={i}>
          <View style={[styles.box, { backgroundColor: colors.danger }]}>
            <AppText variant="label" color="#FFFFFF" weight="700">
              {v}
            </AppText>
          </View>
          {i < 2 ? (
            <AppText variant="label" color="danger">
              :
            </AppText>
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  box: {
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
});
