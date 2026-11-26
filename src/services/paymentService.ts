import { RULES } from '@/config/rules';
import type { PaymentInfo } from '@/types/models';
import { uid } from '@/utils/id';
import { simulate } from './apiClient';

export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  message: string;
}

export const paymentService = {
  /**
   * Payment simulation (CO-07): 2 s processing. UPI `fail@upi` or a card ending
   * in 0000 fails; everything else succeeds. No card data ever leaves the device.
   */
  async process(payment: PaymentInfo): Promise<PaymentResult> {
    return simulate(() => {
      const fail =
        (payment.method === 'upi' &&
          payment.upiId?.toLowerCase() === RULES.payment.failUpiId) ||
        (payment.method === 'card' &&
          payment.cardLast4 === RULES.payment.failCardSuffix);
      return fail
        ? {
            success: false,
            transactionId: null,
            message:
              'Your bank declined this transaction. No money was deducted.',
          }
        : {
            success: true,
            transactionId: uid('txn_'),
            message: 'Payment successful',
          };
    }, RULES.payment.processingMs);
  },
};
