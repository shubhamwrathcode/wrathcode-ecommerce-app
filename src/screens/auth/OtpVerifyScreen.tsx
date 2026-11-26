import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Button, Header, InfoBanner, Screen } from '@/components';
import { RULES } from '@/config/rules';
import { useCompleteLogin } from '@/hooks/useCompleteLogin';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { radius, spacing, useTheme } from '@/theme';
import { maskMobile } from '@/utils/format';
import { toast } from '@/utils/toast';

const LEN = RULES.auth.otpLength;

/**
 * AU-02: 4 boxes with auto-advance, 30 s resend timer, demo OTP 1234,
 * 3 wrong attempts lock the form for 30 s.
 */
export function OtpVerifyScreen({
  navigation,
  route,
}: RootScreenProps<'OtpVerify'>) {
  const { mobile, purpose, signup } = route.params;
  const { colors } = useTheme();
  const completeLogin = useCompleteLogin();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState<number>(RULES.auth.otpResendSeconds);
  const [attempts, setAttempts] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setResendIn(s => Math.max(0, s - 1));
      setLockedFor(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (lockedFor === 0 && attempts >= RULES.auth.otpMaxAttempts) {
      setAttempts(0);
      setError(null);
    }
  }, [lockedFor, attempts]);

  const locked = lockedFor > 0;

  /** One hidden input drives the 4 visual boxes: robust for typing, paste and SMS autofill. */
  const onChange = (value: string) => {
    setError(null);
    setCode(value.replace(/\D/g, '').slice(0, LEN));
  };

  const verify = async () => {
    if (code.length !== LEN || locked) return;
    setLoading(true);
    try {
      const user = await authService.verifyOtp(mobile, code);
      if (purpose === 'forgot') {
        navigation.replace('ResetPassword', { mobile });
      } else if (purpose === 'signup' && signup) {
        completeLogin(await authService.signUp({ mobile, ...signup }));
      } else if (user) {
        completeLogin(user);
      } else {
        navigation.replace('ProfileSetup', { mobile });
      }
    } catch (e) {
      const n = attempts + 1;
      setAttempts(n);
      setCode('');
      input.current?.focus();
      if (n >= RULES.auth.otpMaxAttempts) {
        setLockedFor(RULES.auth.otpLockSeconds);
        setError(tf(t.auth.tooManyAttempts, { s: RULES.auth.otpLockSeconds }));
      } else {
        setError((e as Error).message || t.validation.otp);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit once all boxes are filled.
  useEffect(() => {
    if (code.length === LEN && !locked) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    await authService.sendOtp(mobile);
    setResendIn(RULES.auth.otpResendSeconds);
    toast.success(t.auth.otpResent);
  };

  return (
    <Screen keyboard background="surface" header={<Header transparent />}>
      <View style={styles.wrap}>
        <AppText variant="h1">{t.auth.otpTitle}</AppText>
        <AppText color="textSecondary" style={styles.sub}>
          {tf(t.auth.otpSubtitle, { mobile: maskMobile(mobile) })}
        </AppText>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <AppText variant="label" color="accent">
            {t.auth.changeNumber}
          </AppText>
        </Pressable>
        <Pressable
          style={styles.boxes}
          onPress={() => input.current?.focus()}
          accessibilityLabel="OTP input"
        >
          {Array.from({ length: LEN }).map((_, i) => {
            const d = code[i] ?? '';
            const active = i === Math.min(code.length, LEN - 1) && !locked;
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  {
                    borderColor: error
                      ? colors.danger
                      : d || active
                      ? colors.primary
                      : colors.border,
                    backgroundColor: locked
                      ? colors.surfaceAlt
                      : colors.surface,
                  },
                ]}
              >
                <AppText variant="h1">{d}</AppText>
              </View>
            );
          })}
          <TextInput
            ref={input}
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            maxLength={LEN}
            autoFocus
            editable={!locked}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            caretHidden
            accessibilityLabel="One-time password"
            testID="otp-input"
            style={styles.hiddenInput}
          />
        </Pressable>
        {error ? (
          <AppText variant="bodySm" color="danger" style={styles.error}>
            {locked ? tf(t.auth.tooManyAttempts, { s: lockedFor }) : error}
          </AppText>
        ) : null}
        <InfoBanner
          icon="key-outline"
          text={tf(t.auth.otpHint, { otp: RULES.auth.demoOtp })}
        />
        <Button
          title={t.auth.verify}
          onPress={verify}
          disabled={code.length !== LEN || locked}
          loading={loading}
          style={styles.btn}
        />
        <View style={styles.resend}>
          {resendIn > 0 ? (
            <AppText color="textMuted">
              {tf(t.auth.resendIn, { s: resendIn })}
            </AppText>
          ) : (
            <Pressable onPress={resend} hitSlop={10} accessibilityRole="button">
              <AppText variant="label" color="accent">
                {t.auth.resend}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl },
  sub: { marginTop: spacing.xs, marginBottom: spacing.xs },
  boxes: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    color: 'transparent',
  },
  box: {
    width: 58,
    height: 62,
    borderWidth: 1.5,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { marginBottom: spacing.md },
  btn: { marginTop: spacing.xl },
  resend: { alignItems: 'center', marginTop: spacing.xl },
});
