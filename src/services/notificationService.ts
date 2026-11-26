import { mock } from '@/mock';
import type { AppNotification } from '@/types/models';

export const notificationService = {
  /** Offer notifications that ship with the demo build. */
  initialOffers(): AppNotification[] {
    return mock.offerNotifications.map(n => ({ ...n }));
  },
};
