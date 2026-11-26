import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Divider,
  FormField,
  Header,
  Logo,
  Screen,
} from '@/components';
import { APP } from '@/config/app';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { continueAsGuest } from '@/store/thunks';
import { spacing } from '@/theme';
import { MobileForm, mobileSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';
import { MOBILE_REGEX } from '@/utils/validators';

/** Login with mobile number (AU-01) + entry points to email login, sign up and guest mode. */
export function LoginScreen({ navigation, route }: RootScreenProps<'Login'>) {
  const dispatch = useAppDispatch();
  const isGuest = useAppSelector(s => s.auth.isGuest);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, watch } = useForm<MobileForm>({
    resolver: yupResolver(mobileSchema),
    defaultValues: { mobile: '' },
    mode: 'onChange',
  });
  const valid = MOBILE_REGEX.test(watch('mobile') ?? '');

  const onSubmit = handleSubmit(async ({ mobile }) => {
    setLoading(true);
    try {
      await authService.sendOtp(mobile);
      navigation.navigate('OtpVerify', { mobile, purpose: 'login' });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen
      scroll
      keyboard
      background="surface"
      header={
        isGuest || route.params?.redirect ? (
          <Header closeIcon transparent />
        ) : undefined
      }
    >
      <View style={styles.wrap}>
        <Logo size={56} />
        <AppText variant="h1" style={styles.title}>
          {tf(t.auth.welcome, { app: APP.name })}
        </AppText>
        <AppText color="textSecondary" style={styles.sub}>
          {t.auth.loginSubtitle}
        </AppText>
        <FormField
          control={control}
          name="mobile"
          label={t.auth.mobileLabel}
          placeholder={t.auth.mobilePlaceholder}
          prefix="+91"
          keyboardType="number-pad"
          maxLength={10}
          transform={v => v.replace(/\D/g, '')}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => onSubmit()}
          testID="login-mobile"
        />
        <Button
          title={t.auth.getOtp}
          onPress={onSubmit}
          disabled={!valid}
          loading={loading}
          testID="login-get-otp"
        />
        <View style={styles.orRow}>
          <Divider style={styles.flex} />
          <AppText variant="caption" color="textMuted">
            {t.common.or}
          </AppText>
          <Divider style={styles.flex} />
        </View>
        <Button
          title={t.auth.loginWithEmail}
          variant="outline"
          icon="mail-outline"
          onPress={() => navigation.navigate('EmailLogin')}
        />
        {!isGuest && !route.params?.redirect ? (
          <Button
            title={t.auth.continueGuest}
            variant="ghost"
            onPress={() => dispatch(continueAsGuest())}
            style={styles.guest}
            testID="login-guest"
          />
        ) : null}
        <View style={styles.signup}>
          <AppText color="textSecondary">{t.auth.noAccount} </AppText>
          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            hitSlop={10}
            accessibilityRole="button"
          >
            <AppText variant="label" color="accent">
              {t.auth.signUp}
            </AppText>
          </Pressable>
        </View>
        <AppText
          variant="caption"
          color="textMuted"
          align="center"
          style={styles.terms}
        >
          {t.auth.terms}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: spacing.xxxl },
  title: { marginTop: spacing.xl },
  sub: { marginTop: spacing.xs, marginBottom: spacing.xxl },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  flex: { flex: 1 },
  guest: { marginTop: spacing.sm },
  signup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  terms: { marginTop: spacing.xl },
});
