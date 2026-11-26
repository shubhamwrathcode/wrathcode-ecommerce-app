import { mock } from '@/mock';
import { addDaysSkippingSundays, formatDeliveryDate } from '@/utils/date';
import { checkServiceability, estimateDeliveryDate } from '@/utils/delivery';

const data = mock.pincodes;

describe('pincode serviceability (7.6)', () => {
  it('metro pincodes: 2 days with express', () => {
    const s = checkServiceability('560034', data);
    expect(s).toMatchObject({
      serviceable: true,
      zone: 'metro',
      standardDays: 2,
      expressAvailable: true,
      expressDays: 1,
    });
  });
  it('other listed pincodes: 4-5 days, no express', () => {
    const s = checkServiceability('302001', data);
    expect(s.serviceable && s.zone).toBe('listed');
    expect(s.serviceable && [4, 5].includes(s.standardDays)).toBe(true);
    expect(s.serviceable && s.expressAvailable).toBe(false);
  });
  it('unlisted valid pincodes: 6 days', () => {
    expect(checkServiceability('263001', data)).toMatchObject({
      serviceable: true,
      zone: 'other',
      standardDays: 6,
    });
  });
  it('not serviceable and invalid pincodes', () => {
    expect(checkServiceability('999999', data)).toEqual({
      serviceable: false,
      reason: 'not_serviceable',
    });
    expect(checkServiceability('12345', data)).toEqual({
      serviceable: false,
      reason: 'invalid',
    });
  });
});

describe('delivery dates skip Sundays', () => {
  it('Saturday + 1 day lands on Monday', () => {
    const sat = new Date(2026, 10, 28); // Sat 28 Nov 2026
    expect(addDaysSkippingSundays(sat, 1).getDay()).toBe(1);
  });
  it('formats as "Thu, 26 Nov"', () => {
    expect(formatDeliveryDate(new Date(2026, 10, 26))).toBe('Thu, 26 Nov');
  });
  it('express is one day earlier for metros', () => {
    const from = new Date(2026, 10, 24); // Tue
    const s = checkServiceability('110001', data);
    expect(estimateDeliveryDate(s, 'standard', from)!.getDate()).toBe(26);
    expect(estimateDeliveryDate(s, 'express', from)!.getDate()).toBe(25);
  });
});
