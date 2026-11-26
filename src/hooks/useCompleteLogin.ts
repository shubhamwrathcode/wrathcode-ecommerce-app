import { useCallback } from 'react';
import { t, tf } from '@/i18n';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from '@/store/thunks';
import type { User } from '@/types/models';
import { authRedirect } from '@/utils/authRedirect';
import { toast } from '@/utils/toast';

/**
 * Finishes any login path. The root navigator drops the auth screens as soon
 * as a user exists, so the guest lands back where they were; then any pending
 * action (e.g. "go to checkout") runs.
 */
export function useCompleteLogin() {
  const dispatch = useAppDispatch();
  return useCallback(
    (user: User) => {
      dispatch(loginUser(user));
      toast.success(tf(t.auth.welcomeBack, { name: user.name.split(' ')[0] }));
      const next = authRedirect.consume();
      if (next) setTimeout(next, 350);
    },
    [dispatch],
  );
}
