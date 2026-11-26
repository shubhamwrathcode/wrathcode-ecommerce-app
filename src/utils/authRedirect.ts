/**
 * Remembers what a guest was trying to do when we asked them to login
 * (Flow E: guest taps Checkout > Login > back to checkout with cart kept).
 */
let pending: (() => void) | null = null;

export const authRedirect = {
  set(fn: () => void) {
    pending = fn;
  },
  clear() {
    pending = null;
  },
  consume() {
    const fn = pending;
    pending = null;
    return fn;
  },
};
