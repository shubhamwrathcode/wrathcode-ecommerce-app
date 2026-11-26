import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import {
  AppText,
  BottomSheet,
  Card,
  Divider,
  Header,
  ListRow,
  RadioRow,
  Screen,
} from '@/components';
import { t } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Language, uiActions } from '@/store/slices/uiSlice';
import { resetDemoData, syncOrderStatuses } from '@/store/thunks';
import { spacing, useTheme } from '@/theme';
import { toast } from '@/utils/toast';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
];

/** Settings (AC-06): language (UI only), dark mode, notification toggles, demo speed, reset demo data. */
export function SettingsScreen(_: AccountScreenProps<'Settings'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const ui = useAppSelector(s => s.ui);
  const [langOpen, setLangOpen] = useState(false);

  const sw = (
    value: boolean,
    onChange: (v: boolean) => void,
    label: string,
  ) => (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: colors.accent, false: colors.border }}
      thumbColor="#FFFFFF"
      accessibilityLabel={label}
    />
  );

  const reset = () =>
    Alert.alert(t.settings.reset, t.settings.resetConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.settings.reset,
        style: 'destructive',
        onPress: async () => {
          await dispatch(resetDemoData());
          // Session is cleared, so the root navigator switches to the Login flow by itself.
          toast.success(t.settings.resetDone);
        },
      },
    ]);

  return (
    <Screen header={<Header title={t.settings.title} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="label" color="textMuted">
          {t.settings.appearance.toUpperCase()}
        </AppText>
        <Card padded={false}>
          <ListRow
            icon="moon-outline"
            title={t.settings.darkMode}
            chevron={false}
            right={sw(
              ui.darkMode,
              v => dispatch(uiActions.setDarkMode(v)),
              t.settings.darkMode,
            )}
          />
          <Divider />
          <ListRow
            icon="language-outline"
            title={t.settings.language}
            subtitle={LANGUAGES.find(l => l.code === ui.language)?.label}
            onPress={() => setLangOpen(true)}
          />
        </Card>

        <AppText variant="label" color="textMuted">
          {t.settings.notifications.toUpperCase()}
        </AppText>
        <Card padded={false}>
          <ListRow
            icon="cube-outline"
            title={t.settings.orderUpdates}
            chevron={false}
            right={sw(
              ui.notifyOrders,
              v => dispatch(uiActions.setNotifyOrders(v)),
              t.settings.orderUpdates,
            )}
          />
          <Divider />
          <ListRow
            icon="pricetag-outline"
            title={t.settings.offers}
            chevron={false}
            right={sw(
              ui.notifyOffers,
              v => dispatch(uiActions.setNotifyOffers(v)),
              t.settings.offers,
            )}
          />
        </Card>

        <AppText variant="label" color="textMuted">
          {t.settings.demo.toUpperCase()}
        </AppText>
        <Card>
          <AppText variant="h3">{t.settings.demoSpeed}</AppText>
          <RadioRow
            title={t.settings.fast}
            subtitle="Ordered → Delivered in 10 minutes"
            selected={ui.demoSpeed === 'fast'}
            onPress={() => {
              dispatch(uiActions.setDemoSpeed('fast'));
              dispatch(syncOrderStatuses());
            }}
          />
          <RadioRow
            title={t.settings.realistic}
            subtitle="Ordered → Delivered on the expected date"
            selected={ui.demoSpeed === 'realistic'}
            onPress={() => {
              dispatch(uiActions.setDemoSpeed('realistic'));
              dispatch(syncOrderStatuses());
            }}
          />
        </Card>
        <Card padded={false}>
          <ListRow
            icon="refresh-circle-outline"
            title={t.settings.reset}
            subtitle={t.settings.resetBody}
            danger
            onPress={reset}
          />
        </Card>
        <View style={styles.bottom} />
      </ScrollView>
      <BottomSheet
        visible={langOpen}
        onClose={() => setLangOpen(false)}
        title={t.settings.language}
      >
        <View style={styles.sheet}>
          {LANGUAGES.map(l => (
            <RadioRow
              key={l.code}
              title={l.label}
              subtitle={l.code === 'en' ? undefined : t.common.comingSoon}
              selected={ui.language === l.code}
              onPress={() => {
                if (l.code !== 'en') {
                  toast.info(t.settings.languageSoon);
                  return;
                }
                dispatch(uiActions.setLanguage(l.code));
                setLangOpen(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md },
  sheet: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  bottom: { height: spacing.xxl },
});
