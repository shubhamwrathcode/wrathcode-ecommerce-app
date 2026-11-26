import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, FormField, Header, Screen } from '@/components';
import { APP } from '@/config/app';
import { useCompleteLogin } from '@/hooks/useCompleteLogin';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { spacing } from '@/theme';
import { EmailLoginForm, emailLoginSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';

/** AU-03: email + password login with a "Use demo account" shortcut for sales. */
export function EmailLoginScreen({
  navigation,
}: RootScreenProps<'EmailLogin'>) {
  const completeLogin = useCompleteLogin();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue } = useForm<EmailLoginForm>({
    resolver: yupResolver(emailLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setLoading(true);
    try {
      completeLogin(await authService.loginWithEmail(email, password));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  });

  const useDemo = () => {
    setValue('email', APP.demo.email, { shouldValidate: true });
    setValue('password', APP.demo.password, { shouldValidate: true });
  };

  return (
    <Screen
      scroll
      keyboard
      background="surface"
      header={<Header title={t.auth.emailTitle} />}
    >
      <View style={styles.wrap}>
        <FormField
          control={control}
          name="email"
          label={t.auth.emailLabel}
          placeholder={t.auth.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon="mail-outline"
        />
        <FormField
          control={control}
          name="password"
          label={t.auth.passwordLabel}
          placeholder={t.auth.passwordPlaceholder}
          secure
          leftIcon="lock-closed-outline"
          onSubmitEditing={() => onSubmit()}
        />
        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgot}
          hitSlop={8}
          accessibilityRole="button"
        >
          <AppText variant="label" color="accent">
            {t.auth.forgotPassword}
          </AppText>
        </Pressable>
        <Button title={t.auth.login} onPress={onSubmit} loading={loading} />
        <Button
          title={t.auth.useDemo}
          variant="outline"
          icon="person-circle-outline"
          onPress={useDemo}
          style={styles.demo}
          testID="use-demo"
        />
        <AppText
          variant="caption"
          color="textMuted"
          align="center"
          style={styles.hint}
        >
          {APP.demo.email} / {APP.demo.password}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.xl },
  demo: { marginTop: spacing.md },
  hint: { marginTop: spacing.sm },
});
