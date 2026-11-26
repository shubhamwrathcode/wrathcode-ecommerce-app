import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, FormField, Header, Screen } from '@/components';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { spacing } from '@/theme';
import { MobileForm, mobileSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';

/** AU-05: mobile > OTP > new password > success. */
export function ForgotPasswordScreen({
  navigation,
}: RootScreenProps<'ForgotPassword'>) {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<MobileForm>({
    resolver: yupResolver(mobileSchema),
    defaultValues: { mobile: '' },
  });
  const onSubmit = handleSubmit(async ({ mobile }) => {
    setLoading(true);
    try {
      const res = await authService.sendOtp(mobile);
      if (!res.isRegistered) {
        toast.error('No account found with this mobile number');
        return;
      }
      navigation.navigate('OtpVerify', { mobile, purpose: 'forgot' });
    } finally {
      setLoading(false);
    }
  });
  return (
    <Screen
      keyboard
      background="surface"
      header={<Header title={t.auth.forgotTitle} />}
    >
      <View style={styles.wrap}>
        <AppText color="textSecondary" style={styles.sub}>
          {t.auth.forgotSubtitle}
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
        />
        <Button title={t.auth.sendOtp} onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl },
  sub: { marginBottom: spacing.xl },
});
