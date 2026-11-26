import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText, Icon } from '@/components';
import { t, tf } from '@/i18n';
import { DeliveryEstimate, pincodeService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDeliveryPincode, selectIsLoggedIn } from '@/store/selectors';
import { addressActions } from '@/store/slices/addressSlice';
import { fontSize, radius, spacing, typography, useTheme } from '@/theme';
import { formatDeliveryDate } from '@/utils/date';
import { isValidPincode } from '@/utils/validators';

/** Pincode delivery check (PD-04, section 7.6). */
export function DeliveryCheck() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectDeliveryPincode);
  const loggedIn = useAppSelector(selectIsLoggedIn);
  const [pin, setPin] = useState(saved ?? '');
  const [editing, setEditing] = useState(!saved);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeliveryEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = async (p = pin) => {
    if (!isValidPincode(p)) {
      setError(t.validation.pincode);
      return;
    }
    setError(null);
    setLoading(true);
    const r = await pincodeService.getDeliveryEstimate(p);
    setResult(r);
    setLoading(false);
    setEditing(false);
    if (!loggedIn) dispatch(addressActions.setGuestPincode(p));
  };

  useEffect(() => {
    if (saved) {
      setPin(saved);
      check(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  const s = result?.serviceability;
  return (
    <View>
      <AppText variant="h3" style={styles.title}>
        {t.pdp.checkDelivery}
      </AppText>
      {editing ? (
        <View
          style={[
            styles.box,
            { borderColor: error ? colors.danger : colors.border },
          ]}
        >
          <Icon name="location-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={pin}
            onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, 6))}
            placeholder={t.pdp.pincodePlaceholder}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            onSubmitEditing={() => check()}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel={t.pdp.pincodePlaceholder}
          />
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Pressable
              onPress={() => check()}
              hitSlop={10}
              accessibilityRole="button"
            >
              <AppText variant="label" color="accent">
                {t.pdp.check}
              </AppText>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.row}>
          <Icon name="location" size={18} color={colors.primary} />
          <AppText variant="label" style={styles.flex}>
            {pin}
            {s?.serviceable && s.info ? `  ·  ${s.info.city}` : ''}
          </AppText>
          <Pressable
            onPress={() => setEditing(true)}
            hitSlop={10}
            accessibilityRole="button"
          >
            <AppText variant="label" color="accent">
              {t.pdp.change}
            </AppText>
          </Pressable>
        </View>
      )}
      {error ? (
        <AppText variant="caption" color="danger" style={styles.msg}>
          {error}
        </AppText>
      ) : null}
      {s && !editing ? (
        s.serviceable ? (
          <View style={styles.msg}>
            <View style={styles.row}>
              <Icon name="cube-outline" size={16} color={colors.success} />
              <AppText variant="bodySm" color="success" weight="600">
                {tf(t.pdp.deliveryBy, {
                  date: formatDeliveryDate(new Date(result!.standardDate!)),
                })}
              </AppText>
            </View>
            {result?.expressDate ? (
              <View style={styles.row}>
                <Icon name="flash-outline" size={16} color={colors.accent} />
                <AppText variant="bodySm" color="textSecondary">
                  {tf(t.pdp.expressBy, {
                    date: formatDeliveryDate(new Date(result.expressDate)),
                  })}
                </AppText>
              </View>
            ) : null}
            <AppText variant="caption" color="textMuted">
              {t.pdp.freeDeliveryNote}
            </AppText>
          </View>
        ) : (
          <View style={[styles.row, styles.msg]}>
            <Icon name="close-circle-outline" size={16} color={colors.danger} />
            <AppText variant="bodySm" color="danger">
              {s.reason === 'invalid'
                ? t.validation.pincode
                : t.pdp.notDeliverable}
            </AppText>
          </View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { marginBottom: spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  input: {
    fontFamily: typography.body.fontFamily,
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  msg: { marginTop: spacing.sm, gap: spacing.xs },
});
