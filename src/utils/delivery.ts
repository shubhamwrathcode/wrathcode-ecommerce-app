import { RULES } from '@/config/rules';
import type { DeliveryType, PincodeInfo } from '@/types/models';
import { addDaysSkippingSundays } from './date';
import { isValidPincode } from './validators';

export interface PincodeData {
  serviceable: PincodeInfo[];
  nonServiceable: string[];
  metroPrefixes: string[];
}

export type Serviceability =
  | { serviceable: false; reason: 'invalid' | 'not_serviceable' }
  | {
      serviceable: true;
      zone: 'metro' | 'listed' | 'other';
      standardDays: number;
      expressAvailable: boolean;
      expressDays: number | null;
      info: PincodeInfo | null;
    };

/** Pincode serviceability rules (section 7.6). */
export function checkServiceability(
  pincode: string,
  data: PincodeData,
): Serviceability {
  if (!isValidPincode(pincode))
    return { serviceable: false, reason: 'invalid' };
  if (data.nonServiceable.includes(pincode))
    return { serviceable: false, reason: 'not_serviceable' };
  const info = data.serviceable.find(p => p.pincode === pincode) ?? null;
  const d = RULES.delivery;
  if (data.metroPrefixes.some(prefix => pincode.startsWith(prefix))) {
    return {
      serviceable: true,
      zone: 'metro',
      standardDays: d.metroDays,
      expressAvailable: true,
      expressDays: d.metroExpressDays,
      info,
    };
  }
  if (info) {
    const days =
      Number(pincode[5]) % 2 === 0 ? d.listedDays[0] : d.listedDays[1];
    return {
      serviceable: true,
      zone: 'listed',
      standardDays: days,
      expressAvailable: false,
      expressDays: null,
      info,
    };
  }
  return {
    serviceable: true,
    zone: 'other',
    standardDays: d.otherDays,
    expressAvailable: false,
    expressDays: null,
    info: null,
  };
}

export function estimateDeliveryDate(
  s: Serviceability,
  type: DeliveryType,
  from = new Date(),
): Date | null {
  if (!s.serviceable) return null;
  const days =
    type === 'express' && s.expressAvailable && s.expressDays
      ? s.expressDays
      : s.standardDays;
  return addDaysSkippingSundays(from, days);
}
