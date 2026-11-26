import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, FormField, Header, Screen } from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { spacing } from '@/theme';
import { ResetPasswordForm, resetPasswordSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';

export function ResetPasswordScreen({
  navigation,
  route,
}: RootScreenProps<'ResetPassword'>) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<ResetPasswordForm>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });
  const onSubmit = handleSubmit(async ({ password }) => {
    setLoading(true);
    try {
      await authService.resetPassword(route.params.mobile, password);
      toast.success(t.auth.resetSuccess);
      navigation.popTo('EmailLogin');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  });
  return (
    <Screen
      keyboard
      background="surface"
      header={<Header title={t.auth.newPasswordTitle} />}
    >
      <View style={styles.wrap}>
        <AppText color="textSecondary" style={styles.sub}>
          {t.auth.passwordRule}
        </AppText>
        <FormField
          control={control}
          name="password"
          label={t.auth.newPassword}
          secure
          leftIcon="lock-closed-outline"
        />
        <FormField
          control={control}
          name="confirm"
          label={t.auth.confirmPassword}
          secure
          leftIcon="lock-closed-outline"
        />
        <Button
          title={t.auth.resetPassword}
          onPress={onSubmit}
          loading={loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl },
  sub: { marginBottom: spacing.xl },
});
