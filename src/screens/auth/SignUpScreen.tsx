import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, FormField, Header, Screen } from '@/components';
import { APP } from '@/config/app';
import { t, tf } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { spacing } from '@/theme';
import { SignUpForm, signUpSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';

/** AU-04: name, mobile, optional email, password (8+ chars, 1 upper, 1 number). */
export function SignUpScreen({ navigation }: RootScreenProps<'SignUp'>) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<SignUpForm>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { name: '', mobile: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    setLoading(true);
    try {
      const res = await authService.sendOtp(values.mobile);
      if (res.isRegistered) {
        toast.error(
          'An account with this mobile number already exists. Please login.',
        );
        return;
      }
      navigation.navigate('OtpVerify', {
        mobile: values.mobile,
        purpose: 'signup',
        signup: {
          name: values.name,
          email: values.email ?? '',
          password: values.password,
        },
      });
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
      header={<Header title={t.auth.signUpTitle} />}
    >
      <View style={styles.wrap}>
        <AppText color="textSecondary" style={styles.sub}>
          {tf(t.auth.signUpSubtitle, { app: APP.name })}
        </AppText>
        <FormField
          control={control}
          name="name"
          label={t.auth.nameLabel}
          placeholder={t.auth.namePlaceholder}
          autoCapitalize="words"
          leftIcon="person-outline"
        />
        <FormField
          control={control}
          name="mobile"
          label={t.auth.mobileLabel}
          placeholder={t.auth.mobilePlaceholder}
          prefix="+91"
          keyboardType="number-pad"
          maxLength={10}
          transform={v => v.replace(/\D/g, '')}
        />
        <FormField
          control={control}
          name="email"
          label={t.auth.emailOptional}
          placeholder={t.auth.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
        />
        <FormField
          control={control}
          name="password"
          label={t.auth.passwordLabel}
          placeholder={t.auth.passwordPlaceholder}
          secure
          hint={t.auth.passwordRule}
          leftIcon="lock-closed-outline"
        />
        <Button
          title={t.auth.createAccount}
          onPress={onSubmit}
          loading={loading}
          style={styles.btn}
        />
        <View style={styles.row}>
          <AppText color="textSecondary">{t.auth.haveAccount} </AppText>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <AppText variant="label" color="accent">
              {t.auth.login}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl },
  sub: { marginBottom: spacing.xl },
  btn: { marginTop: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
