import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { t } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import { selectIsLoggedIn } from '@/store/selectors';
import { authRedirect } from '@/utils/authRedirect';

/**
 * Guards actions that need an account (checkout, orders, reviews, addresses —
 * section 7.5). Guests see a login prompt and continue where they left off.
 */
export function useRequireAuth() {
  const loggedIn = useAppSelector(selectIsLoggedIn);
  const navigation = useNavigation();
  return useCallback(
    (action: () => void, message?: string) => {
      if (loggedIn) {
        action();
        return;
      }
      authRedirect.set(action);
      Alert.alert(t.auth.loginPromptTitle, message ?? t.auth.loginPromptBody, [
        {
          text: t.common.cancel,
          style: 'cancel',
          onPress: () => authRedirect.clear(),
        },
        {
          text: t.auth.login,
          onPress: () => navigation.navigate('Login', { redirect: true }),
        },
      ]);
    },
    [loggedIn, navigation],
  );
}
