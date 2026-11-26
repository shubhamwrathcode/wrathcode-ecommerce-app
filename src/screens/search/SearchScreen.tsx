import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText, Chip, Icon, IconButton, Screen } from '@/components';
import { RULES } from '@/config/rules';
import { useDebounce } from '@/hooks/useDebounce';
import { t } from '@/i18n';
import type { RootScreenProps } from '@/navigation/types';
import { searchService, Suggestion } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { historyActions } from '@/store/slices/historySlice';
import { fontSize, radius, spacing, typography, useTheme } from '@/theme';
import { toast } from '@/utils/toast';

/** Search (SR-01…SR-05): recent + trending, live debounced suggestions. */
export function SearchScreen({ navigation }: RootScreenProps<'Search'>) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const recent = useAppSelector(s => s.history.recentSearches);
  const [query, setQuery] = useState('');
  const [trending, setTrending] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounced = useDebounce(query, RULES.search.debounceMs);

  useEffect(() => {
    searchService.getTrending().then(setTrending);
  }, []);

  useEffect(() => {
    let alive = true;
    if (debounced.trim().length < RULES.search.minChars) {
      setSuggestions([]);
      return;
    }
    searchService.suggest(debounced).then(s => alive && setSuggestions(s));
    return () => {
      alive = false;
    };
  }, [debounced]);

  const submit = (q: string) => {
    const term = q.trim();
    if (!term) return;
    dispatch(historyActions.searched(term));
    navigation.navigate('ProductList', { query: term, title: `"${term}"` });
  };

  const onSuggestion = (s: Suggestion) => {
    if (s.kind === 'product') {
      dispatch(historyActions.searched(query.trim()));
      navigation.navigate('ProductDetails', { productId: s.id });
    } else if (s.kind === 'category') {
      navigation.navigate('ProductList', {
        title: s.label,
        filters: { categoryIds: [s.id] },
      });
    } else {
      dispatch(historyActions.searched(s.label));
      navigation.navigate('ProductList', {
        title: s.label,
        filters: { brands: [s.label] },
      });
    }
  };

  const highlight = (label: string) => {
    const i = label.toLowerCase().indexOf(query.trim().toLowerCase());
    if (i < 0 || !query.trim())
      return <AppText numberOfLines={1}>{label}</AppText>;
    const end = i + query.trim().length;
    return (
      <AppText numberOfLines={1}>
        {label.slice(0, i)}
        <AppText weight="700">{label.slice(i, end)}</AppText>
        {label.slice(end)}
      </AppText>
    );
  };

  return (
    <Screen background="surface">
      <View style={[styles.bar, { borderBottomColor: colors.border }]}>
        <IconButton
          name="arrow-back"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
        />
        <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt }]}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder={t.search.placeholder}
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={() => submit(query)}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel={t.search.placeholder}
            testID="search-input"
          />
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={10}
              accessibilityLabel="Clear search"
            >
              <Icon name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => toast.info(t.search.voiceSoon)}
              hitSlop={10}
              accessibilityLabel="Voice search"
            >
              <Icon name="mic-outline" size={20} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>

      {query.trim().length >= RULES.search.minChars ? (
        <FlatList
          data={suggestions}
          keyboardShouldPersistTaps="handled"
          keyExtractor={s => `${s.kind}-${s.id}`}
          ListHeaderComponent={
            <Pressable
              onPress={() => submit(query)}
              style={styles.row}
              accessibilityRole="button"
            >
              <Icon name="search" size={18} color={colors.accent} />
              <AppText color="accent" weight="600" style={styles.flex}>
                {query}
              </AppText>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSuggestion(item)}
              style={styles.row}
              accessibilityRole="button"
            >
              <Icon
                name={
                  item.kind === 'category'
                    ? 'grid-outline'
                    : item.kind === 'brand'
                    ? 'ribbon-outline'
                    : 'search-outline'
                }
                size={18}
                color={colors.textMuted}
              />
              <View style={styles.flex}>
                {highlight(item.label)}
                {item.kind !== 'product' ? (
                  <AppText variant="caption" color="textMuted">
                    {item.kind === 'category'
                      ? t.search.inCategory
                      : t.search.inBrand}
                  </AppText>
                ) : null}
              </View>
              <Icon
                name="arrow-up-outline"
                size={16}
                color={colors.textMuted}
                style={styles.arrow}
              />
            </Pressable>
          )}
        />
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.idle}
        >
          {recent.length ? (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <AppText variant="h3">{t.search.recent}</AppText>
                <Pressable
                  onPress={() => dispatch(historyActions.clearSearches())}
                  hitSlop={10}
                >
                  <AppText variant="label" color="accent">
                    {t.search.clear}
                  </AppText>
                </Pressable>
              </View>
              {recent.map(r => (
                <Pressable
                  key={r}
                  onPress={() => submit(r)}
                  style={styles.row}
                  accessibilityRole="button"
                >
                  <Icon
                    name="time-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                  <AppText style={styles.flex}>{r}</AppText>
                  <IconButton
                    name="close"
                    size={16}
                    accessibilityLabel={`Remove ${r}`}
                    onPress={() => dispatch(historyActions.removeSearch(r))}
                  />
                </Pressable>
              ))}
            </View>
          ) : null}
          <View style={styles.section}>
            <AppText variant="h3" style={styles.trendTitle}>
              {t.search.trending}
            </AppText>
            <View style={styles.chips}>
              {trending.map(s => (
                <Chip
                  key={s}
                  label={s}
                  icon="trending-up"
                  onPress={() => submit(s)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  input: {
    fontFamily: typography.body.fontFamily,
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  arrow: { transform: [{ rotate: '-45deg' }] },
  idle: { paddingBottom: spacing.xxxl },
  section: { marginTop: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  trendTitle: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
