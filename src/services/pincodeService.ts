import { mock } from '@/mock';
import type { DeliveryType, PincodeInfo } from '@/types/models';
import {
  checkServiceability,
  estimateDeliveryDate,
  Serviceability,
} from '@/utils/delivery';
import { simulate } from './apiClient';

export interface DeliveryEstimate {
  serviceability: Serviceability;
  standardDate: string | null;
  expressDate: string | null;
}

export const pincodeService = {
  check(pincode: string): Serviceability {
    return checkServiceability(pincode, mock.pincodes);
  },

  async getDeliveryEstimate(pincode: string): Promise<DeliveryEstimate> {
    return simulate(() => {
      const s = checkServiceability(pincode, mock.pincodes);
      const std = estimateDeliveryDate(s, 'standard');
      const exp =
        s.serviceable && s.expressAvailable
          ? estimateDeliveryDate(s, 'express')
          : null;
      return {
        serviceability: s,
        standardDate: std?.toISOString() ?? null,
        expressDate: exp?.toISOString() ?? null,
      };
    }, 400);
  },

  /** City / state auto-fill for the address form (CO-02). */
  async lookup(pincode: string): Promise<PincodeInfo | null> {
    return simulate(
      () => mock.pincodes.serviceable.find(p => p.pincode === pincode) ?? null,
      200,
    );
  },

  expectedDate(
    pincode: string,
    type: DeliveryType,
    from = new Date(),
  ): Date | null {
    return estimateDeliveryDate(
      checkServiceability(pincode, mock.pincodes),
      type,
      from,
    );
  },
};
