import { RULES } from '@/config/rules';

export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PINCODE_REGEX = /^[1-9]\d{5}$/;
export const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[A-Z])(?=.*\\d).{${RULES.auth.passwordMinLength},}$`,
);
export const DOB_REGEX =
  /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;

export const isValidMobile = (v: string) => MOBILE_REGEX.test(v);
export const isValidEmail = (v: string) => EMAIL_REGEX.test(v.trim());
export const isValidPincode = (v: string) => PINCODE_REGEX.test(v);
export const isValidUpi = (v: string) => UPI_REGEX.test(v.trim());
export const isValidPassword = (v: string) => PASSWORD_REGEX.test(v);

/** Luhn checksum for card numbers (section 6.9 CO-06). */
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length !== 16) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export type CardBrand = 'visa' | 'mastercard' | 'rupay' | 'amex' | 'unknown';

export function detectCardBrand(cardNumber: string): CardBrand {
  const n = cardNumber.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^(60|65|81|82|508)/.test(n)) return 'rupay';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
}

export const cardBrandLabel: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  rupay: 'RuPay',
  amex: 'Amex',
  unknown: 'Card',
};

/** MM/YY must be a real month and not in the past. */
export function isExpiryValid(expiry: string, now = new Date()): boolean {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth.getTime() >= now.getTime();
}

export function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
