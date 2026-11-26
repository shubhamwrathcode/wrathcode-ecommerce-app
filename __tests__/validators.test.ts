import {
  detectCardBrand,
  isExpiryValid,
  isValidMobile,
  isValidPassword,
  isValidUpi,
  luhnCheck,
} from '@/utils/validators';

describe('validators (7.8)', () => {
  it('mobile: 10 digits starting 6-9', () => {
    expect(isValidMobile('9876543210')).toBe(true);
    expect(isValidMobile('5876543210')).toBe(false);
    expect(isValidMobile('987654321')).toBe(false);
  });
  it('password: 8+ chars, 1 upper, 1 number', () => {
    expect(isValidPassword('Demo@123')).toBe(true);
    expect(isValidPassword('demo1234')).toBe(false);
    expect(isValidPassword('Demo123')).toBe(false);
  });
  it('card: Luhn + brand', () => {
    expect(luhnCheck('4111 1111 1111 1111')).toBe(true);
    expect(luhnCheck('4111 1111 1111 1112')).toBe(false);
    expect(detectCardBrand('5555555555554444')).toBe('mastercard');
  });
  it('expiry must not be in the past', () => {
    const now = new Date(2026, 10, 24);
    expect(isExpiryValid('11/26', now)).toBe(true);
    expect(isExpiryValid('10/26', now)).toBe(false);
    expect(isExpiryValid('13/30', now)).toBe(false);
  });
  it('UPI: name@bank', () => {
    expect(isValidUpi('riya@okdemo')).toBe(true);
    expect(isValidUpi('fail@upi')).toBe(true);
    expect(isValidUpi('riya')).toBe(false);
  });
});
