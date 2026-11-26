import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { FlyToCartProvider, ToastHost } from '@/components';
import { RULES } from '@/config/rules';
import { setLanguage } from '@/i18n';
import { linking } from '@/navigation/linking';
import { RootNavigator } from '@/navigation/RootNavigator';
import { SplashScreen } from '@/screens/splash/SplashScreen';
import { db, wait } from '@/services';
import { persistor, store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/theme';

/** ON-01: splash for ~1.5 s while the persisted session and fake DB load. */
function Bootstrap() {
  const [ready, setReady] = useState(false);
  const language = useAppSelector(s => s.ui.language);
  useEffect(() => {
    Promise.all([db.init(), wait(RULES.splashMs)]).then(() => setReady(true));
  }, []);
  useEffect(() => setLanguage(language), [language]);
  return ready ? <AppShell /> : <SplashScreen />;
}

function AppShell() {
  const { colors, dark } = useTheme();
  const navTheme = useMemo<NavTheme>(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    };
  }, [colors, dark]);
  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <FlyToCartProvider>
        <View style={styles.flex}>
          <RootNavigator />
          <ToastHost />
        </View>
      </FlyToCartProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PersistGate loading={<SplashScreen />} persistor={persistor}>
          <Bootstrap />
        </PersistGate>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
