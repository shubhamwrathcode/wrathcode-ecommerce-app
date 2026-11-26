import { RULES } from '@/config/rules';

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const randomDelay = () =>
  RULES.api.minDelayMs +
  Math.floor(Math.random() * (RULES.api.maxDelayMs - RULES.api.minDelayMs));

/**
 * Simulates a network round-trip (300–800 ms). In Phase 2 each service swaps
 * the body of its functions for a real HTTP call; signatures stay the same.
 */
export async function simulate<T>(
  fn: () => T | Promise<T>,
  delayMs: number = randomDelay(),
): Promise<T> {
  await wait(delayMs);
  const result = await fn();
  // Deep clone so callers can never mutate the "server" data.
  return result === undefined
    ? result
    : (JSON.parse(JSON.stringify(result)) as T);
}
