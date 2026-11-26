import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText, Header, Logo, Screen } from '@/components';
import { APP } from '@/config/app';
import { t, tf } from '@/i18n';
import type { AccountScreenProps, RootScreenProps } from '@/navigation/types';
import { spacing } from '@/theme';

/** About (AC-07). */
export function AboutScreen(_: AccountScreenProps<'About'>) {
  return (
    <Screen
      background="surface"
      header={<Header title={tf(t.account.about, { app: APP.name })} />}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logo}>
          <Logo size={72} />
          <AppText variant="h1" style={styles.name}>
            {APP.name}
          </AppText>
          <AppText color="textMuted">
            {tf(t.account.version, { v: APP.version })}
          </AppText>
        </View>
        <AppText color="textSecondary">{t.legal.aboutBody}</AppText>
      </ScrollView>
    </Screen>
  );
}

/** Terms and Privacy placeholder pages (AC-07). */
export function LegalScreen({ route }: RootScreenProps<'Legal'>) {
  const terms = route.params.kind === 'terms';
  return (
    <Screen
      background="surface"
      header={<Header title={terms ? t.account.terms : t.account.privacy} />}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {(terms ? t.legal.termsSections : t.legal.privacySections).map(
          (title, i) => (
            <View key={title} style={styles.block}>
              <AppText variant="h3">
                {i + 1}. {title}
              </AppText>
              <AppText color="textSecondary">
                {terms ? t.legal.termsBody : t.legal.privacyBody}
              </AppText>
            </View>
          ),
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, gap: spacing.lg },
  logo: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  name: { marginTop: spacing.md },
  block: { gap: spacing.sm },
});
