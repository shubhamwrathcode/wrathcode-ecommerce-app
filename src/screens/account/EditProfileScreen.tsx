import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Chip,
  FormField,
  Header,
  Screen,
  TextField,
} from '@/components';
import { t } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { authService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions } from '@/store/slices/authSlice';
import { spacing, useTheme } from '@/theme';
import type { Gender } from '@/types/models';
import { maskMobile } from '@/utils/format';
import { EditProfileForm, editProfileSchema } from '@/utils/schemas';
import { toast } from '@/utils/toast';

const GENDERS: Exclude<Gender, ''>[] = ['male', 'female', 'other'];

/** Edit profile (AC-01): name, email, gender, DOB. */
export function EditProfileScreen({
  navigation,
}: AccountScreenProps<'EditProfile'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user)!;
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit } = useForm<EditProfileForm>({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      gender: user.gender,
      dob: user.dob,
    },
  });

  const onSave = handleSubmit(async v => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        ...user,
        name: v.name,
        email: v.email ?? '',
        gender: (v.gender ?? '') as Gender,
        dob: v.dob ?? '',
      });
      dispatch(authActions.updateUser(updated));
      toast.success(t.account.profileUpdated);
      navigation.goBack();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  });

  return (
    <Screen
      keyboard
      edges={['top', 'bottom']}
      header={<Header title={t.account.editProfile} />}
      footer={
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Button title={t.common.save} onPress={onSave} loading={saving} />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <FormField
          control={control}
          name="name"
          label={t.auth.nameLabel}
          autoCapitalize="words"
        />
        <TextField
          label={t.auth.mobileLabel}
          value={maskMobile(user.mobile)}
          editable={false}
          hint={t.account.mobileNote}
        />
        <FormField
          control={control}
          name="email"
          label={t.auth.emailLabel}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {t.account.gender}
        </AppText>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <View style={styles.chips}>
              {GENDERS.map(g => (
                <Chip
                  key={g}
                  label={t.account.genders[g]}
                  selected={field.value === g}
                  onPress={() => field.onChange(field.value === g ? '' : g)}
                />
              ))}
            </View>
          )}
        />
        <FormField
          control={control}
          name="dob"
          label={t.account.dob}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          transform={raw => {
            const d = raw.replace(/\D/g, '').slice(0, 8);
            return [d.slice(0, 2), d.slice(2, 4), d.slice(4)]
              .filter(Boolean)
              .join('/');
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  label: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
