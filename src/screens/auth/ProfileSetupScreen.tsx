import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, FormField, Header, Screen } from '@/components';
import { useCompleteLogin } from '@/hooks/useCompleteLogin';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { spacing } from '@/theme';
import { ProfileSetupForm, profileSetupSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';

/** Flow A: profile setup for a new mobile number after OTP. */
export function ProfileSetupScreen({ route }: RootScreenProps<'ProfileSetup'>) {
  const completeLogin = useCompleteLogin();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<ProfileSetupForm>({
    resolver: yupResolver(profileSetupSchema),
    defaultValues: { name: '', email: '' },
  });
  const onSubmit = handleSubmit(async ({ name, email }) => {
    setLoading(true);
    try {
      completeLogin(
        await authService.completeProfile({
          mobile: route.params.mobile,
          name,
          email: email ?? '',
        }),
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  });
  return (
    <Screen keyboard background="surface" header={<Header back={false} />}>
      <View style={styles.wrap}>
        <AppText variant="h1">{t.auth.profileSetupTitle}</AppText>
        <AppText color="textSecondary" style={styles.sub}>
          {t.auth.profileSetupSubtitle}
        </AppText>
        <FormField
          control={control}
          name="name"
          label={t.auth.nameLabel}
          placeholder={t.auth.namePlaceholder}
          autoCapitalize="words"
          autoFocus
        />
        <FormField
          control={control}
          name="email"
          label={t.auth.emailOptional}
          placeholder={t.auth.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title={t.auth.finish} onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl },
  sub: { marginTop: spacing.xs, marginBottom: spacing.xl },
});
