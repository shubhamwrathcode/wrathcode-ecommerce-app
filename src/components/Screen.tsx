import React, { useContext, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTheme } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  keyboard?: boolean;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  background?: 'background' | 'surface';
  refreshControl?: React.ComponentProps<typeof ScrollView>['refreshControl'];
  /** Force light status-bar text (for screens with a gradient top). */
  lightStatusBar?: boolean;
}

/** Base layout: safe area, themed background, optional scroll, sticky footer. */
export function Screen({
  children,
  scroll,
  padded,
  edges = ['top'],
  keyboard,
  footer,
  header,
  contentStyle,
  background = 'background',
  refreshControl,
  lightStatusBar,
}: Props) {
  const { colors, dark } = useTheme();
  const navigation = useContext(NavigationContext);
  const barStyle = dark || lightStatusBar ? 'light-content' : 'dark-content';
  // Tabs keep screens mounted, so apply the bar style whenever this screen gains focus.
  useEffect(() => {
    if (!navigation) return;
    const apply = () => StatusBar.setBarStyle(barStyle, true);
    if (navigation.isFocused()) apply();
    return navigation.addListener('focus', apply);
  }, [navigation, barStyle]);
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={[
        padded && styles.padded,
        styles.grow,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>
      {children}
    </View>
  );
  const content = (
    <>
      {header}
      {body}
      {footer}
    </>
  );
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: colors[background] }]}
    >
      {navigation ? null : <StatusBar barStyle={barStyle} />}
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  padded: { padding: spacing.lg },
});
