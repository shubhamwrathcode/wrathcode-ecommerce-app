import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import {
  Accordion,
  AppText,
  Card,
  Divider,
  Header,
  ListRow,
  ListSkeleton,
  Screen,
} from '@/components';
import { APP } from '@/config/app';
import { useAsync } from '@/hooks/useAsync';
import { t, tf } from '@/i18n';
import type { AccountScreenProps } from '@/navigation/types';
import { contentService } from '@/services';
import { spacing } from '@/theme';
import { toast } from '@/utils/toast';

/** Help / FAQ (AC-05): accordion + contact us (dummy phone / email / chat). */
export function HelpScreen({ navigation }: AccountScreenProps<'Help'>) {
  const { data, loading } = useAsync(() => contentService.getFaqs(), []);
  const open = (url: string) =>
    Linking.openURL(url).catch(() => toast.info(t.common.comingSoon));
  return (
    <Screen header={<Header title={t.help.title} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="h2">{t.help.faqs}</AppText>
        <Card style={styles.faqs}>
          {loading ? (
            <ListSkeleton rows={4} />
          ) : (
            data?.map(f => (
              <Accordion key={f.id} title={f.question}>
                <AppText variant="bodySm" color="textSecondary">
                  {f.answer}
                </AppText>
              </Accordion>
            ))
          )}
        </Card>
        <AppText variant="h2">{t.help.contact}</AppText>
        <Card padded={false}>
          <ListRow
            icon="call-outline"
            title={t.help.call}
            subtitle={APP.support.phone}
            onPress={() => open(`tel:${APP.support.phone.replace(/\s/g, '')}`)}
          />
          <Divider />
          <ListRow
            icon="mail-outline"
            title={t.help.email}
            subtitle={APP.support.email}
            onPress={() => open(`mailto:${APP.support.email}`)}
          />
          <Divider />
          <ListRow
            icon="chatbubbles-outline"
            title={t.help.chat}
            subtitle={tf(t.help.hours, { hours: APP.support.hours })}
            onPress={() => navigation.navigate('ChatSupport')}
          />
        </Card>
        <View style={styles.bottom} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md },
  faqs: { paddingVertical: 0 },
  bottom: { height: spacing.xxl },
});
