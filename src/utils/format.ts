import { RULES } from '@/config/rules';

/** Indian digit grouping: 124999 -> "1,24,999". */
export function formatIndianNumber(value: number): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const hasDecimals = Math.round(abs * 100) % 100 !== 0;
  const [intPart, decPart] = abs.toFixed(hasDecimals ? 2 : 0).split('.');
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`
    : last3;
  return `${negative ? '-' : ''}${grouped}${decPart ? `.${decPart}` : ''}`;
}

/** "₹1,24,999" — no decimals unless needed (section 7.1). */
export function formatPrice(value: number): string {
  return `${RULES.currency.symbol}${formatIndianNumber(value)}`;
}

export function formatCount(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (
    (parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')
  ).toUpperCase();
}

export function maskMobile(mobile: string): string {
  return mobile.length === 10
    ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`
    : mobile;
}

/** Template interpolation: tf('Add {amount} more', { amount: '₹40' }). */
export function tf(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
